import { Response, NextFunction } from 'express'
import { Table } from '../models/Table'
import { Order } from '../models/Order'
import { Types } from 'mongoose'
import { AuthRequest, getBranchFilter, getUserBranchId } from '../middleware/auth'

/**
 * @desc    Get all tables
 * @route   GET /api/tables
 * @access  Public (with branch_id query) OR Private (branch filtered)
 * 
 * Behavior:
 * - Unauthenticated: Uses branch_id from query param (for Customer App)
 * - Authenticated OWNER: No filter (sees all) or uses branch_id query param
 * - Authenticated non-OWNER: Strictly filtered to user's branch_id
 */
export const getTables = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { status, available_only, branch_id } = req.query

    // Build branch filter based on auth status
    const filter: any = {}
    
    if (req.user) {
      if (req.user.role === 'owner') {
        // OWNER can filter by branch_id query param or see all
        if (branch_id && Types.ObjectId.isValid(branch_id as string)) {
          filter.branch_id = new Types.ObjectId(branch_id as string)
        }
      } else {
        // Non-owner: STRICTLY enforce their branch_id
        if (!req.user.branch_id) {
          return res.status(403).json({
            success: false,
            error: 'User has no assigned branch'
          })
        }
        filter.branch_id = req.user.branch_id
      }
    } else {
      // Not authenticated - use query param (Customer App)
      if (branch_id && Types.ObjectId.isValid(branch_id as string)) {
        filter.branch_id = new Types.ObjectId(branch_id as string)
      }
    }
    
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
 * @access  Private - Branch filtered
 */
export const getTable = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Get branch filter based on user role
    const branchFilter = getBranchFilter(req)
    
    const table = await Table.findOne({ _id: req.params.id, ...branchFilter })
      .populate({
        path: 'current_order_id',
        select: 'order_number status items financials'
      })

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found or access denied'
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
 * @access  Private (Admin/Manager) - Auto-assign branch
 */
export const createTable = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Auto-assign branch_id from user's branch
    let branch_id
    try {
      branch_id = getUserBranchId(req, true)
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message
      })
    }

    const table = await Table.create({
      ...req.body,
      branch_id
    })

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
 * @access  Private (Admin/Manager) - Branch filtered
 */
export const updateTable = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Get branch filter based on user role
    const branchFilter = getBranchFilter(req)
    
    // Remove branch_id from update data - cannot change branch
    const { branch_id, ...updateData } = req.body
    
    const table = await Table.findOneAndUpdate(
      { _id: req.params.id, ...branchFilter },
      updateData,
      { new: true, runValidators: true }
    )

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found or access denied'
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
 * @access  Private (Admin) - Branch filtered
 */
export const deleteTable = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Get branch filter based on user role
    const branchFilter = getBranchFilter(req)
    
    const table = await Table.findOne({ _id: req.params.id, ...branchFilter })

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found or access denied'
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
 * @access  Public - Table lookup by ID (branch context from table itself)
 */
export const reserveTable = async (
  req: AuthRequest, 
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

    // For reservation, we look up by table ID directly
    // Branch context comes from the table itself (Customer App selects table from their branch)
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
 * @access  Private - Branch filtered
 */
export const releaseTable = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Get branch filter based on user role
    const branchFilter = getBranchFilter(req)
    
    const table = await Table.findOne({ _id: req.params.id, ...branchFilter })

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found or access denied'
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
 * @access  Private - Branch filtered
 */
export const resetTable = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { force } = req.body
    
    // Get branch filter based on user role
    const branchFilter = getBranchFilter(req)
    
    const table = await Table.findOne({ _id: req.params.id, ...branchFilter })

    if (!table) {
      return res.status(404).json({
        success: false,
        error: 'Table not found or access denied'
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
    const updatedTable = await Table.findOneAndUpdate(
      { _id: req.params.id, ...branchFilter },
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
 * @access  Private - Branch filtered
 */
export const getTableSummary = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Get branch filter based on user role
    const branchFilter = getBranchFilter(req)
    
    const summary = await Table.aggregate([
      { $match: branchFilter },
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
