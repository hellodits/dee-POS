import mongoose, { Document, Schema, Types } from 'mongoose'

// Transaction type enum
export type TransactionType = 'SALE' | 'REFUND' | 'VOID'

// Payment method enum
export type PaymentMethod = 'CASH' | 'CARD' | 'QRIS' | 'TRANSFER'

export interface ITransaction extends Document {
  _id: Types.ObjectId
  order_id: Types.ObjectId
  order_number: string
  type: TransactionType
  payment_method: PaymentMethod
  amount: number
  subtotal: number
  tax: number
  service_charge: number
  discount: number
  user_id?: Types.ObjectId // Cashier who processed
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const transactionSchema = new Schema<ITransaction>({
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  order_number: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['SALE', 'REFUND', 'VOID'],
    required: true,
    index: true
  },
  payment_method: {
    type: String,
    enum: ['CASH', 'CARD', 'QRIS', 'TRANSFER'],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  service_charge: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
})

// Indexes for reporting queries
transactionSchema.index({ createdAt: -1 })
transactionSchema.index({ type: 1, createdAt: -1 })
transactionSchema.index({ payment_method: 1, createdAt: -1 })

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema)
