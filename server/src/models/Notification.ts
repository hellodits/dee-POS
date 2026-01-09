import mongoose, { Document, Schema, Types } from 'mongoose'

export type NotificationType = 'order' | 'reservation' | 'inventory' | 'system' | 'payment'
export type NotificationPriority = 'low' | 'medium' | 'high'

export interface INotification extends Document {
  _id: Types.ObjectId
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  is_read: boolean
  branch_id?: Types.ObjectId // null for system-wide notifications
  user_id?: Types.ObjectId // Target user (null = broadcast to all staff)
  reference_id?: string // ID of related entity (order_id, reservation_id, etc)
  reference_type?: string // 'order' | 'reservation' | 'product' etc
  metadata?: Record<string, unknown>
  read_at?: Date
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>({
  type: {
    type: String,
    enum: ['order', 'reservation', 'inventory', 'system', 'payment'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  is_read: {
    type: Boolean,
    default: false,
    index: true
  },
  branch_id: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    index: true // null for system-wide notifications
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  reference_id: {
    type: String
  },
  reference_type: {
    type: String
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  read_at: {
    type: Date
  }
}, {
  timestamps: true
})

// Indexes for common queries per branch
notificationSchema.index({ branch_id: 1, createdAt: -1 })
notificationSchema.index({ branch_id: 1, user_id: 1, is_read: 1, createdAt: -1 })
notificationSchema.index({ branch_id: 1, type: 1, createdAt: -1 })

// Auto-delete old notifications (older than 30 days)
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

export const Notification = mongoose.model<INotification>('Notification', notificationSchema)
