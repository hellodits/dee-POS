import { Request, Response, NextFunction } from 'express'
import { Reservation } from '../models/Reservation'
import { Table } from '../models/Table'
import { Types } from 'mongoose'

/**
 * @desc    Create reservation (Public - Guest submits)
 * @route   POST /api/reservations
 * @access  Public
 */
export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Received reservation request body:', req.body)
    const { guest_name, whatsapp, email, date, time, pax, notes } = req.body

    // Validate required fields
    if (!guest_name || !whatsapp || !date || !time || !pax) {
      return res.status(400).json({
        success: false,
        error: 'guest_name, whatsapp, date, time, and pax are required'
      })
    }

    // Validate date is not in the past
    const reservationDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (reservationDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Reservation date cannot be in the past'
      })
    }

    // Check for duplicate reservation (same phone, same date/time)
    const existing = await Reservation.findOne({
      whatsapp,
      date: reservationDate,
      time,
      status: { $in: ['PENDING', 'APPROVED'] }
    })

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'You already have a reservation for this date and time'
      })
    }

    const reservation = await Reservation.create({
      guest_name,
      whatsapp,
      email,
      date: reservationDate,
      time,
      pax,
      notes,
      status: 'PENDING'
    })

    res.status(201).json({
      success: true,
      data: reservation,
      message: 'Reservation submitted successfully. Please wait for confirmation.'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get all reservations (Admin)
 * @route   GET /api/reservations
 * @access  Private (Admin)
 */
export const getReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query

    const filter: any = {}

    if (status) {
      filter.status = status
    }

    if (date) {
      const queryDate = new Date(date as string)
      const nextDay = new Date(queryDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      filter.date = { $gte: queryDate, $lt: nextDay }
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .populate('table_id', 'number name capacity')
        .populate('approved_by', 'username')
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Reservation.countDocuments(filter)
    ])

    res.json({
      success: true,
      data: reservations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single reservation
 * @route   GET /api/reservations/:id
 * @access  Private (Admin) / Public (by whatsapp)
 */
export const getReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('table_id', 'number name capacity')

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      })
    }

    res.json({
      success: true,
      data: reservation
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Approve reservation (Admin assigns table)
 * @route   PATCH /api/reservations/:id/approve
 * @access  Private (Admin)
 */
export const approveReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { table_id, admin_notes } = req.body
    const user = (req as any).user

    const reservation = await Reservation.findById(req.params.id)

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      })
    }

    if (reservation.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot approve reservation with status: ${reservation.status}`
      })
    }

    // Validate table if provided
    let table = null
    if (table_id) {
      table = await Table.findById(table_id)
      
      if (!table) {
        return res.status(404).json({
          success: false,
          error: 'Table not found'
        })
      }

      // Check table capacity
      if (table.capacity < reservation.pax) {
        return res.status(400).json({
          success: false,
          error: `Table capacity (${table.capacity}) is less than party size (${reservation.pax})`
        })
      }

      // Check if reservation time is within 2 hours from now (set table to Reserved)
      const now = new Date()
      const reservationDateTime = new Date(reservation.date)
      const [hours, minutes] = reservation.time.split(':').map(Number)
      reservationDateTime.setHours(hours, minutes, 0, 0)

      const timeDiff = reservationDateTime.getTime() - now.getTime()
      const twoHoursMs = 2 * 60 * 60 * 1000

      // If reservation is within 2 hours, mark table as Reserved
      if (timeDiff <= twoHoursMs && timeDiff > 0) {
        await Table.findByIdAndUpdate(table_id, {
          $set: {
            status: 'Reserved',
            reserved_by: {
              name: reservation.guest_name,
              whatsapp: reservation.whatsapp,
              pax: reservation.pax,
              reservation_time: reservationDateTime
            }
          }
        })
      }
    }

    // Update reservation
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'APPROVED',
          table_id: table_id ? new Types.ObjectId(table_id) : undefined,
          admin_notes,
          approved_by: user?.id ? new Types.ObjectId(user.id) : undefined,
          approved_at: new Date()
        }
      },
      { new: true }
    )
    .populate('table_id', 'number name capacity')

    // TODO: Send WhatsApp/SMS notification to guest
    console.log(`📱 Notify ${reservation.whatsapp}: Reservation APPROVED for ${reservation.date} at ${reservation.time}`)

    res.json({
      success: true,
      data: updatedReservation,
      message: 'Reservation approved successfully'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Reject reservation
 * @route   PATCH /api/reservations/:id/reject
 * @access  Private (Admin)
 */
export const rejectReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { admin_notes } = req.body
    const user = (req as any).user

    const reservation = await Reservation.findById(req.params.id)

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      })
    }

    if (reservation.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot reject reservation with status: ${reservation.status}`
      })
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'REJECTED',
          admin_notes,
          approved_by: user?.id ? new Types.ObjectId(user.id) : undefined,
          approved_at: new Date()
        }
      },
      { new: true }
    )

    // TODO: Send notification to guest
    console.log(`📱 Notify ${reservation.whatsapp}: Reservation REJECTED`)

    res.json({
      success: true,
      data: updatedReservation,
      message: 'Reservation rejected'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get today's reservations
 * @route   GET /api/reservations/today
 * @access  Private (Admin)
 */
export const getTodayReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const reservations = await Reservation.find({
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['PENDING', 'APPROVED'] }
    })
    .populate('table_id', 'number name')
    .sort({ time: 1 })

    res.json({
      success: true,
      data: reservations
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Check reservation by WhatsApp (Public)
 * @route   GET /api/reservations/check/:whatsapp
 * @access  Public
 */
export const checkReservationByPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { whatsapp } = req.params

    const reservations = await Reservation.find({
      whatsapp,
      status: { $in: ['PENDING', 'APPROVED'] },
      date: { $gte: new Date() }
    })
    .select('guest_name date time pax status table_id')
    .populate('table_id', 'number name')
    .sort({ date: 1, time: 1 })

    res.json({
      success: true,
      data: reservations
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Cancel reservation (can cancel PENDING or APPROVED)
 * @route   PATCH /api/reservations/:id/cancel
 * @access  Private (Admin)
 */
export const cancelReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { admin_notes } = req.body
    const user = (req as any).user

    const reservation = await Reservation.findById(req.params.id)

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      })
    }

    if (reservation.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel a completed reservation'
      })
    }

    if (reservation.status === 'CANCELLED' || reservation.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        error: 'Reservation is already cancelled/rejected'
      })
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'CANCELLED',
          admin_notes: admin_notes || 'Dibatalkan oleh admin',
          approved_by: user?.id ? new Types.ObjectId(user.id) : undefined,
          approved_at: new Date()
        }
      },
      { new: true }
    )

    console.log(`📱 Notify ${reservation.whatsapp}: Reservation CANCELLED`)

    res.json({
      success: true,
      data: updatedReservation,
      message: 'Reservation cancelled successfully'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete reservation permanently
 * @route   DELETE /api/reservations/:id
 * @access  Private (Admin)
 */
export const deleteReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reservation = await Reservation.findById(req.params.id)

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      })
    }

    await Reservation.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Reservation deleted successfully'
    })

  } catch (error) {
    next(error)
  }
}
