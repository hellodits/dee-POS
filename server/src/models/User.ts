import mongoose, { Document, Schema, Types } from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Nested permissions object
export interface IPermissions {
  can_void: boolean
  can_discount: boolean
  can_see_report: boolean
  can_manage_inventory: boolean
  can_manage_users: boolean
  can_manage_tables: boolean
}

export interface IUser extends Document {
  _id: Types.ObjectId
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  address?: string
  avatar?: string
  role: 'admin' | 'manager' | 'cashier' | 'kitchen'
  permissions: IPermissions
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  matchPassword(enteredPassword: string): Promise<boolean>
  getSignedJwtToken(): string
}

const permissionsSchema = new Schema<IPermissions>({
  can_void: { type: Boolean, default: false },
  can_discount: { type: Boolean, default: false },
  can_see_report: { type: Boolean, default: false },
  can_manage_inventory: { type: Boolean, default: false },
  can_manage_users: { type: Boolean, default: false },
  can_manage_tables: { type: Boolean, default: false }
}, { _id: false })

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot be more than 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  avatar: {
    type: String // Cloudinary URL
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'cashier', 'kitchen'],
    default: 'cashier'
  },
  permissions: {
    type: permissionsSchema,
    default: () => ({
      can_void: false,
      can_discount: false,
      can_see_report: false,
      can_manage_inventory: false,
      can_manage_users: false,
      can_manage_tables: false
    })
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
})

// Set default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'admin':
        this.permissions = {
          can_void: true,
          can_discount: true,
          can_see_report: true,
          can_manage_inventory: true,
          can_manage_users: true,
          can_manage_tables: true
        }
        break
      case 'manager':
        this.permissions = {
          can_void: true,
          can_discount: true,
          can_see_report: true,
          can_manage_inventory: true,
          can_manage_users: false,
          can_manage_tables: true
        }
        break
      case 'kitchen':
        this.permissions = {
          can_void: false,
          can_discount: false,
          can_see_report: false,
          can_manage_inventory: false,
          can_manage_users: false,
          can_manage_tables: false
        }
        break
      case 'cashier':
      default:
        this.permissions = {
          can_void: false,
          can_discount: false,
          can_see_report: false,
          can_manage_inventory: false,
          can_manage_users: false,
          can_manage_tables: false
        }
        break
    }
  }
  next()
})

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'fallback-secret')
}

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)