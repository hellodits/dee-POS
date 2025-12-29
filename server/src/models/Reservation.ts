import mongoose, { Document, Schema, Types } from 'mongoose'

export type ReservationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'

export interface IReservation extends Document {
  _id: Types.ObjectId
  guest_name: string
  whatsapp: string
  email?: string
  date: Date
  time: string // "19:00" format
  pax: number
  status: ReservationStatus
  table_id?: Types.ObjectId
  notes?: string
  admin_notes?: string
  approved_by?: Types.ObjectId
  approved_at?: Date
  createdAt: Date
  updatedAt: Date
}

const reservationSchema = new Schema<IReservation>({
  guest_name: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  whatsapp: {
    type: String,
    required: [true, 'WhatsApp number is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  date: {
    type: Date,
    required: [true, 'Reservation date is required'],
    index: true
  },
  time: {
    type: String,
    required: [true, 'Reservation time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
  },
  pax: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest required'],
    max: [50, 'Maximum 50 guests per reservation']
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING',
    index: true
  },
  table_id: {
    type: Schema.Types.ObjectId,
    ref: 'Table'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  admin_notes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  approved_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approved_at: {
    type: Date
  }
}, {
  timestamps: true
})

// Compound index for date-based queries
reservationSchema.index({ date: 1, time: 1 })
reservationSchema.index({ status: 1, date: 1 })

export const Reservation = mongoose.model<IReservation>('Reservation', reservationSchema)
