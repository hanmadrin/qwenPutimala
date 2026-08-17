const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/categories - Get all categories
exports.getCategories = async (req, res) => {
  try {
    const { status, parent } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (parent !== undefined) {
      if (parent === 'null' || parent === '') {
        where.parentId = null;
      } else {
        where.parentId = parseInt(parent);
      }
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: { select: { id: true, nameEn: true, nameBn: true, slug: true } },
        children: { 
          select: { id: true, nameEn: true, nameBn: true, slug: true },
          where: { status: 'active' }
        },
        _count: { select: { products: true } }
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories', error: error.message });
  }
};

// GET /api/categories/tree - Get category tree structure
exports.getCategoryTree = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null, status: 'active' },
      include: {
        children: {
          where: { status: 'active' },
          include: {
            children: {
              where: { status: 'active' },
              select: { id: true, nameEn: true, nameBn: true, slug: true }
            }
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching category tree:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category tree', error: error.message });
  }
};

// GET /api/categories/:id - Get single category by ID or slug
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: parseInt(id) },
          { slug: id }
        ]
      },
      include: {
        parent: { select: { id: true, nameEn: true, nameBn: true, slug: true } },
        children: { 
          select: { id: true, nameEn: true, nameBn: true, slug: true },
          where: { status: 'active' }
        },
        products: {
          take: 10,
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

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category', error: error.message });
  }
};

// POST /api/categories - Create new category
exports.createCategory = async (req, res) => {
  try {
    const {
      nameEn,
      nameBn,
      slug,
      parentId,
      image,
      status = 'active',
      sortOrder = 0
    } = req.body;

    // Validate required fields
    if (!nameEn || !nameBn || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: nameEn, nameBn, slug'
      });
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({ where: { slug } });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category with this slug already exists' });
    }

    // Check if parent exists if parentId provided
    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parseInt(parentId) } });
      if (!parent) {
        return res.status(400).json({ success: false, message: 'Parent category not found' });
      }
    }

    const category = await prisma.category.create({
      data: {
        nameEn,
        nameBn,
        slug,
        parentId: parentId ? parseInt(parentId) : null,
        image,
        status,
        sortOrder
      },
      include: {
        parent: { select: { id: true, nameEn: true, nameBn: true, slug: true } }
      }
    });

    res.status(201).json({ success: true, message: 'Category created successfully', data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

// PUT /api/categories/:id - Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert numeric fields
    if (updateData.parentId) updateData.parentId = parseInt(updateData.parentId);
    if (updateData.sortOrder) updateData.sortOrder = parseInt(updateData.sortOrder);

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCategory) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if new slug conflicts
    if (updateData.slug && updateData.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({ where: { slug: updateData.slug } });
      if (slugExists) {
        return res.status(400).json({ success: false, message: 'Category with this slug already exists' });
      }
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        parent: { select: { id: true, nameEn: true, nameBn: true, slug: true } }
      }
    });

    res.json({ success: true, message: 'Category updated successfully', data: category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
};

// DELETE /api/categories/:id - Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCategory) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: parseInt(id) }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} product(s). Reassign or delete products first.`
      });
    }

    // Check if category has children
    const childCount = await prisma.category.count({
      where: { parentId: parseInt(id) }
    });

    if (childCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${childCount} subcategory(ies). Delete subcategories first.`
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
  }
};
