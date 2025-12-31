// Load environment variables FIRST before any other imports
import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { connectDB } from './config/database'
import { initializeSocket } from './config/socket'
import { errorHandler } from './middleware/errorHandler'

// Route imports
import authRoutes from './routes/authRoutes'
import productRoutes from './routes/productRoutes'
import tableRoutes from './routes/tableRoutes'
import orderRoutes from './routes/orderRoutes'
import reportRoutes from './routes/reportRoutes'
import kitchenRoutes from './routes/kitchenRoutes'
import reservationRoutes from './routes/reservationRoutes'
import inventoryRoutes from './routes/inventoryRoutes'
import staffRoutes from './routes/staffRoutes'
import notificationRoutes from './routes/notificationRoutes'
import userRoutes from './routes/userRoutes'

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 5000

// Initialize Socket.io
initializeSocket(httpServer)

// ============ CORS CONFIGURATION ============
// For production, allow all origins or specific ones
const corsOptions: cors.CorsOptions = {
  origin: true, // Allow all origins in production (simpler approach)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: { success: false, error: 'Too many requests, please try again later.' }
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging
app.use(morgan('dev'))

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'DEEPOS API is running', socket: 'enabled' })
})

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'DEEPOS API is running', socket: 'enabled' })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/tables', tableRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/kitchen', kitchenRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/users', userRoutes)

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Start server
const startServer = async () => {
  try {
    await connectDB()
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`🔌 Socket.io enabled`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
