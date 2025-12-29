import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'

let io: Server | null = null

// Socket event types
export interface OrderNotification {
  order_id: string
  order_number: string
  order_source: 'POS' | 'WEB'
  table_number?: number
  table_name?: string
  guest_name?: string
  items_count: number
  total: number
  status: string
  created_at: string
}

export interface OrderStatusUpdate {
  order_id: string
  order_number: string
  status: string
  previous_status: string
  updated_at: string
}

export interface KitchenUpdate {
  order_id: string
  order_number: string
  status: 'COOKING' | 'READY'
  table_number?: number
}

export interface ReservationNotification {
  reservation_id: string
  guest_name: string
  whatsapp: string
  date: string
  time: string
  pax: number
  status: string
}

/**
 * Initialize Socket.io server
 */
export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.POS_CLIENT_URL || 'http://localhost:3000',
        process.env.CUSTOMER_CLIENT_URL || 'http://localhost:4000'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  })

  // Connection handler
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`)

    // Join staff room (for POS/Kitchen clients)
    socket.on('join:staff', (data?: { role?: string }) => {
      socket.join('staff')
      socket.join('kitchen')
      console.log(`👨‍🍳 Staff joined: ${socket.id} (${data?.role || 'unknown'})`)
    })

    // Join customer room (for tracking specific order)
    socket.on('join:customer', (data: { order_number?: string }) => {
      socket.join('customers')
      if (data.order_number) {
        socket.join(`order:${data.order_number}`)
        console.log(`👤 Customer tracking order: ${data.order_number}`)
      }
    })

    // Leave rooms
    socket.on('leave:staff', () => {
      socket.leave('staff')
      socket.leave('kitchen')
    })

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`)
    })

    // Error handler
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error)
    })
  })

  console.log('🔌 Socket.io initialized')
  return io
}

/**
 * Get Socket.io instance
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.')
  }
  return io
}

// ============ EMIT FUNCTIONS ============

/**
 * Emit new order notification to staff
 */
export const emitNewOrder = (order: OrderNotification): void => {
  if (!io) return
  
  io.to('staff').emit('new_order_notification', order)
  console.log(`📢 New order notification sent: ${order.order_number}`)
}

/**
 * Emit order status update
 */
export const emitOrderStatusUpdate = (update: OrderStatusUpdate): void => {
  if (!io) return
  
  // Notify staff
  io.to('staff').emit('order_status_updated', update)
  
  // Notify specific customer tracking this order
  io.to(`order:${update.order_number}`).emit('order_status_updated', update)
  
  console.log(`📢 Order status updated: ${update.order_number} -> ${update.status}`)
}

/**
 * Emit kitchen update (for KDS)
 */
export const emitKitchenUpdate = (update: KitchenUpdate): void => {
  if (!io) return
  
  io.to('kitchen').emit('kitchen_update', update)
  
  // If order is READY, also notify customers
  if (update.status === 'READY') {
    io.to(`order:${update.order_number}`).emit('order_ready', update)
  }
  
  console.log(`🍳 Kitchen update: ${update.order_number} -> ${update.status}`)
}

/**
 * Emit new reservation notification to staff
 */
export const emitNewReservation = (reservation: ReservationNotification): void => {
  if (!io) return
  
  io.to('staff').emit('new_reservation_notification', reservation)
  console.log(`📢 New reservation notification: ${reservation.guest_name}`)
}

/**
 * Emit table status change
 */
export const emitTableUpdate = (table: { 
  table_id: string
  number: number
  status: string 
}): void => {
  if (!io) return
  
  io.to('staff').emit('table_status_updated', table)
}
