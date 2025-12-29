import { Router } from 'express'
import {
  getProducts,
  getProductsForPOS,
  getProduct,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getStockHistory
} from '../controllers/productController'
import { protect, authorize, requirePermission } from '../middleware/auth'
import { uploadProductImage } from '../middleware/upload'

const router = Router()

// Public routes (Customer App)
router.get('/', getProducts)
router.get('/categories', getCategories)
router.get('/:id', getProduct)

// Protected routes (POS)
router.get('/pos/all', protect, getProductsForPOS)

// Create product with image upload (multipart/form-data)
router.post('/', 
  protect, 
  authorize('admin', 'manager'), 
  uploadProductImage,
  createProduct
)

// Update product with image upload
router.put('/:id', 
  protect, 
  authorize('admin', 'manager'),
  uploadProductImage,
  updateProduct
)

router.delete('/:id', protect, authorize('admin'), deleteProduct)

// Inventory management (requires permission)
router.post('/:id/stock', protect, requirePermission('can_manage_inventory'), updateStock)
router.get('/:id/stock-history', protect, getStockHistory)

export default router
