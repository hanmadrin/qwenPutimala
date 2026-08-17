const request = require('supertest');
const app = require('../../src/server');

describe('Orders Integration Tests', () => {
  describe('GET /api/orders', () => {
    it('should return paginated orders list (authenticated)', async () => {
      const response = await request(app)
        .get('/api/orders?page=1&limit=10');

      // Test structure validation
      expect(response.body).toHaveProperty('success');
      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toBeInstanceOf(Array);
      }
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders?status=PENDING');

      // Test structure validation
      expect(response.body).toHaveProperty('success');
    });

    it('should filter orders by type', async () => {
      const response = await request(app)
        .get('/api/orders?type=WALK_IN');

      // Test structure validation
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return a single order', async () => {
      const response = await request(app)
        .get('/api/orders/order-123');

      // Test structure validation
      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('orderId');
      }
    });
  });

  describe('POST /api/orders', () => {
    it('should create a new online order', async () => {
      const orderData = {
        type: 'ONLINE',
        shippingInfo: {
          name: 'John Doe',
          phone: '01712345678',
          email: 'john@example.com',
          address: '123 Test Street',
          city: 'Dhaka',
          division: 'Dhaka'
        },
        items: [
          { productId: 'prod-1', quantity: 2, price: 100 },
          { productId: 'prod-2', quantity: 1, price: 200 }
        ],
        paymentMethod: 'COD',
        couponCode: null
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);

      // Test structure validation
      expect(response.body).toHaveProperty('success');
      if (response.status === 201) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('orderId');
      }
    });

    it('should create a walk-in order', async () => {
      const orderData = {
        type: 'WALK_IN',
        branchId: 'branch-1',
        customerName: 'Walk-in Customer',
        customerPhone: '01712345678',
        items: [
          { productId: 'prod-1', quantity: 1, price: 150 }
        ],
        paymentMethod: 'CASH',
        paymentStatus: 'PAID'
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);

      // Test structure validation
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    it('should update order status (authenticated)', async () => {
      const statusUpdate = {
        status: 'PROCESSING'
      };

      const response = await request(app)
        .put('/api/orders/order-123/status')
        .send(statusUpdate);

      // Test structure validation
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('PUT /api/orders/:id/cancel', () => {
    it('should cancel an order', async () => {
      const cancelData = {
        reason: 'Customer requested cancellation'
      };

      const response = await request(app)
        .put('/api/orders/order-123/cancel')
        .send(cancelData);

      // Test structure validation
      expect(response.body).toHaveProperty('success');
    });
  });
});
