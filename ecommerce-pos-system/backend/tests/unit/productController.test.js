const productController = require('../../src/controllers/productController');

// Mock Prisma client
const mockPrisma = {
  product: {
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

describe('Product Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return paginated products list', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 100, slug: 'product-1' },
        { id: '2', name: 'Product 2', price: 200, slug: 'product-2' }
      ];

      const mockReq = {
        query: {
          page: '1',
          limit: '10'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(2);

      await productController.getProducts(mockReq, mockRes);

      expect(mockPrisma.product.findMany).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockProducts
        })
      );
    });

    it('should handle filters correctly', async () => {
      const mockReq = {
        query: {
          category: 'electronics',
          brand: 'brand-1',
          minPrice: '50',
          maxPrice: '500'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      await productController.getProducts(mockReq, mockRes);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object)
        })
      );
    });
  });

  describe('getProductByIdOrSlug', () => {
    it('should return a single product', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 100,
        slug: 'test-product',
        description: 'Test description'
      };

      const mockReq = {
        params: {
          idOrSlug: 'test-product'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);

      await productController.getProductByIdOrSlug(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockProduct
        })
      );
    });

    it('should return 404 for non-existent product', async () => {
      const mockReq = {
        params: {
          idOrSlug: 'non-existent'
        }
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      mockPrisma.product.findUnique.mockResolvedValue(null);

      await productController.getProductByIdOrSlug(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Product not found'
        })
      );
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'New Product',
        price: 150,
        categoryId: 'cat-1',
        brandId: 'brand-1'
      };

      const mockReq = {
        body: productData
      };

      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const createdProduct = { id: 'new-id', ...productData };
      mockPrisma.product.create.mockResolvedValue(createdProduct);

      await productController.createProduct(mockReq, mockRes);

      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining(productData)
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: createdProduct
        })
      );
    });
  });
});
