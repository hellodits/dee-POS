import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  name: string;
  description?: string;
  category: string;
  unit: string; // kg, liter, pcs, etc.
  current_stock: number;
  min_stock: number; // minimum stock threshold
  max_stock?: number; // maximum stock capacity
  cost_per_unit: number; // cost price per unit
  supplier?: string;
  supplier_contact?: string;
  expiry_date?: Date;
  is_perishable: boolean;
  storage_location?: string;
  image_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const inventorySchema = new Schema<IInventory>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Protein', // Daging, Ayam, Ikan, Seafood
      'Sayuran', // Vegetables
      'Buah', // Fruits
      'Dairy', // Susu, Keju, Mentega
      'Bumbu', // Spices & Seasonings
      'Minyak', // Oils & Fats
      'Tepung', // Flour & Grains
      'Minuman', // Beverages (raw materials)
      'Kemasan', // Packaging materials
      'Lainnya' // Others
    ]
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'gram', 'liter', 'ml', 'pcs', 'pack', 'box', 'bottle', 'can']
  },
  current_stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  min_stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  max_stock: {
    type: Number,
    min: 0
  },
  cost_per_unit: {
    type: Number,
    required: true,
    min: 0
  },
  supplier: {
    type: String,
    trim: true,
    maxlength: 100
  },
  supplier_contact: {
    type: String,
    trim: true,
    maxlength: 50
  },
  expiry_date: {
    type: Date
  },
  is_perishable: {
    type: Boolean,
    default: false
  },
  storage_location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  image_url: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
inventorySchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Indexes for better performance
inventorySchema.index({ name: 1 });
inventorySchema.index({ category: 1 });
inventorySchema.index({ is_active: 1 });
inventorySchema.index({ current_stock: 1 });
inventorySchema.index({ expiry_date: 1 });

export const Inventory = mongoose.model<IInventory>('Inventory', inventorySchema);