import mongoose, { Document, Schema, Types } from 'mongoose'

// Nested attributes for product extras/variants
export interface IProductAttribute {
  name: string
  options: {
    label: string
    price_modifier: number
  }[]
}

export interface IProduct extends Document {
  _id: Types.ObjectId
  name: string
  description?: string
  price: number
  cost_price: number
  stock: number
  category: string
  image_url?: string
  is_active: boolean
  branch_id: Types.ObjectId
  attributes: IProductAttribute[]
  sku?: string
  createdAt: Date
  updatedAt: Date
}

const productAttributeSchema = new Schema({
  name: { type: String, required: true },
  options: [{
    label: { type: String, required: true },
    price_modifier: { type: Number, default: 0 }
  }]
}, { _id: false })

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  cost_price: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true // Index for fast filtering
  },
  image_url: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true // Index for fast filtering by Customer App
  },
  branch_id: {
    type: Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    index: true
  },
  attributes: {
    type: [productAttributeSchema],
    default: []
  },
  sku: {
    type: String,
    unique: true,
    sparse: true // Allow null but enforce uniqueness when present
  }
}, {
  timestamps: true
})

// Compound index for menu queries (Customer App) - now includes branch
productSchema.index({ branch_id: 1, is_active: 1, category: 1 })

// Text index for search
productSchema.index({ name: 'text', description: 'text' })

export const Product = mongoose.model<IProduct>('Product', productSchema)
