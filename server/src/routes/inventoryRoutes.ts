import express from 'express';
import {
  getAllInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  adjustInventoryStock,
  getInventoryCategories,
  getLowStockItems,
  getExpiringItems
} from '../controllers/inventoryController';
import { protect as authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all inventory items
router.get('/', getAllInventory);

// Get inventory categories
router.get('/categories', getInventoryCategories);

// Get low stock items
router.get('/low-stock', getLowStockItems);

// Get expiring items
router.get('/expiring', getExpiringItems);

// Get inventory by ID
router.get('/:id', getInventoryById);

// Create new inventory item (with image upload)
router.post('/', upload.single('image'), createInventory);

// Update inventory item (with image upload)
router.put('/:id', upload.single('image'), updateInventory);

// Delete inventory item
router.delete('/:id', deleteInventory);

// Adjust inventory stock
router.post('/:id/adjust', adjustInventoryStock);

export default router;