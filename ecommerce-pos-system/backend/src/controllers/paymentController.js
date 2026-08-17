const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const axios = require('axios');
const prisma = new PrismaClient();

// SSLCommerz configuration
const SSLCOMMERZ_CONFIG = {
  storeId: process.env.SSL_STORE_ID,
  storePasswd: process.env.SSL_STORE_PASSWD,
  isLive: process.env.SSL_IS_LIVE === 'true',
  initUrl: process.env.SSL_INIT_URL || 'https://sandbox.sslcommerz.com/gwprocess/v3/api.php',
  validatorUrl: process.env.SSL_VALIDATOR_URL || 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php',
};

// Initialize SSLCommerz payment
exports.initiateSSLCommerzPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        customer: true,
        orderItems: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentMethod !== 'sslcommerz') {
      return res.status(400).json({
        success: false,
        message: 'Order payment method is not SSLCommerz'
      });
    }

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Prepare payment data for SSLCommerz
    const paymentData = {
      store_id: SSLCOMMERZ_CONFIG.storeId,
      store_passwd: SSLCOMMERZ_CONFIG.storePasswd,
      tran_id: transactionId,
      success_url: `${process.env.API_URL}/api/payments/sslcommerz/success`,
      fail_url: `${process.env.API_URL}/api/payments/sslcommerz/fail`,
      cancel_url: `${process.env.API_URL}/api/payments/sslcommerz/cancel`,
      ipn_url: `${process.env.API_URL}/api/payments/sslcommerz/ipn`,
      currency: 'BDT',
      amount: order.total.toFixed(2),
      cus_name: order.shippingName,
      cus_email: order.customer?.email || order.shippingName.replace(/\s+/g, '').toLowerCase() + '@example.com',
      cus_add1: order.shippingAddressLine1,
      cus_add2: order.shippingArea,
      cus_city: order.shippingCity,
      cus_state: order.shippingCity,
      cus_postcode: order.shippingPostcode || '1000',
      cus_country: 'Bangladesh',
      cus_phone: order.shippingPhone,
      shipping_method: 'Courier',
      product_name: order.orderItems.map(item => item.productName).join(', '),
      product_category: 'General',
      product_profile: 'general',
      value_a: orderId.toString(), // Store order ID
      value_b: transactionId, // Store transaction ID
    };

    // Send request to SSLCommerz
    const response = await axios.post(SSLCOMMERZ_CONFIG.initUrl, paymentData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data && response.data.GatewayPageURL) {
      // Create payment record
      await prisma.payment.create({
        data: {
          orderId: parseInt(orderId),
          method: 'sslcommerz',
          transactionId,
          amount: order.total,
          status: 'pending',
          metadata: {
            sslcommerz_response: response.data
          }
        }
      });

      res.json({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          gatewayUrl: response.data.GatewayPageURL,
          transactionId,
          amount: order.total
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to initiate payment with SSLCommerz',
        error: response.data
      });
    }
  } catch (error) {
    console.error('Error initiating SSLCommerz payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
};

// SSLCommerz success callback
exports.sslcommerzSuccess = async (req, res) => {
  try {
    const { val_id } = req.query;

    if (!val_id) {
      return res.status(400).json({
        success: false,
        message: 'Validation ID is required'
      });
    }

    // Validate payment with SSLCommerz
    const validationData = {
      store_id: SSLCOMMERZ_CONFIG.storeId,
      store_passwd: SSLCOMMERZ_CONFIG.storePasswd,
      val_id
    };

    const response = await axios.post(SSLCOMMERZ_CONFIG.validatorUrl, validationData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data && response.data.status === 'VALID') {
      const orderId = parseInt(response.data.value_a);
      const transactionId = response.data.bank_tran_id;

      // Update payment record
      await prisma.$transaction(async (tx) => {
        await tx.payment.updateMany({
          where: {
            transactionId: { contains: transactionId }
          },
          data: {
            status: 'success',
            transactionId: response.data.bank_tran_id,
            metadata: {
              sslcommerz_validation: response.data
            }
          }
        });

        // Update order payment status
        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'paid'
          }
        });
      });

      // Redirect to frontend success page
      res.redirect(`${process.env.STOREFRONT_URL}/payment/success?orderId=${orderId}`);
    } else {
      res.redirect(`${process.env.STOREFRONT_URL}/payment/fail?message=Payment validation failed`);
    }
  } catch (error) {
    console.error('Error processing SSLCommerz success:', error);
    res.redirect(`${process.env.STOREFRONT_URL}/payment/fail?message=Payment processing error`);
  }
};

// SSLCommerz fail callback
exports.sslcommerzFail = async (req, res) => {
  try {
    const { val_id } = req.query;

    if (val_id) {
      // Update payment status to failed
      await prisma.payment.updateMany({
        where: {
          transactionId: { contains: val_id }
        },
        data: {
          status: 'failed'
        }
      });
    }

    res.redirect(`${process.env.STOREFRONT_URL}/payment/fail?message=Payment failed`);
  } catch (error) {
    console.error('Error processing SSLCommerz fail:', error);
    res.redirect(`${process.env.STOREFRONT_URL}/payment/fail?message=Payment processing error`);
  }
};

// SSLCommerz cancel callback
exports.sslcommerzCancel = async (req, res) => {
  try {
    const { val_id } = req.query;

    if (val_id) {
      // Update payment status to cancelled
      await prisma.payment.updateMany({
        where: {
          transactionId: { contains: val_id }
        },
        data: {
          status: 'cancelled'
        }
      });
    }

    res.redirect(`${process.env.STOREFRONT_URL}/payment/cancel?message=Payment cancelled`);
  } catch (error) {
    console.error('Error processing SSLCommerz cancel:', error);
    res.redirect(`${process.env.STOREFRONT_URL}/payment/cancel?message=Payment processing error`);
  }
};

// SSLCommerz IPN (Instant Payment Notification)
exports.sslcommerzIPN = async (req, res) => {
  try {
    const { val_id } = req.query;

    if (!val_id) {
      return res.status(400).json({
        success: false,
        message: 'Validation ID is required'
      });
    }

    // Validate payment with SSLCommerz
    const validationData = {
      store_id: SSLCOMMERZ_CONFIG.storeId,
      store_passwd: SSLCOMMERZ_CONFIG.storePasswd,
      val_id
    };

    const response = await axios.post(SSLCOMMERZ_CONFIG.validatorUrl, validationData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data && response.data.status === 'VALID') {
      const orderId = parseInt(response.data.value_a);

      // Update payment and order
      await prisma.$transaction(async (tx) => {
        await tx.payment.updateMany({
          where: {
            transactionId: { contains: response.data.bank_tran_id }
          },
          data: {
            status: 'success',
            transactionId: response.data.bank_tran_id,
            metadata: {
              sslcommerz_ipn: response.data
            }
          }
        });

        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'paid'
          }
        });
      });

      res.json({
        success: true,
        message: 'Payment validated via IPN'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment validation failed'
      });
    }
  } catch (error) {
    console.error('Error processing SSLCommerz IPN:', error);
    res.status(500).json({
      success: false,
      message: 'IPN processing error',
      error: error.message
    });
  }
};

// Record cash/COD payment
exports.recordCashPayment = async (req, res) => {
  try {
    const { orderId, amount, note } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and amount are required'
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: parseInt(orderId),
        method: order.paymentMethod,
        transactionId: null,
        amount: parseFloat(amount),
        status: 'success',
        metadata: {
          note: note || null,
          recordedBy: req.user?.id
        }
      }
    });

    // Update order payment status
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        paymentStatus: amount >= order.total ? 'paid' : 'partial'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Cash payment recorded successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error recording cash payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message
    });
  }
};

// Get payments for an order
exports.getOrderPayments = async (req, res) => {
  try {
    const { orderId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { orderId: parseInt(orderId) },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get all payments with filtering
exports.getPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      method,
      orderId,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (method) {
      where.method = method;
    }

    if (orderId) {
      where.orderId = parseInt(orderId);
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        include: {
          order: {
            select: {
              orderNumber: true,
              total: true,
              customer: {
                select: {
                  name: true,
                  phone: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get payment statistics
exports.getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalAmount,
      paymentsByMethod
    ] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.count({ where: { ...where, status: 'success' } }),
      prisma.payment.count({ where: { ...where, status: 'failed' } }),
      prisma.payment.count({ where: { ...where, status: 'pending' } }),
      prisma.payment.aggregate({
        where: { ...where, status: 'success' },
        _sum: { amount: true }
      }),
      prisma.payment.groupBy({
        by: ['method'],
        where,
        _count: true,
        _sum: { amount: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalPayments,
        successfulPayments,
        failedPayments,
        pendingPayments,
        totalAmount: totalAmount._sum.amount || 0,
        paymentsByMethod: paymentsByMethod.map(item => ({
          method: item.method,
          count: item._count,
          totalAmount: item._sum.amount || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics',
      error: error.message
    });
  }
};
