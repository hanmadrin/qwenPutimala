const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for admin users
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create Main Branch
  const mainBranch = await prisma.branch.upsert({
    where: { code: 'MAIN' },
    update: {},
    create: {
      name: 'Main Branch',
      code: 'MAIN',
      address: 'Dhaka, Bangladesh',
      phone: '+8801700000000',
      is_main: true,
      status: 'active',
    },
  });
  console.log('✅ Created Main Branch:', mainBranch.name);

  // Create Superadmin User
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      phone: '+8801700000001',
      password: hashedPassword,
      role: 'superadmin',
      branchId: null,
      status: 'active',
    },
  });
  console.log('✅ Created Superadmin:', superadmin.email);

  // Create a Branch Manager for Main Branch
  const branchManager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      name: 'Branch Manager',
      email: 'manager@example.com',
      phone: '+8801700000002',
      password: hashedPassword,
      role: 'branch_manager',
      branchId: mainBranch.id,
      status: 'active',
    },
  });
  console.log('✅ Created Branch Manager:', branchManager.email);

  // Create a Cashier
  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@example.com' },
    update: {},
    create: {
      name: 'Cashier User',
      email: 'cashier@example.com',
      phone: '+8801700000003',
      password: hashedPassword,
      role: 'cashier',
      branchId: mainBranch.id,
      status: 'active',
    },
  });
  console.log('✅ Created Cashier:', cashier.email);

  // Create Categories
  const electronics = await prisma.category.create({
    data: {
      nameEn: 'Electronics',
      nameBn: 'ইলেকট্রনিক্স',
      slug: 'electronics',
      status: 'active',
      sortOrder: 1,
    },
  });

  const fashion = await prisma.category.create({
    data: {
      nameEn: 'Fashion',
      nameBn: 'ফ্যাশন',
      slug: 'fashion',
      status: 'active',
      sortOrder: 2,
    },
  });

  const mobilePhones = await prisma.category.create({
    data: {
      nameEn: 'Mobile Phones',
      nameBn: 'মোবাইল ফোন',
      slug: 'mobile-phones',
      parentId: electronics.id,
      status: 'active',
      sortOrder: 1,
    },
  });

  console.log('✅ Created Categories');

  // Create Brands
  const samsung = await prisma.brand.create({
    data: {
      name: 'Samsung',
      slug: 'samsung',
      status: 'active',
    },
  });

  const apple = await prisma.brand.create({
    data: {
      name: 'Apple',
      slug: 'apple',
      status: 'active',
    },
  });

  console.log('✅ Created Brands');

  // Create Tags
  const newTag = await prisma.tag.create({
    data: {
      name: 'New Arrival',
      slug: 'new-arrival',
    },
  });

  const saleTag = await prisma.tag.create({
    data: {
      name: 'Sale',
      slug: 'sale',
    },
  });

  console.log('✅ Created Tags');

  // Create Sample Product
  const iphone15 = await prisma.product.create({
    data: {
      nameEn: 'iPhone 15 Pro',
      nameBn: 'আইফোন ১৫ প্রো',
      slug: 'iphone-15-pro',
      shortDescriptionEn: 'Latest iPhone with A17 Pro chip',
      shortDescriptionBn: 'এ১৭ প্রো চিপ সহ সর্বশেষ আইফোন',
      descriptionEn: 'The iPhone 15 Pro features a titanium design, A17 Pro chip, and advanced camera system.',
      descriptionBn: 'আইফোন ১৫ প্রোতে টাইটানিয়াম ডিজাইন, এ১৭ প্রো চিপ এবং উন্নত ক্যামেরা সিস্টেম রয়েছে।',
      price: 1299.00,
      discountPrice: 1199.00,
      categoryId: mobilePhones.id,
      brandId: apple.id,
      sku: 'IPH-15-PRO',
      weightKg: 0.187,
      dimensionsCm: '14.66 x 7.07 x 0.83',
      status: 'active',
      featured: true,
      isNewArrival: true,
      tags: {
        connect: [{ id: newTag.id }],
      },
    },
  });

  // Create Product Images
  await prisma.productImage.create({
    data: {
      productId: iphone15.id,
      imageUrl: '/images/products/iphone15-1.jpg',
      altText: 'iPhone 15 Pro Front View',
      sortOrder: 1,
    },
  });

  // Create Product Variants
  const variant1 = await prisma.productVariant.create({
    data: {
      productId: iphone15.id,
      sku: 'IPH-15-PRO-128-BLK',
      attributes: { Storage: '128GB', Color: 'Black Titanium' },
      sortOrder: 1,
      status: 'active',
    },
  });

  const variant2 = await prisma.productVariant.create({
    data: {
      productId: iphone15.id,
      sku: 'IPH-15-PRO-256-BLK',
      attributes: { Storage: '256GB', Color: 'Black Titanium' },
      sortOrder: 2,
      status: 'active',
    },
  });

  console.log('✅ Created Product with Variants');

  // Create Stock for Main Branch
  await prisma.branchStock.create({
    data: {
      branchId: mainBranch.id,
      variantId: variant1.id,
      quantity: 50,
      lowStockThreshold: 10,
    },
  });

  await prisma.branchStock.create({
    data: {
      branchId: mainBranch.id,
      variantId: variant2.id,
      quantity: 30,
      lowStockThreshold: 10,
    },
  });

  console.log('✅ Created Stock Entries');

  // Create Sample Coupon
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10.00,
      minOrderAmount: 50.00,
      maxDiscount: 50.00,
      validFrom: new Date(),
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      usageLimit: 1000,
      usedCount: 0,
      status: 'active',
    },
  });

  console.log('✅ Created Sample Coupon');

  // Create Settings
  await prisma.setting.create({
    data: {
      key: 'store_info',
      value: {
        name: 'Ecommerce POS BD',
        email: 'info@ecommercepos.bd',
        phone: '+8801700000000',
        address: 'Dhaka, Bangladesh',
        currency: 'BDT',
        defaultLanguage: 'en',
      },
    },
  });

  await prisma.setting.create({
    data: {
      key: 'payment_settings',
      value: {
        sslcommerz_enabled: true,
        cod_enabled: true,
        sandbox_mode: true,
      },
    },
  });

  console.log('✅ Created Default Settings');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('   Superadmin: superadmin@example.com / admin123');
  console.log('   Branch Manager: manager@example.com / admin123');
  console.log('   Cashier: cashier@example.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
