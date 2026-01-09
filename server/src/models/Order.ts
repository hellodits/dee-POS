import mongoose, { Document, Schema, Types } from 'mongoose'

// Order source enum
export type OrderSource = 'POS' | 'WEB'

// Order status enum
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELLED'

// Payment status enum
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED'

// Payment method enum
export type PaymentMethod = 'CASH' | 'CARD' | 'QRIS' | 'TRANSFER'

// Embedded guest info (for WEB orders)
export interface IGuestInfo {
  name: string
  whatsapp: string
  pax: number
}

// Embedded order item (Snapshot Pattern - copy product data at order time)
export interface IOrderItem {
  product_id: Types.ObjectId
  name: string // Snapshot - won't change if product name changes
  qty: number
  price_at_moment: number // Snapshot - price at time of order
  note?: string
  attributes?: {
    name: string
    selected: string
    price_modifier: number
  }[]
}

// Embedded financials
export interface IFinancials {
  subtotal: number
  discount: number
  tax: number
  service_charge: number
  total: number
}

export interface IOrder extends Document {
  _id: Types.ObjectId
  order_number: string
  order_source: OrderSource
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method?: PaymentMethod
  table_id?: Types.ObjectId
  user_id?: Types.ObjectId // Cashier who created the order (POS)
  branch_id: Types.ObjectId
  guest_info?: IGuestInfo
  items: IOrderItem[]
  financials: IFinancials
  notes?: string
  completed_at?: Date
  createdAt: Date
  updatedAt: Date
}

const guestInfoSchema = new Schema<IGuestInfo>({
  name: { type: String, required: true },
  whatsapp: { type: String, required: true },
  pax: { type: Number, required: true, min: 1 }
}, { _id: false })

const orderItemSchema = new Schema<IOrderItem>({
  product_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  name: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  price_at_moment: { type: Number, required: true },
  note: { type: String },
  attributes: [{
    name: { type: String },
    selected: { type: String },
    price_modifier: { type: Number, default: 0 }
  }]
}, { _id: false })

const financialsSchema = new Schema<IFinancials>({
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  service_charge: { type: Number, default: 0 },
  total: { type: Number, required: true }
}, { _id: false })

const orderSchema = new Schema<IOrder>({
  order_number: {
    type: String,
    required: true,
    unique: true
  },
  order_source: {
    type: String,
    enum: ['POS', 'WEB'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'COOKING', 'READY', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  payment_status: {
    type: String,
    enum: ['UNPAID', 'PAID', 'REFUNDED'],
    default: 'UNPAID',
    index: true
  },
  payment_method: {
    type: String,
    enum: ['CASH', 'CARD', 'QRIS', 'TRANSFER']
  },
  table_id: {
    type: Schema.Types.ObjectId,
    ref: 'Table'
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  branch_id: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    index: true
  },
  guest_info: {
    type: guestInfoSchema
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (items: IOrderItem[]) => items.length > 0,
      message: 'Order must have at least one item'
    }
  },
  financials: {
    type: financialsSchema,
    required: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  completed_at: {
    type: Date
  }
}, {
  timestamps: true
})

// Indexes for common queries
orderSchema.index({ branch_id: 1, createdAt: -1 })
orderSchema.index({ branch_id: 1, status: 1, createdAt: -1 })
orderSchema.index({ branch_id: 1, table_id: 1, status: 1 })

// Generate order number before save
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.order_number) {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const prefix = this.order_source === 'POS' ? 'POS' : 'WEB'
    
    // Count today's orders for sequential numbering (per branch)
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)
    
    const Order = mongoose.model('Order')
    const count = await Order.countDocuments({
      branch_id: this.branch_id,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    })
    
    this.order_number = `${prefix}-${dateStr}-${String(count + 1).padStart(4, '0')}`
  }
  next()
})

export const Order = mongoose.model<IOrder>('Order', orderSchema)
