import { Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { Staff, Attendance } from '../models/Staff'
import { uploadToCloudinary } from '../config/cloudinary'
import { AuthRequest, getBranchFilter, getUserBranchId } from '../middleware/auth'

// Helper to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id) && 
         new mongoose.Types.ObjectId(id).toString() === id
}

/**
 * @desc    Get all staff
 * @route   GET /api/staff
 * @access  Private (Admin/Manager) - Branch filtered
 */
export const getStaff = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, search, active_only, page = 1, limit = 50 } = req.query

    // Get branch filter based on user role
    const branchFilter = getBranchFilter(req)
    const filter: any = { ...branchFilter }

    if (role) {
      filter.role = role
    }

    if (active_only === 'true') {
      filter.isActive = true
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [staff, total] = await Promise.all([
      Staff.find(filter)
        .sort({ fullName: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Staff.countDocuments(filter)
    ])

    res.json({
      success: true,
      data: staff,
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
 * @desc    Get single staff
 * @route   GET /api/staff/:id
 * @access  Private (Admin/Manager) - Branch filtered
 */
export const getStaffById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      console.log('❌ Invalid ObjectId format:', id)
      return res.status(400).json({
        success: false,
        error: `Invalid staff ID format: ${id}`
      })
    }

    // Get branch filter based on user role
    const branchFilter = getBranchFilter(req)
    
    const staff = await Staff.findOne({ _id: id, ...branchFilter })

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff not found or access denied'
      })
    }

    res.json({
      success: true,
      data: staff
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create staff
 * @route   POST /api/staff
 * @access  Private (Admin/Manager) - Auto-assign branch
 */
export const createStaff = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      fullName,
      email,
      phone,
      role,
      salary,
      dateOfBirth,
      shiftStart,
      shiftEnd,
      address,
      additionalDetails
    } = req.body

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

    // Check if email already exists
    const existingStaff = await Staff.findOne({ email })
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      })
    }

    // Handle image upload if provided
    let profileImage: string | undefined
    if (req.file && req.file.buffer && req.file.buffer.length > 0) {
      console.log('📸 Uploading profile image to Cloudinary...')
      console.log('File info:', { 
        originalname: req.file.originalname, 
        mimetype: req.file.mimetype, 
        size: req.file.size 
      })
      
      try {
        const result = await uploadToCloudinary(req.file, {
          folder: 'deepos/staff'
        })
        profileImage = result.secure_url
        console.log('✅ Image uploaded:', profileImage)
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError)
        // Continue without image if upload fails
      }
    } else {
      console.log('📷 No image file provided')
    }

    const staff = await Staff.create({
      branch_id,
      fullName,
      email,
      phone,
      role,
      salary: Number(salary),
      dateOfBirth,
      shiftStart,
      shiftEnd,
      address,
      additionalDetails,
      profileImage
    })

    console.log('✅ Staff created:', { 
      _id: staff._id.toString(), 
      fullName: staff.fullName, 
      branch_id: staff.branch_id,
      profileImage: staff.profileImage 
    })

    res.status(201).json({
      success: true,
      data: staff,
      message: 'Staff created successfully'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update staff
 * @route   PUT /api/staff/:id
 * @access  Private (Admin/Manager) - Branch filtered
 */
export const updateStaff = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    
    console.log('📝 Update staff request received')
    console.log('📝 Staff ID:', id)
    console.log('📝 Has file:', !!req.file)
    console.log('📝 Body keys:', Object.keys(req.body))
    
    // Trim any whitespace
    const cleanId = id?.trim()
    
    // Validate ObjectId format
    if (!isValidObjectId(cleanId)) {
      console.log('❌ Invalid ObjectId format for update:', cleanId)
      return res.status(400).json({
        success: false,
        error: `Invalid staff ID format: ${cleanId}`
      })
    }

    // Get branch filter based on user role
    const branchFilter = getBranchFilter(req)
    
    console.log('📝 Looking for staff with ID:', cleanId)
    const staff = await Staff.findOne({ _id: cleanId, ...branchFilter })

    if (!staff) {
      console.log('❌ Staff not found for ID:', cleanId)
      return res.status(404).json({
        success: false,
        error: 'Staff not found or access denied'
      })
    }
    
    console.log('✅ Staff found:', staff.fullName)

    // Check email uniqueness if changed
    if (req.body.email && req.body.email !== staff.email) {
      const existingStaff = await Staff.findOne({ email: req.body.email })
      if (existingStaff) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered'
        })
      }
    }

    // Prepare update data
    const updateData: any = {}

    // Handle image upload if provided
    if (req.file && req.file.buffer) {
      try {
        console.log('📸 Uploading new profile image to Cloudinary...')
        const result = await uploadToCloudinary(req.file, {
          folder: 'deepos/staff'
        })
        updateData.profileImage = result.secure_url
        console.log('✅ Image uploaded to Cloudinary:', updateData.profileImage)
      } catch (uploadError) {
        console.error('❌ Cloudinary upload error:', uploadError)
        return res.status(500).json({
          success: false,
          error: 'Failed to upload image'
        })
      }
    }

    // Add other fields from request body (excluding invalid ones and branch_id)
    for (const [key, value] of Object.entries(req.body)) {
      // Skip branch_id - cannot change branch
      if (key === 'branch_id') continue
      
      // Skip empty objects, null, undefined, empty strings
      if (value !== null && value !== undefined && value !== '' && 
          !(typeof value === 'object' && Object.keys(value).length === 0)) {
        
        // Convert salary to number if provided
        if (key === 'salary') {
          updateData[key] = Number(value)
        } else {
          updateData[key] = value
        }
      }
    }
    
    console.log('📝 Final update data:', JSON.stringify(updateData, null, 2))

    // Only proceed if we have data to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid data provided for update'
      })
    }

    const updatedStaff = await Staff.findOneAndUpdate(
      { _id: cleanId, ...branchFilter },
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedStaff) {
      return res.status(404).json({
        success: false,
        error: 'Staff not found after update'
      })
    }

    console.log('✅ Staff updated successfully:', updatedStaff._id)

    res.json({
      success: true,
      data: updatedStaff,
      message: 'Staff updated successfully'
    })

  } catch (error) {
    console.error('❌ Update staff error:', error)
    next(error)
  }
}

/**
 * @desc    Delete staff
 * @route   DELETE /api/staff/:id
 * @access  Private (Admin) - Branch filtered
 */
export const deleteStaff = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid staff ID format: ${id}`
      })
    }

    // Get branch filter based on user role
    const branchFilter = getBranchFilter(req)
    
    const staff = await Staff.findOne({ _id: id, ...branchFilter })

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff not found or access denied'
      })
    }

    await staff.deleteOne()

    res.json({
      success: true,
      message: 'Staff deleted successfully'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get staff roles (for dropdown)
 * @route   GET /api/staff/roles
 * @access  Private
 */
export const getStaffRoles = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = ['Manager', 'Cashier', 'Chef', 'Waiter', 'Cleaner', 'Security']
    
    res.json({
      success: true,
      data: roles
    })

  } catch (error) {
    next(error)
  }
}

// ============ ATTENDANCE ENDPOINTS ============

/**
 * @desc    Get attendance records
 * @route   GET /api/staff/attendance
 * @access  Private (Admin/Manager) - Branch filtered via staff
 */
export const getAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { staff_id, date, date_from, date_to, status, page = 1, limit = 500 } = req.query

    // Get branch filter based on user role
    const branchFilter = getBranchFilter(req)
    
    // First get staff IDs that belong to user's branch
    const branchStaff = await Staff.find(branchFilter).select('_id')
    const branchStaffIds = branchStaff.map(s => s._id)

    const filter: any = {
      staff_id: { $in: branchStaffIds }
    }

    if (staff_id) {
      // Verify staff belongs to user's branch
      if (!branchStaffIds.some(id => id.toString() === staff_id)) {
        return res.json({
          success: true,
          data: [],
          pagination: { page: 1, limit: Number(limit), total: 0, pages: 0 }
        })
      }
      filter.staff_id = staff_id
    }

    // Support date range filter
    if (date_from && date_to) {
      const fromDate = new Date(date_from as string + 'T00:00:00')
      fromDate.setHours(0, 0, 0, 0)
      const toDate = new Date(date_to as string + 'T00:00:00')
      toDate.setHours(23, 59, 59, 999)
      filter.date = { $gte: fromDate, $lte: toDate }
    } else if (date) {
      // Parse date string and set to local timezone start/end of day
      const queryDate = new Date(date as string + 'T00:00:00')
      queryDate.setHours(0, 0, 0, 0)
      const nextDay = new Date(queryDate)
      nextDay.setDate(nextDay.getDate() + 1)
      console.log('📅 Query date range:', { 
        inputDate: date,
        from: queryDate.toISOString(), 
        to: nextDay.toISOString(),
        localFrom: queryDate.toString()
      })
      filter.date = { $gte: queryDate, $lt: nextDay }
    }

    if (status) {
      filter.status = status
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [attendance, total] = await Promise.all([
      Attendance.find(filter)
        .populate('staff_id', 'fullName email role profileImage')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Attendance.countDocuments(filter)
    ])

    console.log('📋 Attendance query result:', {
      count: attendance.length,
      filter: JSON.stringify(filter),
      records: attendance.map(a => ({
        id: a._id,
        staffId: a.staff_id,
        date: a.date,
        checkIn: a.checkIn
      }))
    })

    res.json({
      success: true,
      data: attendance,
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
 * @desc    Create attendance record
 * @route   POST /api/staff/attendance
 * @access  Private (Admin/Manager) - Branch filtered
 */
export const createAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { staff_id, date, check_in, check_out, status, notes } = req.body

    // Get branch filter based on user role
    const branchFilter = getBranchFilter(req)

    // Check if staff exists and belongs to user's branch
    const staff = await Staff.findOne({ _id: staff_id, ...branchFilter })
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff not found or access denied'
      })
    }

    // Check for duplicate attendance on same date
    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(attendanceDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const existingAttendance = await Attendance.findOne({
      staff_id,
      date: { $gte: attendanceDate, $lt: nextDay }
    })

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        error: 'Attendance already recorded for this date'
      })
    }

    // Parse check_in and check_out times
    let checkInDate: Date | undefined
    let checkOutDate: Date | undefined
    let timings = '-'

    if (check_in) {
      checkInDate = new Date(`${date}T${check_in}:00`)
    }
    if (check_out) {
      checkOutDate = new Date(`${date}T${check_out}:00`)
    }

    // Generate timings string
    if (check_in && check_out) {
      timings = `${check_in} - ${check_out}`
    } else if (check_in) {
      timings = `${check_in} - ?`
    }

    const attendance = await Attendance.create({
      staff_id,
      date: attendanceDate,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      timings,
      status,
      notes
    })

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('staff_id', 'fullName email role profileImage')

    res.status(201).json({
      success: true,
      data: populatedAttendance,
      message: 'Attendance recorded successfully'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update attendance record
 * @route   PUT /api/staff/attendance/:id
 * @access  Private (Admin/Manager) - Branch filtered
 */
export const updateAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate('staff_id')

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      })
    }

    // Verify staff belongs to user's branch
    const branchFilter = getBranchFilter(req)
    const staff = await Staff.findOne({ _id: attendance.staff_id, ...branchFilter })
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found or access denied'
      })
    }

    const { check_in, check_out, status, notes } = req.body
    const updateData: any = {}

    // Get the date from existing attendance
    const dateStr = attendance.date.toISOString().split('T')[0]

    if (check_in !== undefined) {
      updateData.checkIn = check_in ? new Date(`${dateStr}T${check_in}:00`) : null
    }
    if (check_out !== undefined) {
      updateData.checkOut = check_out ? new Date(`${dateStr}T${check_out}:00`) : null
    }
    if (status) {
      updateData.status = status
    }
    if (notes !== undefined) {
      updateData.notes = notes
    }

    // Update timings string
    const newCheckIn = check_in !== undefined ? check_in : (attendance.checkIn ? attendance.checkIn.toTimeString().slice(0, 5) : null)
    const newCheckOut = check_out !== undefined ? check_out : (attendance.checkOut ? attendance.checkOut.toTimeString().slice(0, 5) : null)
    
    if (newCheckIn && newCheckOut) {
      updateData.timings = `${newCheckIn} - ${newCheckOut}`
    } else if (newCheckIn) {
      updateData.timings = `${newCheckIn} - ?`
    } else {
      updateData.timings = '-'
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('staff_id', 'fullName email role profileImage')

    res.json({
      success: true,
      data: updatedAttendance,
      message: 'Attendance updated successfully'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete attendance record
 * @route   DELETE /api/staff/attendance/:id
 * @access  Private (Admin) - Branch filtered
 */
export const deleteAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const attendance = await Attendance.findById(req.params.id)

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
      })
    }

    // Verify staff belongs to user's branch
    const branchFilter = getBranchFilter(req)
    const staff = await Staff.findOne({ _id: attendance.staff_id, ...branchFilter })
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found or access denied'
      })
    }

    await attendance.deleteOne()

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get today's attendance summary
 * @route   GET /api/staff/attendance/today
 * @access  Private - Branch filtered
 */
export const getTodayAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get branch filter based on user role
    const branchFilter = getBranchFilter(req)
    
    // Get staff IDs that belong to user's branch
    const branchStaff = await Staff.find({ ...branchFilter, isActive: true }).select('_id')
    const branchStaffIds = branchStaff.map(s => s._id)

    const [attendance, totalStaff] = await Promise.all([
      Attendance.find({
        staff_id: { $in: branchStaffIds },
        date: { $gte: today, $lt: tomorrow }
      }).populate('staff_id', 'fullName role profileImage'),
      Staff.countDocuments({ ...branchFilter, isActive: true })
    ])

    const summary = {
      total_staff: totalStaff,
      present: attendance.filter(a => a.status === 'Present').length,
      absent: attendance.filter(a => a.status === 'Absent').length,
      half_shift: attendance.filter(a => a.status === 'Half Shift').length,
      leave: attendance.filter(a => a.status === 'Leave').length,
      not_recorded: totalStaff - attendance.length
    }

    res.json({
      success: true,
      data: {
        summary,
        records: attendance
      }
    })

  } catch (error) {
    next(error)
  }
}


/**
 * @desc    Quick clock in - record attendance with current time
 * @route   POST /api/staff/attendance/clock-in
 * @access  Private - Branch filtered
 */
export const clockIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { staff_id } = req.body
    
    console.log('🕐 Clock-in request received:', { staff_id })

    // Validate staff_id is provided
    if (!staff_id) {
      console.log('❌ Clock-in failed: staff_id is required')
      return res.status(400).json({
        success: false,
        error: 'staff_id is required'
      })
    }

    // Validate ObjectId format
    if (!isValidObjectId(staff_id)) {
      console.log('❌ Clock-in failed: Invalid staff_id format:', staff_id)
      return res.status(400).json({
        success: false,
        error: 'Invalid staff_id format'
      })
    }

    // Check if staff exists and belongs to user's branch
    const branchFilter = getBranchFilter(req)
    const staff = await Staff.findOne({ _id: staff_id, ...branchFilter })
    if (!staff) {
      console.log('❌ Clock-in failed: Staff not found or access denied:', staff_id)
      return res.status(404).json({
        success: false,
        error: 'Staff not found or access denied'
      })
    }
    
    console.log('✅ Staff found:', staff.fullName)

    // Get today's date (start of day) - use local date string for consistency
    const currentDate = new Date()
    const todayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    const today = new Date(todayStr + 'T00:00:00')
    const tomorrow = new Date(todayStr + 'T00:00:00')
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    console.log('📅 Clock-in date check:', { 
      todayStr,
      today: today.toISOString(), 
      tomorrow: tomorrow.toISOString(),
      localToday: today.toString()
    })

    // Check if already clocked in today
    const existingAttendance = await Attendance.findOne({
      staff_id,
      date: { $gte: today, $lt: tomorrow }
    })
    
    console.log('📋 Existing attendance found:', existingAttendance ? 'Yes' : 'No')
    if (existingAttendance) {
      console.log('📋 Existing attendance date:', existingAttendance.date.toISOString())
    }

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        error: 'Sudah melakukan absen masuk hari ini'
      })
    }

    // Create attendance with current time as check in
    const checkInNow = new Date()
    const checkInTime = checkInNow.toTimeString().slice(0, 5)

    const attendance = await Attendance.create({
      staff_id,
      date: today,
      checkIn: checkInNow,
      timings: `${checkInTime} - ?`,
      status: 'Present'
    })

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('staff_id', 'fullName email role profileImage')

    res.status(201).json({
      success: true,
      data: populatedAttendance,
      message: `Berhasil absen masuk jam ${checkInTime}`
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Quick clock out - update attendance with current time
 * @route   POST /api/staff/attendance/clock-out
 * @access  Private - Branch filtered
 */
export const clockOut = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { staff_id } = req.body
    
    console.log('🕐 Clock-out request received:', { staff_id })

    // Validate staff_id is provided
    if (!staff_id) {
      console.log('❌ Clock-out failed: staff_id is required')
      return res.status(400).json({
        success: false,
        error: 'staff_id is required'
      })
    }

    // Validate ObjectId format
    if (!isValidObjectId(staff_id)) {
      console.log('❌ Clock-out failed: Invalid staff_id format:', staff_id)
      return res.status(400).json({
        success: false,
        error: 'Invalid staff_id format'
      })
    }

    // Verify staff belongs to user's branch
    const branchFilter = getBranchFilter(req)
    const staff = await Staff.findOne({ _id: staff_id, ...branchFilter })
    if (!staff) {
      console.log('❌ Clock-out failed: Staff not found or access denied:', staff_id)
      return res.status(404).json({
        success: false,
        error: 'Staff not found or access denied'
      })
    }

    // Get today's date - use local date string for consistency
    const currentDate = new Date()
    const todayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    const today = new Date(todayStr + 'T00:00:00')
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    console.log('📅 Clock-out date check:', { 
      todayStr,
      today: today.toISOString(), 
      tomorrow: tomorrow.toISOString()
    })

    // Find today's attendance
    const attendance = await Attendance.findOne({
      staff_id,
      date: { $gte: today, $lt: tomorrow }
    })
    
    console.log('📋 Today attendance found:', attendance ? 'Yes' : 'No')
    if (attendance) {
      console.log('📋 Attendance details:', { 
        date: attendance.date.toISOString(),
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut
      })
    }

    if (!attendance) {
      return res.status(400).json({
        success: false,
        error: 'Belum melakukan absen masuk hari ini'
      })
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        error: 'Sudah melakukan absen keluar hari ini'
      })
    }

    // Update with current time as check out
    const now = new Date()
    const checkOutTime = now.toTimeString().slice(0, 5)
    const checkInTime = attendance.checkIn ? attendance.checkIn.toTimeString().slice(0, 5) : '?'

    attendance.checkOut = now
    attendance.timings = `${checkInTime} - ${checkOutTime}`
    await attendance.save()

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('staff_id', 'fullName email role profileImage')

    res.json({
      success: true,
      data: populatedAttendance,
      message: `Berhasil absen keluar jam ${checkOutTime}`
    })

  } catch (error) {
    next(error)
  }
}
