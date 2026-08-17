const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get stock levels for a branch
exports.getBranchStock = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { page = 1, limit = 20, lowStockOnly, search } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { branchId: parseInt(branchId) };

    if (lowStockOnly === 'true') {
      where.quantity = {
        lte: prisma.branchStock.fields.lowStockThreshold
      };
    }

    if (search) {
      where.variant = {
        product: {
          OR: [
            { nameEn: { contains: search, mode: 'insensitive' } },
            { nameBn: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } }
          ]
        }
      };
    }

    const [stockItems, total] = await Promise.all([
      prisma.branchStock.findMany({
        where,
        skip,
        take,
        include: {
          variant: {
            include: {
              product: {
                select: {
                  nameEn: true,
                  nameBn: true,
                  slug: true,
                  price: true,
                  discountPrice: true,
                  brand: {
                    select: {
                      name: true,
                      slug: true
                    }
                  },
                  category: {
                    select: {
                      nameEn: true,
                      nameBn: true,
                      slug: true
                    }
                  }
                }
              }
            }
          },
          branch: {
            select: {
              name: true,
              code: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.branchStock.count({ where })
    ]);

    res.json({
      success: true,
      data: stockItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take
      }
    });
  } catch (error) {
    console.error('Error fetching branch stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branch stock',
      error: error.message
    });
  }
};

// Get stock levels across all branches for a product variant
exports.getVariantStock = async (req, res) => {
  try {
    const { variantId } = req.params;

    const stockLevels = await prisma.branchStock.findMany({
      where: { variantId: parseInt(variantId) },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true
          }
        },
        variant: {
          include: {
            product: {
              select: {
                nameEn: true,
                nameBn: true,
                slug: true
              }
            }
          }
        }
      }
    });

    const totalStock = stockLevels.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        variantId: parseInt(variantId),
        totalStock,
        stockByBranch: stockLevels
      }
    });
  } catch (error) {
    console.error('Error fetching variant stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch variant stock',
      error: error.message
    });
  }
};

// Create or update stock for a branch/variant
exports.upsertStock = async (req, res) => {
  try {
    const { branchId, variantId, quantity, lowStockThreshold } = req.body;

    if (!branchId || !variantId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID, variant ID, and quantity are required'
      });
    }

    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: parseInt(branchId) }
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Verify variant exists
    const variant = await prisma.productVariant.findUnique({
      where: { id: parseInt(variantId) }
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Product variant not found'
      });
    }

    const stock = await prisma.branchStock.upsert({
      where: {
        branchId_variantId: {
          branchId: parseInt(branchId),
          variantId: parseInt(variantId)
        }
      },
      update: {
        quantity: parseInt(quantity),
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : undefined
      },
      create: {
        branchId: parseInt(branchId),
        variantId: parseInt(variantId),
        quantity: parseInt(quantity),
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 5
      },
      include: {
        variant: {
          include: {
            product: {
              select: {
                nameEn: true,
                nameBn: true,
                slug: true
              }
            }
          }
        },
        branch: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: stock
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// Create stock adjustment
exports.createAdjustment = async (req, res) => {
  try {
    const { branchId, variantId, newQty, reason, note } = req.body;

    if (!branchId || !variantId || newQty === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID, variant ID, new quantity, and reason are required'
      });
    }

    const validReasons = ['purchase', 'correction', 'return', 'damage', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid adjustment reason'
      });
    }

    // Get current stock
    const currentStock = await prisma.branchStock.findUnique({
      where: {
        branchId_variantId: {
          branchId: parseInt(branchId),
          variantId: parseInt(variantId)
        }
      }
    });

    if (!currentStock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }

    const adjustment = await prisma.$transaction(async (tx) => {
      // Update stock quantity
      const updatedStock = await tx.branchStock.update({
        where: {
          branchId_variantId: {
            branchId: parseInt(branchId),
            variantId: parseInt(variantId)
          }
        },
        data: {
          quantity: parseInt(newQty)
        },
        include: {
          variant: {
            include: {
              product: {
                select: {
                  nameEn: true,
                  nameBn: true,
                  slug: true
                }
              }
            }
          },
          branch: {
            select: {
              name: true,
              code: true
            }
          }
        }
      });

      // Create adjustment record
      const adjRecord = await tx.stockAdjustment.create({
        data: {
          branchId: parseInt(branchId),
          variantId: parseInt(variantId),
          previousQty: currentStock.quantity,
          newQty: parseInt(newQty),
          reason,
          note: note || null,
          adjustedBy: req.user?.id || 1
        },
        include: {
          user: {
            select: {
              name: true,
              role: true
            }
          },
          branch: {
            select: {
              name: true,
              code: true
            }
          }
        }
      });

      return { stock: updatedStock, adjustment: adjRecord };
    });

    res.status(201).json({
      success: true,
      message: 'Stock adjustment created successfully',
      data: adjustment
    });
  } catch (error) {
    console.error('Error creating stock adjustment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create stock adjustment',
      error: error.message
    });
  }
};

// Get stock adjustments history
exports.getAdjustments = async (req, res) => {
  try {
    const { page = 1, limit = 20, branchId, reason, startDate, endDate } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (branchId) {
      where.branchId = parseInt(branchId);
    }

    if (reason) {
      where.reason = reason;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [adjustments, total] = await Promise.all([
      prisma.stockAdjustment.findMany({
        where,
        skip,
        take,
        include: {
          branch: {
            select: {
              name: true,
              code: true
            }
          },
          user: {
            select: {
              name: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockAdjustment.count({ where })
    ]);

    res.json({
      success: true,
      data: adjustments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / take),
        totalItems: total,
        itemsPerPage: take
      }
    });
  } catch (error) {
    console.error('Error fetching stock adjustments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock adjustments',
      error: error.message
    });
  }
};

// Get low stock alerts
exports.getLowStockAlerts = async (req, res) => {
  try {
    const { branchId } = req.query;

    const where = {};

    if (branchId) {
      where.branchId = parseInt(branchId);
    }

    // Find items where quantity <= lowStockThreshold
    const lowStockItems = await prisma.branchStock.findMany({
      where: {
        ...where,
        quantity: {
          lte: prisma.branchStock.fields.lowStockThreshold
        }
      },
      include: {
        variant: {
          include: {
            product: {
              select: {
                nameEn: true,
                nameBn: true,
                slug: true,
                price: true,
                brand: {
                  select: {
                    name: true
                  }
                },
                category: {
                  select: {
                    nameEn: true
                  }
                }
              }
            }
          }
        },
        branch: {
          select: {
            name: true,
            code: true,
            phone: true
          }
        }
      },
      orderBy: { quantity: 'asc' }
    });

    res.json({
      success: true,
      data: {
        count: lowStockItems.length,
        items: lowStockItems
      }
    });
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock alerts',
      error: error.message
    });
  }
};

// Get stock statistics
exports.getStockStats = async (req, res) => {
  try {
    const { branchId } = req.query;

    const where = branchId ? { branchId: parseInt(branchId) } : {};

    const [
      totalVariants,
      totalQuantity,
      lowStockCount,
      outOfStockCount,
      stockValue
    ] = await Promise.all([
      prisma.branchStock.count({ where }),
      prisma.branchStock.aggregate({
        where,
        _sum: { quantity: true }
      }),
      prisma.branchStock.count({
        where: {
          ...where,
          quantity: {
            lte: prisma.branchStock.fields.lowStockThreshold
          }
        }
      }),
      prisma.branchStock.count({
        where: {
          ...where,
          quantity: 0
        }
      }),
      prisma.branchStock.findMany({
        where,
        include: {
          variant: {
            include: {
              product: {
                select: {
                  price: true,
                  discountPrice: true
                }
              }
            }
          }
        }
      })
    ]);

    // Calculate total stock value
    const totalValue = stockValue.reduce((sum, item) => {
      const price = item.variant.product.discountPrice || item.variant.product.price;
      return sum + (price * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        totalVariants,
        totalQuantity: totalQuantity._sum.quantity || 0,
        lowStockCount,
        outOfStockCount,
        totalValue
      }
    });
  } catch (error) {
    console.error('Error fetching stock stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock statistics',
      error: error.message
    });
  }
};
