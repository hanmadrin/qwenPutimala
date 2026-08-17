const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/brands - Get all brands
exports.getBrands = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ];
    }

    const brands = await prisma.brand.findMany({
      where,
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: brands });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch brands', error: error.message });
  }
};

// GET /api/brands/:id - Get single brand by ID or slug
exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findFirst({
      where: {
        OR: [
          { id: parseInt(id) },
          { slug: id }
        ]
      },
      include: {
        products: {
          take: 10,
          where: { status: 'active' },
          select: {
            id: true,
            nameEn: true,
            nameBn: true,
            slug: true,
            price: true,
            discountPrice: true,
            featured: true,
            productImages: {
              take: 1,
              select: { imageUrl: true, altText: true }
            }
          }
        },
        _count: { select: { products: true } }
      }
    });

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    res.json({ success: true, data: brand });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch brand', error: error.message });
  }
};

// POST /api/brands - Create new brand
exports.createBrand = async (req, res) => {
  try {
    const {
      name,
      slug,
      image,
      status = 'active'
    } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, slug'
      });
    }

    // Check if slug already exists
    const existingBrand = await prisma.brand.findUnique({ where: { slug } });
    if (existingBrand) {
      return res.status(400).json({ success: false, message: 'Brand with this slug already exists' });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        image,
        status
      }
    });

    res.status(201).json({ success: true, message: 'Brand created successfully', data: brand });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ success: false, message: 'Failed to create brand', error: error.message });
  }
};

// PUT /api/brands/:id - Update brand
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingBrand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    // Check if new slug conflicts
    if (updateData.slug && updateData.slug !== existingBrand.slug) {
      const slugExists = await prisma.brand.findUnique({ where: { slug: updateData.slug } });
      if (slugExists) {
        return res.status(400).json({ success: false, message: 'Brand with this slug already exists' });
      }
    }

    const brand = await prisma.brand.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ success: true, message: 'Brand updated successfully', data: brand });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ success: false, message: 'Failed to update brand', error: error.message });
  }
};

// DELETE /api/brands/:id - Delete brand
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingBrand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    // Check if brand has products
    const productCount = await prisma.product.count({
      where: { brandId: parseInt(id) }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete brand with ${productCount} product(s). Reassign or delete products first.`
      });
    }

    await prisma.brand.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ success: false, message: 'Failed to delete brand', error: error.message });
  }
};
