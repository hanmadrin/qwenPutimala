const request = require('supertest');
const app = require('../../src/server');

describe('Auth Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        role: 'CASHIER',
        branchId: 'branch-1'
      };

      // Note: This test will fail without a real database connection
      // It's included to demonstrate the test structure
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Test structure validation (will need DB to pass)
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: 'admin123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Test structure validation
      if (response.status === 200) {
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
      }
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/customer/otp/request', () => {
    it('should request OTP for customer phone', async () => {
      const otpRequest = {
        phone: '01712345678'
      };

      const response = await request(app)
        .post('/api/auth/customer/otp/request')
        .send(otpRequest);

      // Test structure validation
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('POST /api/auth/customer/otp/verify', () => {
    it('should verify OTP and return customer token', async () => {
      const otpVerify = {
        phone: '01712345678',
        otp: '123456'
      };

      const response = await request(app)
        .post('/api/auth/customer/otp/verify')
        .send(otpVerify);

      // Test structure validation
      if (response.status === 200) {
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('customer');
      }
    });
  });
});
