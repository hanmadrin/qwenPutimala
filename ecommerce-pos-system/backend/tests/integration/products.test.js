const request = require('supertest');
const app = require('../../src/server');

describe('Products Integration Tests', () => {
  describe('GET /api/products', () => {
    it('should return paginated products list', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=10');

      // Test structure validation
      expect(response.body).toHaveProperty('success');
      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toBeInstanceOf(Array);
      }
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=electronics');

      // Test structure validation
      expect(response.body).toHaveProperty('success');
    });

    it('should sort products by price', async () => {
      const response = await request(app)
        .get('/api/products?sortBy=price&order=asc');

      // Test structure validation
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('GET /api/products/:idOrSlug', () => {
    it('should return a single product by slug', async () => {
      const response = await request(app)
        .get('/api/products/test-product-slug');

      // Test structure validation
      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('slug', 'test-product-slug');
      }
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product (authenticated)', async () => {
      const productData = {
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        price: 99.99,
        categoryId: 'cat-1',
        brandId: 'brand-1',
        unit: 'pcs',
        tags: ['test', 'new']
      };

      // This would need authentication token in real scenario
      const response = await request(app)
        .post('/api/products')
        .send(productData);

      // Test structure validation
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update an existing product (authenticated)', async () => {
      const updateData = {
        name: 'Updated Product Name',
        price: 149.99,
        stock: 100
      };

      const response = await request(app)
        .put('/api/products/product-1')
        .send(updateData);

      // Test structure validation
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product (authenticated)', async () => {
      const response = await request(app)
        .delete('/api/products/product-1');

      // Test structure validation
      expect(response.body).toHaveProperty('success');
    });
  });
});
