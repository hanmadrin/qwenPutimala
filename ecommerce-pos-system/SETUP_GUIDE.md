# Complete Setup Guide - Multi-Branch Ecommerce & POS System

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js** v18 or higher (`node --version`)
- **MySQL** v8 or higher (`mysql --version`)
- **npm** v9 or higher (`npm --version`)

## 🚀 Step-by-Step Installation

### Step 1: Install Backend Dependencies

```bash
cd /workspace/ecommerce-pos-system/backend
npm install
```

### Step 2: Configure Database

1. Create MySQL database:
```bash
mysql -u root -p -e "CREATE DATABASE ecommerce_pos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

2. Create `.env` file in backend folder:
```bash
cp .env.example .env
```

3. Edit `.env` with your credentials:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/ecommerce_pos_db"
JWT_SECRET=your-super-secret-key-change-this
NODE_ENV=development
PORT=5000
```

### Step 3: Run Database Migrations

```bash
cd /workspace/ecommerce-pos-system/backend
npx prisma migrate dev --name init
npm run prisma:seed
```

This will:
- Create all database tables (20+ models)
- Seed initial data including:
  - 1 Main Branch
  - 1 Superadmin user
  - 1 Branch Manager
  - 1 Cashier
  - Sample categories, brands, tags
  - 1 sample product (iPhone 15 Pro) with variants
  - Stock entries
  - Sample coupon

### Step 4: Start Backend Server

```bash
cd /workspace/ecommerce-pos-system/backend
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║   🚀 Server running on port 5000                       ║
║   🌍 Environment: development                          ║
╚════════════════════════════════════════════════════════╝
```

### Step 5: Install & Start Storefront

```bash
cd /workspace/ecommerce-pos-system/storefront
npm install
npm run dev
```

Access at: http://localhost:3000

### Step 6: Install & Start Admin Panel

```bash
cd /workspace/ecommerce-pos-system/admin-panel
npm install
npm run dev
```

Access at: http://localhost:5173

## 🔑 Default Login Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Superadmin** | superadmin@example.com | admin123 | Full system access |
| **Branch Manager** | manager@example.com | admin123 | Main branch management |
| **Cashier** | cashier@example.com | admin123 | POS only |

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend API responds: `http://localhost:5000/api/health`
- [ ] Storefront loads: `http://localhost:3000`
- [ ] Admin Panel loads: `http://localhost:5173`
- [ ] Can login as superadmin
- [ ] Database has seeded data

## 📱 Responsive Design Features

The system is fully responsive with mobile-first approach:

### Breakpoints Used:
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md/lg)
- **Desktop**: > 1024px (lg/xl)

### Responsive Components:
- Header with collapsible mobile menu
- Product grid (2 cols mobile → 5 cols desktop)
- Category grid (2 cols mobile → 6 cols desktop)
- Responsive forms and inputs
- Mobile-optimized checkout flow

## 🎨 Design System Consistency

All components use consistent Tailwind CSS classes:

### Colors:
- Primary: `primary-600` (#2563eb) - Main actions
- Secondary: `secondary-100` to `secondary-900` - Supporting elements

### Buttons:
```jsx
className="btn-primary"  // Primary action buttons
className="btn-secondary" // Secondary actions
```

### Cards:
```jsx
className="card-default"  // Standard card styling
```

### Inputs:
```jsx
className="input-default" // Standard input fields
```

## 📂 Project Structure Summary

```
ecommerce-pos-system/
├── backend/              # Express API (Port 5000)
│   ├── prisma/          # Database schema & migrations
│   └── src/
│       ├── config/      # DB, payment, SMS configs
│       ├── controllers/ # Request handlers
│       ├── services/    # Business logic
│       ├── middlewares/ # Auth, validation, error handling
│       └── routes/      # API endpoints
│
├── storefront/          # Next.js Store (Port 3000)
│   └── src/
│       ├── app/         # Pages (App Router)
│       ├── components/  # Reusable UI components
│       ├── context/     # React Context (Cart, Auth)
│       └── lib/         # API clients, utilities
│
└── admin-panel/         # React Admin (Port 5173)
    └── src/
        ├── pages/       # Dashboard pages
        ├── components/  # UI components
        ├── services/    # API integration
        └── store/       # Zustand state management
```

## 🔧 Common Issues & Solutions

### Issue: Prisma migration fails
**Solution**: 
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Issue: Port already in use
**Solution**: Change port in `.env` or kill the process:
```bash
# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Issue: MySQL connection error
**Solution**: 
1. Verify MySQL is running: `sudo systemctl status mysql`
2. Check credentials in `.env`
3. Ensure database exists

## 📞 Support

For issues or questions:
1. Check `DEVELOPMENT_LOG.md` for known issues
2. Review API documentation
3. Check server logs for errors

## 🎯 Next Development Steps

The foundation is complete. Continue with:

1. **Phase 2**: Product Management APIs
2. **Phase 3**: Storefront Shop Pages
3. **Phase 4**: Cart & Checkout
4. **Phase 5**: POS System
5. **Phase 6**: Order Management
6. **Phase 7**: Reports & Backup

See `DEVELOPMENT_LOG.md` for detailed roadmap.
