import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IBranch extends Document {
  _id: Types.ObjectId
  name: string
  address: string
  phone: string
  is_active: boolean
  createdAt: Date
  updatedAt: Date
}

const branchSchema = new Schema<IBranch>({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
    maxlength: [100, 'Branch name cannot exceed 100 characters'],
    unique: true
  },
  address: {
    type: String,
    required: [true, 'Branch address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  phone: {
    type: String,
    required: [true, 'Branch phone is required'],
    trim: true,
    maxlength: [20, 'Phone cannot exceed 20 characters']
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
})

// Index for active branches
branchSchema.index({ is_active: 1, name: 1 })

export const Branch = mongoose.model<IBranch>('Branch', branchSchema)