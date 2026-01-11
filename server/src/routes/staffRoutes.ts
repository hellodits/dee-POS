import { Router } from 'express'
import {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffRoles,
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getTodayAttendance,
  clockIn,
  clockOut
} from '../controllers/staffController'
import { protect, authorize } from '../middleware/auth'
import { upload } from '../middleware/upload'

const router = Router()

// Debug middleware - log all requests to /api/staff
router.use((req, res, next) => {
  console.log(`📨 Staff Route: ${req.method} ${req.path}`)
  next()
})

// All routes require authentication
router.use(protect)

// Static routes MUST come before dynamic /:id routes
router.get('/roles', getStaffRoles)
router.get('/attendance/today', getTodayAttendance)
router.post('/attendance/clock-in', clockIn)
router.post('/attendance/clock-out', clockOut)
router.get('/attendance', authorize('owner', 'admin', 'manager'), getAttendance)
router.post('/attendance', authorize('owner', 'admin', 'manager'), createAttendance)
router.put('/attendance/:id', authorize('owner', 'admin', 'manager'), updateAttendance)
router.delete('/attendance/:id', authorize('owner', 'admin', 'manager'), deleteAttendance)

// Staff CRUD routes (dynamic :id routes come last)
router.get('/', authorize('owner', 'admin', 'manager'), getStaff)
router.post('/', authorize('owner', 'admin', 'manager'), upload.single('profileImage'), createStaff)
router.get('/:id', authorize('owner', 'admin', 'manager'), getStaffById)
router.put('/:id', authorize('owner', 'admin', 'manager'), (req, res, next) => {
  console.log('🔄 PUT /staff/:id route hit, ID:', req.params.id)
  next()
}, upload.single('profileImage'), updateStaff)
router.delete('/:id', authorize('owner', 'admin'), deleteStaff)

export default router
