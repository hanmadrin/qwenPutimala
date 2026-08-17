const couponController = require('../../src/controllers/couponController');

// Mock Prisma client
const mockPrisma = {
  coupon: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  }
};

jest.mock('../../src/config/database.js', () => ({
  __esModule: true,
  default: mockPrisma
}));

describe('Coupon Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCoupon', () => {
    it('should validate a valid coupon', async () => {
      const validCoupon = {
        id: 'coupon-1',
        code: 'SAVE10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 100,
        usageLimit: 100,
        usedCount: 50,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31')
      };

      const mockReq = {
        params: {
          code: 'SAVE10'
        },
        body: {
          orderAmount: 150
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockPrisma.coupon.findUnique.mockResolvedValue(validCoupon);

      await couponController.validateCoupon(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          valid: true
        })
      );
    });

    it('should reject expired coupon', async () => {
      const expiredCoupon = {
        id: 'coupon-2',
        code: 'EXPIRED',
        discountType: 'FIXED',
        discountValue: 20,
        isActive: true,
        validFrom: new Date('2023-01-01'),
        validUntil: new Date('2023-12-31')
      };

      const mockReq = {
        params: {
          code: 'EXPIRED'
        },
        body: {
          orderAmount: 100
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockPrisma.coupon.findUnique.mockResolvedValue(expiredCoupon);

      await couponController.validateCoupon(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          valid: false,
          message: expect.stringContaining('expired')
        })
      );
    });

    it('should reject coupon below minimum order amount', async () => {
      const coupon = {
        id: 'coupon-3',
        code: 'BIG50',
        discountType: 'FIXED',
        discountValue: 50,
        minOrderAmount: 500,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31')
      };

      const mockReq = {
        params: {
          code: 'BIG50'
        },
        body: {
          orderAmount: 300
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockPrisma.coupon.findUnique.mockResolvedValue(coupon);

      await couponController.validateCoupon(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          valid: false,
          message: expect.stringContaining('minimum')
        })
      );
    });

    it('should reject fully used coupon', async () => {
      const usedCoupon = {
        id: 'coupon-4',
        code: 'USEDUP',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        usageLimit: 10,
        usedCount: 10,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31')
      };

      const mockReq = {
        params: {
          code: 'USEDUP'
        },
        body: {
          orderAmount: 200
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockPrisma.coupon.findUnique.mockResolvedValue(usedCoupon);

      await couponController.validateCoupon(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          valid: false,
          message: expect.stringContaining('limit')
        })
      );
    });
  });

  describe('createCoupon', () => {
    it('should create a percentage discount coupon', async () => {
      const couponData = {
        code: 'NEWYEAR20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 200,
        maxDiscountAmount: 100,
        usageLimit: 1000,
        validFrom: '2024-01-01',
        validUntil: '2024-01-31',
        isActive: true
      };

      const mockReq = {
        body: couponData,
        user: {
          id: 'admin-1',
          role: 'SUPERADMIN'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const createdCoupon = { id: 'coupon-new', ...couponData };
      mockPrisma.coupon.create.mockResolvedValue(createdCoupon);

      await couponController.createCoupon(mockReq, mockRes);

      expect(mockPrisma.coupon.create).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: createdCoupon
        })
      );
    });

    it('should create a fixed discount coupon', async () => {
      const couponData = {
        code: 'FLAT50',
        discountType: 'FIXED',
        discountValue: 50,
        minOrderAmount: 300,
        usageLimit: 500,
        validFrom: '2024-02-01',
        validUntil: '2024-02-28',
        isActive: true
      };

      const mockReq = {
        body: couponData
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const createdCoupon = { id: 'coupon-flat', ...couponData };
      mockPrisma.coupon.create.mockResolvedValue(createdCoupon);

      await couponController.createCoupon(mockReq, mockRes);

      expect(mockPrisma.coupon.create).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: createdCoupon
        })
      );
    });
  });
});
