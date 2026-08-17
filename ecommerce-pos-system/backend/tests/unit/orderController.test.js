const orderController = require('../../src/controllers/orderController');

// Mock Prisma client
const mockPrisma = {
  order: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn()
  },
  orderItem: {
    createMany: jest.fn()
  }
};

jest.mock('../../src/config/database.js', () => ({
  __esModule: true,
  default: mockPrisma
}));

describe('Order Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should return paginated orders list', async () => {
      const mockOrders = [
        { id: 'order-1', orderId: 'ORD-001', totalAmount: 500, status: 'PENDING' },
        { id: 'order-2', orderId: 'ORD-002', totalAmount: 750, status: 'COMPLETED' }
      ];

      const mockReq = {
        query: {
          page: '1',
          limit: '10'
        },
        user: {
          role: 'SUPERADMIN'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockPrisma.order.findMany.mockResolvedValue(mockOrders);
      mockPrisma.order.count.mockResolvedValue(2);

      await orderController.getOrders(mockReq, mockRes);

      expect(mockPrisma.order.findMany).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockOrders
        })
      );
    });

    it('should filter orders by status', async () => {
      const mockReq = {
        query: {
          status: 'PENDING'
        },
        user: {
          role: 'SUPERADMIN'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(0);

      await orderController.getOrders(mockReq, mockRes);

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING'
          })
        })
      );
    });
  });

  describe('createOrder', () => {
    it('should create a new online order', async () => {
      const orderData = {
        customerId: 'customer-1',
        shippingInfo: {
          address: '123 Test St',
          city: 'Dhaka',
          division: 'Dhaka',
          phone: '01712345678'
        },
        items: [
          { productId: 'prod-1', quantity: 2, price: 100 },
          { productId: 'prod-2', quantity: 1, price: 200 }
        ],
        paymentMethod: 'COD'
      };

      const mockReq = {
        body: orderData,
        user: {
          id: 'customer-1',
          role: 'CUSTOMER'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const createdOrder = {
        id: 'order-new',
        orderId: 'ORD-NEW',
        ...orderData,
        totalAmount: 400
      };

      mockPrisma.order.create.mockResolvedValue(createdOrder);

      await orderController.createOrder(mockReq, mockRes);

      expect(mockPrisma.order.create).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: createdOrder
        })
      );
    });

    it('should create a walk-in order', async () => {
      const orderData = {
        type: 'WALK_IN',
        branchId: 'branch-1',
        customerId: null,
        customerName: 'Walk-in Customer',
        customerPhone: '01712345678',
        items: [
          { productId: 'prod-1', quantity: 1, price: 150 }
        ],
        paymentMethod: 'CASH',
        paymentStatus: 'PAID'
      };

      const mockReq = {
        body: orderData,
        user: {
          id: 'user-1',
          role: 'CASHIER',
          branchId: 'branch-1'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const createdOrder = {
        id: 'order-walkin',
        orderId: 'WALKIN-001',
        ...orderData
      };

      mockPrisma.order.create.mockResolvedValue(createdOrder);

      await orderController.createOrder(mockReq, mockRes);

      expect(mockPrisma.order.create).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: createdOrder
        })
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const mockReq = {
        params: {
          id: 'order-1'
        },
        body: {
          status: 'PROCESSING'
        },
        user: {
          role: 'SUPERADMIN'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const updatedOrder = {
        id: 'order-1',
        orderId: 'ORD-001',
        status: 'PROCESSING'
      };

      mockPrisma.order.update.mockResolvedValue(updatedOrder);

      await orderController.updateOrderStatus(mockReq, mockRes);

      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'PROCESSING' }
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: updatedOrder
        })
      );
    });
  });
});
