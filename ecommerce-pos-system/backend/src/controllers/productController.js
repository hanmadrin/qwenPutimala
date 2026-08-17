const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/products - Get all products with filtering, sorting, pagination
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      brand,
      status,
      featured,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const where = {};

    // Search filter
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameBn: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Category filter
    if (category) {
      where.categoryId = parseInt(category);
    }

    // Brand filter
    if (brand) {
      where.brandId = parseInt(brand);
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Featured filter
    if (featured !== undefined) {
      where.featured = featured === 'true';
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          category: { select: { id: true, nameEn: true, nameBn: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true } },
          productImages: { select: { id: true, imageUrl: true, altText: true, sortOrder: true } },
          _count: { select: { productVariants: true } }
        },
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
};

// GET /api/products/:id - Get single product by ID or slug
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: parseInt(id) },
          { slug: id }
        ]
      },
      include: {
        category: { select: { id: true, nameEn: true, nameBn: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
        productImages: { 
          select: { id: true, imageUrl: true, altText: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' }
        },
        productVariants: {
          include: {
            branchStock: {
              include: {
                branch: { select: { id: true, name: true, code: true } }
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product', error: error.message });
  }
};

// POST /api/products - Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      nameEn,
      nameBn,
      slug,
      shortDescriptionEn,
      shortDescriptionBn,
      descriptionEn,
      descriptionBn,
      price,
      discountPrice,
      categoryId,
      brandId,
      sku,
      barcode,
      weightKg,
      dimensionsCm,
      status = 'active',
      featured = false,
      isNewArrival = false,
      metaTitle,
      metaDescription,
      tags,
      images,
      variants
    } = req.body;

    // Validate required fields
    if (!nameEn || !nameBn || !slug || !price || !categoryId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: nameEn, nameBn, slug, price, categoryId' 
      });
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) {
      return res.status(400).json({ success: false, message: 'Product with this slug already exists' });
    }

    // Create product with nested relations
    const product = await prisma.product.create({
      data: {
        nameEn,
        nameBn,
        slug,
        shortDescriptionEn,
        shortDescriptionBn,
        descriptionEn,
        descriptionBn,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        categoryId: parseInt(categoryId),
        brandId: brandId ? parseInt(brandId) : null,
        sku,
        barcode,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        dimensionsCm,
        status,
        featured,
        isNewArrival,
        metaTitle,
        metaDescription,
        // Connect tags
        tags: tags ? {
          connect: tags.map(tagId => ({ id: parseInt(tagId) }))
        } : undefined,
        // Create product images
        productImages: images ? {
          create: images.map((img, index) => ({
            imageUrl: img.imageUrl,
            altText: img.altText || nameEn,
            sortOrder: img.sortOrder || index
          }))
        } : undefined,
        // Create variants
        productVariants: variants ? {
          create: variants.map(variant => ({
            sku: variant.sku,
            barcode: variant.barcode,
            attributes: variant.attributes || {},
            priceOverride: variant.priceOverride ? parseFloat(variant.priceOverride) : null,
            image: variant.image,
            sortOrder: variant.sortOrder || 0,
            status: variant.status || 'active'
          }))
        } : undefined
      },
      include: {
        category: true,
        brand: true,
        tags: true,
        productImages: true,
        productVariants: true
      }
    });

    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
};

// PUT /api/products/:id - Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.discountPrice) updateData.discountPrice = parseFloat(updateData.discountPrice);
    if (updateData.weightKg) updateData.weightKg = parseFloat(updateData.weightKg);
    if (updateData.categoryId) updateData.categoryId = parseInt(updateData.categoryId);
    if (updateData.brandId) updateData.brandId = parseInt(updateData.brandId);

    // Handle tags disconnect/connect
    if (updateData.tags) {
      updateData.tags = {
        set: updateData.tags.map(tagId => ({ id: parseInt(tagId) }))
      };
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
        brand: true,
        tags: true,
        productImages: true,
        productVariants: true
      }
    });

    res.json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
  }
};

// DELETE /api/products/:id - Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete product (cascade will handle related records)
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
  }
};

// GET /api/products/featured - Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await prisma.product.findMany({
      where: {
        featured: true,
        status: 'active'
      },
      include: {
        category: { select: { id: true, nameEn: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        productImages: { 
          select: { imageUrl: true, altText: true },
          orderBy: { sortOrder: 'asc' },
          take: 1
        }
      },
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch featured products', error: error.message });
  }
};

// GET /api/products/new-arrivals - Get new arrival products
exports.getNewArrivals = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await prisma.product.findMany({
      where: {
        isNewArrival: true,
        status: 'active'
      },
      include: {
        category: { select: { id: true, nameEn: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
        productImages: { 
          select: { imageUrl: true, altText: true },
          orderBy: { sortOrder: 'asc' },
          take: 1
        }
      },
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch new arrivals', error: error.message });
  }
};
