# 🏗️ DEEPOS Monorepo Structure

## 📁 Final Folder Structure

```
deepos/
├── apps/                          # Frontend applications
│   ├── pos/                      # POS/Admin App (Port 3000)
│   │   ├── src/
│   │   │   ├── features/         # Feature modules
│   │   │   ├── components/       # UI components
│   │   │   ├── layouts/          # Layout components
│   │   │   ├── lib/              # Utilities
│   │   │   └── ...
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   │
│   └── customer/                 # Customer App (Port 4000)
│       ├── src/
│       │   ├── pages/            # Page components
│       │   ├── layouts/          # Layout components
│       │   ├── lib/              # Utilities
│       │   └── ...
│       ├── package.json
│       ├── vite.config.ts
│       └── tailwind.config.js
│
├── server/                       # Shared Backend API (Port 5000)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                  # Root package with scripts
├── README.md
└── MONOREPO_STRUCTURE.md
```

## 🎯 Architecture Overview

### 🏪 POS/Admin App (`apps/pos/`)
- **Port**: 3000
- **Purpose**: Restaurant management interface
- **Access**: Full CRUD operations
- **Features**:
  - Dashboard & Analytics
  - Menu Management
  - Staff Management
  - Inventory Management
  - Order Management
  - Reservation Management
  - Reports & Analytics
  - User Management

### 👥 Customer App (`apps/customer/`)
- **Port**: 4000
- **Purpose**: Customer-facing ordering interface
- **Access**: Read-only menu, Write-only orders
- **Features**:
  - Browse Menu (Public)
  - Add to Cart
  - Place Orders
  - Track Order Status
  - Table-side ordering

### 🖥️ Shared Backend (`server/`)
- **Port**: 5000
- **Purpose**: Unified API for both frontends
- **CORS**: Configured for both ports 3000 and 4000
- **Features**:
  - Authentication & Authorization
  - Menu API (Public & Admin)
  - Order Processing
  - User Management
  - Analytics & Reporting

## 🚀 Development Commands

### Start All Services
```bash
npm run dev                    # Start all (server + pos + customer)
```

### Individual Services
```bash
npm run dev:server            # Backend only (Port 5000)
npm run dev:pos              # POS app only (Port 3000)
npm run dev:customer         # Customer app only (Port 4000)
```

### Build Commands
```bash
npm run build                # Build all applications
npm run build:pos           # Build POS app only
npm run build:customer      # Build customer app only
npm run build:server        # Build server only
```

### Installation
```bash
npm run install:all         # Install dependencies for all apps
```

## 🔧 Configuration Changes Made

### 1. Server CORS Update
```typescript
// server/src/app.ts
app.use(cors({
  origin: [
    process.env.POS_CLIENT_URL || 'http://localhost:3000',
    process.env.CUSTOMER_CLIENT_URL || 'http://localhost:4000'
  ],
  credentials: true
}))
```

### 2. Port Configuration
- **POS App**: `apps/pos/vite.config.ts` → Port 3000
- **Customer App**: `apps/customer/vite.config.ts` → Port 4000
- **Server**: `server/src/app.ts` → Port 5000

### 3. Shared Design System
Both apps use the same:
- `tailwind.config.js` (copied from POS)
- `postcss.config.js` (copied from POS)
- `index.css` (copied from POS)
- TypeScript configuration

## 🔐 Access Control

### POS App (Admin)
- Full authentication required
- Complete CRUD operations
- Admin dashboard access
- Staff management
- System configuration

### Customer App (Public)
- No authentication for browsing
- Read-only menu access
- Write access for orders only
- Table-specific ordering
- Order status tracking

## 🌐 API Endpoints

### Public Endpoints (Customer App)
```
GET  /api/menu              # Browse menu items
GET  /api/menu/categories   # Get categories
POST /api/orders            # Create new order
GET  /api/orders/:id/status # Check order status
```

### Admin Endpoints (POS App)
```
All CRUD operations for:
- Menu management
- Staff management
- Inventory management
- Order management
- Analytics & reports
```

## 📱 Responsive Design

Both applications maintain:
- Mobile-first responsive design
- Consistent UI components
- Shared color scheme (Red primary)
- Light mode branding
- Touch-friendly interfaces

## 🔄 Development Workflow

1. **Backend Development**: Work in `server/` directory
2. **POS Features**: Work in `apps/pos/src/features/`
3. **Customer Features**: Work in `apps/customer/src/pages/`
4. **Shared Components**: Consider creating a shared package if needed

## 🚀 Deployment Strategy

### Development
- All apps run locally on different ports
- Shared backend serves both frontends
- Hot reload for all applications

### Production
- Deploy each app independently
- Use environment variables for API URLs
- Configure CORS for production domains
- Consider CDN for static assets

This monorepo structure provides clean separation of concerns while maintaining code reusability and consistent development experience across both frontend applications.