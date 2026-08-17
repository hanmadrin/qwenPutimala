const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// SMS Gateway configuration (example with SSL Wireless - replace with actual SMS provider)
const SMS_CONFIG = {
  apiBaseUrl: process.env.SMS_API_URL || 'https://api.sslwireless.com',
  apiKey: process.env.SMS_API_KEY,
  senderId: process.env.SMS_SENDER_ID || 'ECOMPOS',
};

// Send SMS notification
exports.sendSMS = async (req, res) => {
  try {
    const { phone, message, type } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }

    // Validate Bangladesh phone number format
    const phoneRegex = /^(?:\+88|0088)?01[3-9]\d{8}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Bangladesh phone number format'
      });
    }

    // Prepare SMS data for gateway API
    const smsData = {
      api_key: SMS_CONFIG.apiKey,
      type: 'text',
      contacts: phone,
      senderid: SMS_CONFIG.senderId,
      msg: message
    };

    let smsResponse = null;
    let messageId = null;

    // Send SMS via gateway
    try {
      const response = await axios.post(
        `${SMS_CONFIG.apiBaseUrl}/sms/send`,
        smsData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.success) {
        messageId = response.data.message_id;
        smsResponse = response.data;
      }
    } catch (error) {
      console.error('SMS Gateway error:', error.message);
      // Continue to save SMS record even if gateway fails
    }

    // Save SMS record in database
    const smsRecord = await prisma.sMS.create({
      data: {
        orderId: req.body.orderId ? parseInt(req.body.orderId) : null,
        customerId: req.body.customerId ? parseInt(req.body.customerId) : null,
        phone,
        message,
        type: type || 'transactional',
        status: smsResponse?.success ? 'sent' : 'failed',
        messageId,
        metadata: smsResponse || {}
      }
    });

    res.status(201).json({
      success: true,
      message: 'SMS sent successfully',
      data: smsRecord
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send SMS',
      error: error.message
    });
  }
};

// Send order confirmation SMS
exports.sendOrderConfirmationSMS = async (req, res) => {
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
          take: 3,
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        },
        branch: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const phone = order.shippingPhone || order.customer?.phone;
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'No phone number available for this order'
      });
    }

    // Compose SMS message
    const message = `Order Confirmed! ${order.orderNumber}. Total: ৳${order.total}. ${order.branch.name}. Track: bit.ly/track-${order.id}`;

    // Send SMS
    const result = await exports.sendSMS({
      body: {
        phone,
        message,
        type: 'order_confirmation',
        orderId,
        customerId: order.customerId
      }
    }, {
      status: () => ({ json: (data) => data }),
      json: (data) => data
    });

    res.json({
      success: true,
      message: 'Order confirmation SMS sent',
      data: result
    });
  } catch (error) {
    console.error('Error sending order confirmation SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send order confirmation SMS',
      error: error.message
    });
  }
};

// Send OTP SMS
exports.sendOTPSMS = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Compose OTP message
    const message = `Your OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`;

    // Send SMS
    const result = await exports.sendSMS({
      body: {
        phone,
        message,
        type: 'otp'
      }
    }, {
      status: () => ({ json: (data) => data }),
      json: (data) => data
    });

    res.json({
      success: true,
      message: 'OTP SMS sent',
      data: result
    });
  } catch (error) {
    console.error('Error sending OTP SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP SMS',
      error: error.message
    });
  }
};

// Send delivery notification SMS
exports.sendDeliveryNotificationSMS = async (req, res) => {
  try {
    const { orderId, status } = req.body;

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
        shipments: true,
        customer: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const phone = order.shippingPhone || order.customer?.phone;
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'No phone number available for this order'
      });
    }

    const shipment = order.shipments[0];
    let message = '';

    switch (status) {
      case 'shipped':
        message = `Order ${order.orderNumber} shipped! Tracking: ${shipment?.trackingNumber || 'N/A'}. Expected delivery: 2-3 days.`;
        break;
      case 'out_for_delivery':
        message = `Order ${order.orderNumber} out for delivery today. Keep phone reachable. Thank you!`;
        break;
      case 'delivered':
        message = `Order ${order.orderNumber} delivered successfully. Thank you for shopping with us!`;
        break;
      default:
        message = `Order ${order.orderNumber} update: ${status}. Track: bit.ly/track-${order.id}`;
    }

    // Send SMS
    const result = await exports.sendSMS({
      body: {
        phone,
        message,
        type: 'delivery_notification',
        orderId,
        customerId: order.customerId
      }
    }, {
      status: () => ({ json: (data) => data }),
      json: (data) => data
    });

    res.json({
      success: true,
      message: 'Delivery notification SMS sent',
      data: result
    });
  } catch (error) {
    console.error('Error sending delivery notification SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send delivery notification SMS',
      error: error.message
    });
  }
};

// Send promotional SMS
exports.sendPromotionalSMS = async (req, res) => {
  try {
    const { customerIds, message } = req.body;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer IDs array is required'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get customer phone numbers
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds.map(id => parseInt(id)) }
      },
      select: {
        id: true,
        name: true,
        phone: true
      }
    });

    const results = [];
    for (const customer of customers) {
      try {
        const personalizedMessage = `Hi ${customer.name}, ${message}`;
        const result = await exports.sendSMS({
          body: {
            phone: customer.phone,
            message: personalizedMessage,
            type: 'promotional',
            customerId: customer.id
          }
        }, {
          status: () => ({ json: (data) => data }),
          json: (data) => data
        });
        results.push({ customerId: customer.id, success: true, result });
      } catch (error) {
        results.push({ customerId: customer.id, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Promotional SMS batch processed',
      data: {
        total: customerIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    });
  } catch (error) {
    console.error('Error sending promotional SMS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send promotional SMS',
      error: error.message
    });
  }
};

// Get SMS logs
exports.getSMSLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, phone, orderId, startDate, endDate } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (phone) {
      where.phone = { contains: phone, mode: 'insensitive' };
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

    const [smsLogs, total] = await Promise.all([
      prisma.sMS.findMany({
        where,
        skip,
        take,
        include: {
          order: {
            select: {
              orderNumber: true
            }
          },
          customer: {
            select: {
              name: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.sMS.count({ where })
    ]);

    res.json({
      success: true,
      data: smsLogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take
      }
    });
  } catch (error) {
    console.error('Error fetching SMS logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SMS logs',
      error: error.message
    });
  }
};

// Get SMS statistics
exports.getSMSStats = async (req, res) => {
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
      totalSMS,
      sentSMS,
      failedSMS,
      smsByType,
      smsCost
    ] = await Promise.all([
      prisma.sMS.count({ where }),
      prisma.sMS.count({ where: { ...where, status: 'sent' } }),
      prisma.sMS.count({ where: { ...where, status: 'failed' } }),
      prisma.sMS.groupBy({
        by: ['type'],
        where,
        _count: true
      }),
      prisma.sMS.aggregate({
        where: { ...where, status: 'sent' },
        _count: true
      })
    ]);

    res.json({
      success: true,
      data: {
        totalSMS,
        sentSMS,
        failedSMS,
        successRate: totalSMS > 0 ? ((sentSMS / totalSMS) * 100).toFixed(2) : 0,
        smsByType: smsByType.map(item => ({
          type: item.type,
          count: item._count
        })),
        estimatedCost: smsCost._count * 0.50 // Assuming 0.50 BDT per SMS
      }
    });
  } catch (error) {
    console.error('Error fetching SMS stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SMS statistics',
      error: error.message
    });
  }
};
