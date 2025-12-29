import mongoose, { Document, Schema, Types } from 'mongoose'

// Reason for inventory change
export type InventoryChangeReason = 'ORDER' | 'WASTAGE' | 'RESTOCK' | 'ADJUSTMENT' | 'RETURN'

export interface IInventoryLog extends Document {
  _id: Types.ObjectId
  product_id: Types.ObjectId
  product_name: string // Snapshot for reporting
  qty_change: number // Negative for deductions, positive for additions
  qty_before: number
  qty_after: number
  reason: InventoryChangeReason
  reference_id?: Types.ObjectId // Order ID or other reference
  user_id?: Types.ObjectId
  notes?: string
  timestamp: Date
}

const inventoryLogSchema = new Schema<IInventoryLog>({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  product_name: {
    type: String,
    required: true
  },
  qty_change: {
    type: Number,
    required: true
  },
  qty_before: {
    type: Number,
    required: true
  },
  qty_after: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    enum: ['ORDER', 'WASTAGE', 'RESTOCK', 'ADJUSTMENT', 'RETURN'],
    required: true,
    index: true
  },
  reference_id: {
    type: Schema.Types.ObjectId
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  // Time Series Collection optimization (MongoDB 5.0+)
  timeseries: {
    timeField: 'timestamp',
    metaField: 'product_id',
    granularity: 'hours'
  }
})

// Compound index for product history queries
inventoryLogSchema.index({ product_id: 1, timestamp: -1 })

export const InventoryLog = mongoose.model<IInventoryLog>('InventoryLog', inventoryLogSchema)
