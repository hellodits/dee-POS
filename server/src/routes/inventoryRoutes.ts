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

// Create new inventory item
router.post('/', createInventory);

// Update inventory item
router.put('/:id', updateInventory);

// Delete inventory item
router.delete('/:id', deleteInventory);

// Adjust inventory stock
router.post('/:id/adjust', adjustInventoryStock);

export default router;