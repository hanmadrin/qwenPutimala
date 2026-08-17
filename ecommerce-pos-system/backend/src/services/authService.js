const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('@prisma/client');

class AuthService {
  // Admin Login
  async loginAdmin(email, password) {
    const user = await User.findUnique({
      where: { email },
      include: {
        branch: true,
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new Error('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branchId: user.branchId,
        branch: user.branch,
      },
    };
  }

  // Register new admin (Superadmin only)
  async registerAdmin(userData, creatorId) {
    const existingUser = await User.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await User.create({
      data: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        role: userData.role,
        branchId: userData.branchId,
        status: 'active',
      },
      include: {
        branch: true,
      },
    });

    return user;
  }

  // Get current user profile
  async getProfile(userId) {
    const user = await User.findUnique({
      where: { id: userId },
      include: {
        branch: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      branchId: user.branchId,
      branch: user.branch,
      status: user.status,
    };
  }

  // Update profile
  async updateProfile(userId, updateData) {
    const user = await User.update({
      where: { id: userId },
      data: {
        name: updateData.name,
        phone: updateData.phone,
      },
      include: {
        branch: true,
      },
    });

    return user;
  }

  // Change password
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }
}

module.exports = new AuthService();
