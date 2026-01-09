import mongoose, { Document, Schema, Types } from 'mongoose'

export type StaffRole = 'Manager' | 'Cashier' | 'Chef' | 'Waiter' | 'Cleaner' | 'Security'
export type AttendanceStatus = 'Present' | 'Absent' | 'Half Shift' | 'Leave'

export interface IStaff extends Document {
  _id: Types.ObjectId
  user_id?: Types.ObjectId // Optional link to User for login
  branch_id: Types.ObjectId
  fullName: string
  email: string
  phone: string
  role: StaffRole
  salary: number
  dateOfBirth: string
  age: number
  shiftStart: string
  shiftEnd: string
  address: string
  additionalDetails?: string
  profileImage?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IAttendance extends Document {
  _id: Types.ObjectId
  staff_id: Types.ObjectId
  date: Date
  checkIn?: Date
  checkOut?: Date
  timings: string
  status: AttendanceStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const staffSchema = new Schema<IStaff>({
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
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['Manager', 'Cashier', 'Chef', 'Waiter', 'Cleaner', 'Security'],
    required: [true, 'Role is required']
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  dateOfBirth: {
    type: String,
    required: [true, 'Date of birth is required']
  },
  age: {
    type: Number,
    min: [16, 'Minimum age is 16'],
    max: [100, 'Maximum age is 100']
  },
  shiftStart: {
    type: String,
    required: [true, 'Shift start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  shiftEnd: {
    type: String,
    required: [true, 'Shift end time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  additionalDetails: {
    type: String,
    maxlength: [1000, 'Additional details cannot exceed 1000 characters']
  },
  profileImage: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Calculate age from dateOfBirth before saving
staffSchema.pre('save', function(next) {
  if (this.dateOfBirth) {
    const birthDate = new Date(this.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    this.age = age
  }
  next()
})

// Index for search
staffSchema.index({ branch_id: 1, fullName: 'text', email: 'text' })
staffSchema.index({ branch_id: 1, role: 1 })
staffSchema.index({ branch_id: 1, isActive: 1 })

const attendanceSchema = new Schema<IAttendance>({
  staff_id: {
    type: Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  timings: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Shift', 'Leave'],
    required: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
})

// Compound index for date-based queries
attendanceSchema.index({ staff_id: 1, date: 1 })
attendanceSchema.index({ date: 1, status: 1 })

export const Staff = mongoose.model<IStaff>('Staff', staffSchema)
export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema)
