import mongoose, { Document, Schema, Types } from 'mongoose'

export type TableStatus = 'Available' | 'Occupied' | 'Reserved'

export interface ITable extends Document {
  _id: Types.ObjectId
  number: number
  name?: string
  capacity: number
  status: TableStatus
  branch_id: Types.ObjectId
  current_order_id?: Types.ObjectId
  reserved_by?: {
    name: string
    whatsapp: string
    pax: number
    reservation_time: Date
  }
  createdAt: Date
  updatedAt: Date
}

const tableSchema = new Schema<ITable>({
  number: {
    type: Number,
    required: [true, 'Table number is required'],
    min: [1, 'Table number must be at least 1']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Table name cannot exceed 50 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Table capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [20, 'Capacity cannot exceed 20']
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Reserved'],
    default: 'Available',
    index: true
  },
  branch_id: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    index: true
  },
  current_order_id: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  reserved_by: {
    name: { type: String },
    whatsapp: { type: String },
    pax: { type: Number },
    reservation_time: { type: Date }
  }
}, {
  timestamps: true
})

// Compound unique index - table number must be unique per branch
tableSchema.index({ branch_id: 1, number: 1 }, { unique: true })

export const Table = mongoose.model<ITable>('Table', tableSchema)
