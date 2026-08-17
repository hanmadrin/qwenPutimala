const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = new PrismaClient();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// POST /api/customers/register - Register new customer with OTP
exports.registerCustomer = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
    }

    // Check if phone already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone }
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this phone number already exists'
      });
    }

    // Hash password if provided
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || null,
        passwordHash
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { customerId: customer.id, phone: customer.phone },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email
      },
      token
    });
  } catch (error) {
    console.error('Error registering customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register customer',
      error: error.message
    });
  }
};

// POST /api/customers/login-with-otp - Request OTP for login
exports.requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { phone }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found. Please register first.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // In production, send OTP via SMS service (Twilio, etc.)
    // For now, we'll store it and return it in development
    console.log(`📱 OTP for ${phone}: ${otp}`);

    // Store OTP hash in a temporary store (in production, use Redis)
    // For simplicity, we're just logging it here

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // In development only - remove in production
      development_otp: otp
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message
    });
  }
};

// POST /api/customers/verify-otp - Verify OTP and login
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { phone }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // In production, verify OTP against stored hash from Redis/database
    // For development, we'll accept any 6-digit OTP
    if (otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP format'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { customerId: customer.id, phone: customer.phone },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email
      },
      token
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
};

// POST /api/customers/login - Login with password
exports.loginCustomer = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone and password are required'
      });
    }

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { phone }
    });

    if (!customer || !customer.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, customer.passwordHash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { customerId: customer.id, phone: customer.phone },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email
      },
      token
    });
  } catch (error) {
    console.error('Error logging in customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message
    });
  }
};

// GET /api/customers/profile - Get customer profile
exports.getProfile = async (req, res) => {
  try {
    // Customer ID from auth middleware
    const customerId = req.customerId;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            total: true,
            createdAt: true
          }
        },
        customerAddresses: {
          select: {
            id: true,
            label: true,
            addressLine1: true,
            addressLine2: true,
            area: true,
            city: true,
            postcode: true,
            isDefault: true
          }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// PUT /api/customers/profile - Update customer profile
exports.updateProfile = async (req, res) => {
  try {
    const customerId = req.customerId;
    const { name, email } = req.body;

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        name: name,
        email: email
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// GET /api/customers/orders - Get customer orders
exports.getOrders = async (req, res) => {
  try {
    const customerId = req.customerId;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const where = { customerId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          branch: { select: { id: true, name: true } },
          orderItems: {
            take: 3,
            select: {
              productName: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true
            }
          },
          _count: { select: { orderItems: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};
