const jwt = require('jsonwebtoken');
const { User, Customer } = require('@prisma/client');

// Admin/User authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's a customer token or admin token
    if (decoded.customerId) {
      // Customer token
      const customer = await Customer.findUnique({
        where: { id: decoded.customerId },
      });

      if (!customer) {
        return res.status(401).json({
          success: false,
          message: 'Customer not found, authorization denied',
        });
      }

      // Attach customer to request
      req.customerId = customer.id;
      req.customer = {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      };
    } else {
      // Admin/User token
      const user = await User.findUnique({
        where: { id: decoded.id },
        include: {
          branch: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found, authorization denied',
        });
      }

      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'User account is inactive',
        });
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
        branch: user.branch,
      };
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    next(error);
  }
};

module.exports = authMiddleware;
