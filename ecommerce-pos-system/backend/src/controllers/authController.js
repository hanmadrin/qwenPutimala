const authService = require('../services/authService');
const { ActivityLog } = require('@prisma/client');

const authController = {
  // Login
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      const result = await authService.loginAdmin(email, password);

      // Log activity
      await ActivityLog.create({
        data: {
          userId: result.user.id,
          action: 'admin_login',
          entityType: 'User',
          entityId: result.user.id,
          details: { email: result.user.email },
        },
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      if (error.message === 'Invalid credentials' || error.message === 'Account is inactive') {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  // Register new admin
  register: async (req, res, next) => {
    try {
      // Only superadmin can register new admins
      if (req.user.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Only superadmin can register new users',
        });
      }

      const { name, email, phone, password, role, branchId } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, password, and role are required',
        });
      }

      const user = await authService.registerAdmin(
        { name, email, phone, password, role, branchId },
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      if (error.message === 'Email already registered') {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  // Get profile
  getProfile: async (req, res, next) => {
    try {
      const profile = await authService.getProfile(req.user.id);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  // Update profile
  updateProfile: async (req, res, next) => {
    try {
      const { name, phone } = req.body;

      const updatedUser = await authService.updateProfile(req.user.id, {
        name,
        phone,
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  // Change password
  changePassword: async (req, res, next) => {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Old password and new password are required',
        });
      }

      const result = await authService.changePassword(
        req.user.id,
        oldPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  // Refresh token
  refreshToken: async (req, res, next) => {
    try {
      const jwt = require('jsonwebtoken');

      const newToken = jwt.sign(
        { id: req.user.id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.status(200).json({
        success: true,
        data: { token: newToken },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
