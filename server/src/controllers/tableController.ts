import { Request, Response, NextFunction } from 'express'
import { Table } from '../models/Table'
import { Order } from '../models/Order'

/**
 * @desc    Get all tables
 * @route   GET /api/tables
 * @access  Public (Customer App) / Private (POS)
 */
export const getTables = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { status, available_only } = req.query

    const filter: any = {}
    
    if (status) {
      filter.status = status
    }
    
    if (available_only === 'true') {
      filter.status = 'Available'
    }

    const tables = await Table.find(filter)
      .populate('current_order_id', 'order_number status financials.total')
      .sort({ number: 1 })

    res.json({
      success: true,
      data: tables
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single table with current order
 * @route   GET /api/tables/:id
 * @access  Private (POS)
 */
export const getTable = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const table = await Table.findById(req.params.id)
      .populate({
        path: 'current_order_id',
        select: 'order_number status items financials'
      })

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      })
    }

    res.json({
      success: true,
      data: table
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create table
 * @route   POST /api/tables
 * @access  Private (POS - Admin/Manager)
 */
export const createTable = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const table = await Table.create(req.body)

    res.status(201).json({
      success: true,
      data: table
    })

  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Table with this number already exists'
      })
    }
    next(error)
  }
}

/**
 * @desc    Update table
 * @route   PUT /api/tables/:id
 * @access  Private (POS - Admin/Manager)
 */
export const updateTable = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      })
    }

    res.json({
      success: true,
      data: table
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete table
 * @route   DELETE /api/tables/:id
 * @access  Private (POS - Admin)
 */
export const deleteTable = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const table = await Table.findById(req.params.id)

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      })
    }

    // Don't delete if occupied
    if (table.status === 'Occupied') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete an occupied table'
      })
    }

    await table.deleteOne()

    res.json({
      success: true,
      message: 'Table deleted'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Reserve table (Customer App)
 * @route   POST /api/tables/:id/reserve
 * @access  Public
 */
export const reserveTable = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { name, whatsapp, pax, reservation_time } = req.body

    // Validate required fields
    if (!name || !whatsapp || !pax || !reservation_time) {
      return res.status(400).json({
        success: false,
        error: 'name, whatsapp, pax, and reservation_time are required'
      })
    }

    const table = await Table.findById(req.params.id)

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      })
    }

    if (table.status !== 'Available') {
      return res.status(400).json({
        success: false,
        error: 'Table is not available for reservation'
      })
    }

    // Check capacity
    if (pax > table.capacity) {
      return res.status(400).json({
        success: false,
        error: `Table capacity is ${table.capacity}, requested ${pax} guests`
      })
    }

    table.status = 'Reserved'
    table.reserved_by = {
      name,
      whatsapp,
      pax,
      reservation_time: new Date(reservation_time)
    }

    await table.save()

    res.json({
      success: true,
      data: table,
      message: 'Table reserved successfully'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Release table (clear reservation or occupation)
 * @route   POST /api/tables/:id/release
 * @access  Private (POS)
 */
export const releaseTable = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const table = await Table.findById(req.params.id)

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      })
    }

    // If occupied, check if order is completed
    if (table.status === 'Occupied' && table.current_order_id) {
      const order = await Order.findById(table.current_order_id)
      if (order && !['COMPLETED', 'CANCELLED'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          error: 'Cannot release table with active order'
        })
      }
    }

    table.status = 'Available'
    table.current_order_id = undefined
    table.reserved_by = undefined

    await table.save()

    res.json({
      success: true,
      data: table,
      message: 'Table released'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Reset table (when customers leave) with safety check
 * @route   PATCH /api/tables/:id/reset
 * @access  Private (POS)
 */
export const resetTable = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { force } = req.body
    const table = await Table.findById(req.params.id)

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found'
      })
    }

    // Safety check: Look for UNPAID orders linked to this table
    const unpaidOrders = await Order.find({
      table_id: req.params.id,
      payment_status: 'UNPAID',
      status: { $nin: ['CANCELLED'] }
    }).select('order_number financials.total status')

    if (unpaidOrders.length > 0 && !force) {
      return res.status(400).json({
        success: false,
        error: 'Table has unpaid orders',
        unpaid_orders: unpaidOrders,
        message: 'Set force=true to reset anyway (orders will remain unpaid)'
      })
    }

    // Reset table to Available
    const updatedTable = await Table.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status: 'Available' },
        $unset: { current_order_id: 1, reserved_by: 1 }
      },
      { new: true }
    )

    res.json({
      success: true,
      data: updatedTable,
      message: 'Table reset to Available',
      warning: unpaidOrders.length > 0 ? `${unpaidOrders.length} unpaid order(s) remain` : undefined
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get table status summary
 * @route   GET /api/tables/summary
 * @access  Private (POS)
 */
export const getTableSummary = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const summary = await Table.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const result = {
      total: 0,
      available: 0,
      occupied: 0,
      reserved: 0
    }

    summary.forEach(item => {
      result.total += item.count
      switch (item._id) {
        case 'Available': result.available = item.count; break
        case 'Occupied': result.occupied = item.count; break
        case 'Reserved': result.reserved = item.count; break
      }
    })

    res.json({
      success: true,
      data: result
    })

  } catch (error) {
    next(error)
  }
}
