# Multi-Branch Ecommerce & POS System

A complete Bangladesh-based multi-branch Ecommerce + POS system built with modern technologies.

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Storefront    │     │  Admin Panel    │     │   Backend API   │
│   (Next.js)     │     │   (React/Vite)  │     │ (Express/Prisma)│
│   Port: 3000    │     │   Port: 5173    │     │   Port: 5000    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   MySQL 8+      │
                        │   Database      │
                        └─────────────────┘
```

## 📁 Project Structure

```
ecommerce-pos-system/
├── backend/           # Node.js + Express + Prisma API
├── storefront/        # Next.js customer-facing store
├── admin-panel/       # React admin dashboard
└── shared/            # Shared utilities
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8+
- npm or yarn

### 1. Clone & Install

```bash
cd ecommerce-pos-system

# Install backend dependencies
cd backend
npm install

# Install storefront dependencies
cd ../storefront
npm install

# Install admin panel dependencies
cd ../admin-panel
npm install
```

### 2. Database Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="mysql://root:password@localhost:3306/ecommerce_pos_db"

# Create database
mysql -u root -p -e "CREATE DATABASE ecommerce_pos_db;"

# Run migrations
npx prisma migrate dev

# Seed database
npm run prisma:seed
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend (Port 5000)
cd backend
npm run dev

# Terminal 2 - Storefront (Port 3000)
cd storefront
npm run dev

# Terminal 3 - Admin Panel (Port 5173)
cd admin-panel
npm run dev
```

## 🔑 Default Login Credentials

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Superadmin | superadmin@example.com | admin123 |
| Branch Manager | manager@example.com | admin123 |
| Cashier | cashier@example.com | admin123 |

## 🌟 Features

### Storefront (Customer-Facing)
- ✅ Responsive design (mobile-first)
- ✅ Product browsing with filters
- ✅ Shopping cart
- ✅ Guest checkout with auto-account creation
- ✅ OTP login (Twilio)
- ✅ Multiple payment methods (COD, SSLCommerz)
- ✅ Order tracking
- ✅ Bilingual support (EN/BN)

### Admin Panel
- ✅ Multi-role access (Superadmin, Branch Manager, Cashier, Order Manager)
- ✅ Product management with variations
- ✅ Branch-wise stock management
- ✅ Online order management
- ✅ Walk-in POS system
- ✅ Reports & analytics
- ✅ Automated backups to Google Drive

## 📦 Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js, Express, Prisma ORM |
| Database | MySQL 8+ |
| Storefront | Next.js 14, Tailwind CSS |
| Admin Panel | React, Vite, Tailwind CSS |
| Authentication | JWT (Admin), OTP (Customer) |
| Payments | SSLCommerz |
| SMS | Twilio |
| Backup | Google Drive API |

## 🔧 Environment Variables

See `backend/.env.example` for all required environment variables.

## 📝 API Documentation

API endpoints are available at `http://localhost:5000/api/*`

### Key Endpoints:
- `POST /api/auth/login` - Admin login
- `GET /api/products` - List products
- `POST /api/orders` - Create order
- `GET /api/branches` - List branches

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📄 License

ISC

## 👥 Support

For issues and questions, please contact the development team.
