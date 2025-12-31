import { Notification, INotification, NotificationType, NotificationPriority } from '../models/Notification'
import { getIO } from '../config/socket'
import { Types } from 'mongoose'

interface CreateNotificationParams {
  type: NotificationType
  title: string
  message: string
  priority?: NotificationPriority
  user_id?: string | Types.ObjectId
  reference_id?: string
  reference_type?: string
  metadata?: Record<string, unknown>
}

/**
 * Create notification and emit via Socket.io
 */
export async function createNotification(params: CreateNotificationParams): Promise<INotification> {
  const notification = await Notification.create({
    type: params.type,
    title: params.title,
    message: params.message,
    priority: params.priority || 'medium',
    user_id: params.user_id,
    reference_id: params.reference_id,
    reference_type: params.reference_type,
    metadata: params.metadata,
    is_read: false
  })

  // Emit real-time notification via Socket.io
  try {
    const io = getIO()
    const notificationData = {
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      is_read: notification.is_read,
      reference_id: notification.reference_id,
      reference_type: notification.reference_type,
      metadata: notification.metadata,
      createdAt: notification.createdAt.toISOString()
    }

    if (params.user_id) {
      // Send to specific user
      io.to(`user:${params.user_id}`).emit('notification', notificationData)
    } else {
      // Broadcast to all staff
      io.to('staff').emit('notification', notificationData)
    }
    
    console.log(`🔔 Notification sent: ${notification.title}`)
  } catch (error) {
    // Socket not initialized, notification still saved to DB
    console.log('Socket not available, notification saved to DB only')
  }

  return notification
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId?: string,
  options: { 
    page?: number
    limit?: number
    unread_only?: boolean 
  } = {}
) {
  const { page = 1, limit = 50, unread_only = false } = options
  
  const query: Record<string, unknown> = {
    $or: [
      { user_id: userId ? new Types.ObjectId(userId) : null },
      { user_id: { $exists: false } },
      { user_id: null }
    ]
  }

  if (unread_only) {
    query.is_read = false
  }

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query)
  ])

  const unreadCount = await Notification.countDocuments({
    ...query,
    is_read: false
  })

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    stats: {
      total,
      unread: unreadCount,
      read: total - unreadCount
    }
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, userId?: string) {
  const query: Record<string, unknown> = { _id: notificationId }
  if (userId) {
    query.$or = [
      { user_id: new Types.ObjectId(userId) },
      { user_id: { $exists: false } },
      { user_id: null }
    ]
  }

  const notification = await Notification.findOneAndUpdate(
    query,
    { is_read: true, read_at: new Date() },
    { new: true }
  )

  return notification
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId?: string) {
  const query: Record<string, unknown> = {
    is_read: false,
    $or: [
      { user_id: userId ? new Types.ObjectId(userId) : null },
      { user_id: { $exists: false } },
      { user_id: null }
    ]
  }

  const result = await Notification.updateMany(
    query,
    { is_read: true, read_at: new Date() }
  )

  return { modified: result.modifiedCount }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string, userId?: string) {
  const query: Record<string, unknown> = { _id: notificationId }
  if (userId) {
    query.$or = [
      { user_id: new Types.ObjectId(userId) },
      { user_id: { $exists: false } },
      { user_id: null }
    ]
  }

  const result = await Notification.findOneAndDelete(query)
  return result
}

/**
 * Delete all read notifications older than specified days
 */
export async function cleanupOldNotifications(daysOld: number = 7) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  const result = await Notification.deleteMany({
    is_read: true,
    createdAt: { $lt: cutoffDate }
  })

  return { deleted: result.deletedCount }
}

// ============ HELPER FUNCTIONS FOR SPECIFIC NOTIFICATION TYPES ============

/**
 * Create order notification
 */
export async function notifyNewOrder(order: {
  order_id: string
  order_number: string
  table_number?: number
  guest_name?: string
  total: number
  items_count: number
}) {
  return createNotification({
    type: 'order',
    title: 'New Order Received',
    message: order.table_number 
      ? `Order ${order.order_number} for Table ${order.table_number} - ${order.items_count} items`
      : `Order ${order.order_number} from ${order.guest_name || 'Customer'} - ${order.items_count} items`,
    priority: 'high',
    reference_id: order.order_id,
    reference_type: 'order',
    metadata: order
  })
}

/**
 * Create reservation notification
 */
export async function notifyNewReservation(reservation: {
  reservation_id: string
  guest_name: string
  date: string
  time: string
  pax: number
}) {
  return createNotification({
    type: 'reservation',
    title: 'New Reservation',
    message: `${reservation.guest_name} - ${reservation.pax} guests on ${reservation.date} at ${reservation.time}`,
    priority: 'medium',
    reference_id: reservation.reservation_id,
    reference_type: 'reservation',
    metadata: reservation
  })
}

/**
 * Create low stock notification
 */
export async function notifyLowStock(product: {
  product_id: string
  name: string
  current_stock: number
  min_stock: number
}) {
  return createNotification({
    type: 'inventory',
    title: 'Low Stock Alert',
    message: `${product.name} is running low. Only ${product.current_stock} items remaining (min: ${product.min_stock})`,
    priority: 'high',
    reference_id: product.product_id,
    reference_type: 'product',
    metadata: product
  })
}

/**
 * Create payment notification
 */
export async function notifyPaymentReceived(payment: {
  order_id: string
  order_number: string
  amount: number
  payment_method: string
}) {
  return createNotification({
    type: 'payment',
    title: 'Payment Received',
    message: `Payment of Rp${payment.amount.toLocaleString('id-ID')} received for Order ${payment.order_number} via ${payment.payment_method}`,
    priority: 'low',
    reference_id: payment.order_id,
    reference_type: 'order',
    metadata: payment
  })
}
