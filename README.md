# DEEPOS - Point of Sale System

Enterprise-grade SaaS Point of Sale system built with the MERN stack and TypeScript.

## 🏗️ Architecture

### Frontend (Client)
- **Stack**: React + Vite, TypeScript, Tailwind CSS, Shadcn/UI
- **Architecture**: Feature-Based Architecture
- **Structure**: `src/features/[featureName]/` containing components, hooks, api, types

### Backend (Server)
- **Stack**: Node.js, Express, TypeScript, Mongoose (MongoDB)
- **Architecture**: Controller-Service-Repository Pattern (3-Layer Architecture)
- **Structure**: Separation of concerns with controllers, services, models, and routes

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

2. **Environment Setup**
```bash
# Copy environment file
cd server
cp .env.example .env

# Update .env with your configuration
```

3. **Start Development Servers**
```bash
# From root directory - starts both client and server
npm run dev

# Or start individually:
npm run dev:client  # Client on http://localhost:3000
npm run dev:server  # Server on http://localhost:5000
```

## 📁 Project Structure

```
deepos/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── features/          # Feature-based modules
│   │   │   ├── auth/          # Authentication features
│   │   │   ├── dashboard/     # Dashboard features
│   │   │   ├── pos/           # Point of Sale features
│   │   │   └── inventory/     # Inventory management
│   │   ├── components/ui/     # Shared UI components
│   │   ├── layouts/           # Layout components
│   │   ├── lib/               # Utilities & API setup
│   │   ├── hooks/             # Custom React hooks
│   │   └── types/             # TypeScript types
│   └── public/
└── server/                    # Node.js Backend
    └── src/
        ├── controllers/       # HTTP request handlers
        ├── services/          # Business logic layer
        ├── models/            # Database schemas
        ├── routes/            # API route definitions
        ├── middleware/        # Custom middleware
        ├── config/            # Configuration files
        └── types/             # TypeScript types
```

## 🎨 Design System

- **Theme**: Dark Mode with Red Accents
- **Colors**:
  - Background: `#121212`
  - Surface: `#282828`
  - Primary Red: `#ef4444`
- **UI Library**: Shadcn/UI components with Tailwind CSS

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Start both client and server
- `npm run build` - Build both applications
- `npm run dev:client` - Start only client
- `npm run dev:server` - Start only server

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Server
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server

## 🔐 Authentication

The system includes a complete authentication system with:
- User registration and login
- JWT token-based authentication
- Role-based access control (Admin, Manager, Cashier)
- Password reset functionality

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset

## 🛠️ Development

### Adding New Features
1. Create feature directory in `client/src/features/[featureName]/`
2. Add corresponding API routes in `server/src/routes/`
3. Implement controllers and services following the 3-layer architecture

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent file naming and structure

## 🚀 Deployment

### Environment Variables
Copy `.env.example` to `.env` and configure:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CLIENT_URL` - Frontend URL for CORS

### Production Build
```bash
npm run build
```

## 📄 License

This project is proprietary software for DEEPOS.

---

**Next Steps**: Ready to implement Login and Forgot Password pages!