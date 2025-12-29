import { Request, Response } from 'express';
import { Inventory } from '../models/Inventory';
import { InventoryLog } from '../models/InventoryLog';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// Get all inventory items
export const getAllInventory = async (req: Request, res: Response) => {
  try {
    const { 
      category, 
      search, 
      active_only, 
      page = 1, 
      limit = 50 
    } = req.query;

    // Build filter
    const filter: any = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (active_only === 'true') {
      filter.is_active = true;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Inventory.countDocuments(filter);
    
    const inventory = await Inventory.find(filter)
      .sort({ updated_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: inventory,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data inventory'
    });
  }
};

// Get inventory by ID
export const getInventoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inventory tidak valid'
      });
    }

    const inventory = await Inventory.findById(id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Get inventory by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data inventory'
    });
  }
};

// Create new inventory item
export const createInventory = async (req: AuthRequest, res: Response) => {
  try {
    const inventoryData = req.body;
    
    // Check if inventory with same name exists
    const existingInventory = await Inventory.findOne({ 
      name: inventoryData.name,
      is_active: true 
    });
    
    if (existingInventory) {
      return res.status(400).json({
        success: false,
        error: 'Inventory dengan nama tersebut sudah ada'
      });
    }

    const inventory = new Inventory(inventoryData);
    await inventory.save();

    // Log initial stock if > 0
    if (inventory.current_stock > 0) {
      const log = new InventoryLog({
        inventory_id: inventory._id,
        inventory_name: inventory.name,
        type: 'IN',
        quantity: inventory.current_stock,
        reason: 'INITIAL_STOCK',
        notes: 'Stok awal saat membuat inventory',
        stock_before: 0,
        stock_after: inventory.current_stock,
        cost_per_unit: inventory.cost_per_unit,
        total_cost: inventory.current_stock * inventory.cost_per_unit,
        created_by: req.user?.id || 'system'
      });
      await log.save();
    }

    res.status(201).json({
      success: true,
      data: inventory,
      message: 'Inventory berhasil dibuat'
    });
  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal membuat inventory'
    });
  }
};

// Update inventory item
export const updateInventory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inventory tidak valid'
      });
    }

    // Don't allow direct stock updates through this endpoint
    delete updateData.current_stock;
    
    const inventory = await Inventory.findByIdAndUpdate(
      id,
      { ...updateData, updated_at: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: inventory,
      message: 'Inventory berhasil diupdate'
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengupdate inventory'
    });
  }
};

// Delete inventory item
export const deleteInventory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inventory tidak valid'
      });
    }

    const inventory = await Inventory.findByIdAndDelete(id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Inventory berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal menghapus inventory'
    });
  }
};

// Adjust inventory stock
export const adjustInventoryStock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { qty_change, reason, notes, cost_per_unit } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inventory tidak valid'
      });
    }

    if (!qty_change || qty_change === 0) {
      return res.status(400).json({
        success: false,
        error: 'Perubahan quantity harus diisi dan tidak boleh 0'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Alasan perubahan stok harus diisi'
      });
    }

    const inventory = await Inventory.findById(id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory tidak ditemukan'
      });
    }

    const stockBefore = inventory.current_stock;
    const stockAfter = Math.max(0, stockBefore + qty_change);
    
    // Prevent negative stock
    if (stockAfter < 0) {
      return res.status(400).json({
        success: false,
        error: 'Stok tidak boleh negatif'
      });
    }

    // Update inventory stock
    inventory.current_stock = stockAfter;
    inventory.updated_at = new Date();
    
    // Update cost if provided (for stock in)
    if (cost_per_unit && qty_change > 0) {
      inventory.cost_per_unit = cost_per_unit;
    }
    
    await inventory.save();

    // Create inventory log
    const log = new InventoryLog({
      inventory_id: inventory._id,
      inventory_name: inventory.name,
      type: qty_change > 0 ? 'IN' : 'OUT',
      quantity: Math.abs(qty_change),
      reason,
      notes,
      stock_before: stockBefore,
      stock_after: stockAfter,
      cost_per_unit: cost_per_unit || inventory.cost_per_unit,
      total_cost: Math.abs(qty_change) * (cost_per_unit || inventory.cost_per_unit),
      created_by: req.user?.id || 'system'
    });
    await log.save();

    res.json({
      success: true,
      data: inventory,
      message: `Stok ${inventory.name} berhasil ${qty_change > 0 ? 'ditambah' : 'dikurangi'}`
    });
  } catch (error) {
    console.error('Adjust inventory stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengubah stok inventory'
    });
  }
};

// Get inventory categories
export const getInventoryCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Inventory.distinct('category', { is_active: true });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get inventory categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil kategori inventory'
    });
  }
};

// Get low stock items
export const getLowStockItems = async (req: Request, res: Response) => {
  try {
    const { threshold } = req.query;
    
    let lowStockItems;
    if (threshold) {
      lowStockItems = await Inventory.find({
        is_active: true,
        current_stock: { $lte: Number(threshold) }
      });
    } else {
      // Use aggregation to compare current_stock with min_stock
      lowStockItems = await Inventory.aggregate([
        {
          $match: {
            is_active: true,
            $expr: { $lte: ['$current_stock', '$min_stock'] }
          }
        }
      ]);
    }
    
    res.json({
      success: true,
      data: lowStockItems
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data stok rendah'
    });
  }
};

// Get expiring items
export const getExpiringItems = async (req: Request, res: Response) => {
  try {
    const { days = 7 } = req.query;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(days));
    
    const expiringItems = await Inventory.find({
      is_active: true,
      is_perishable: true,
      expiry_date: { $lte: expiryDate, $gte: new Date() }
    }).sort({ expiry_date: 1 });
    
    res.json({
      success: true,
      data: expiringItems
    });
  } catch (error) {
    console.error('Get expiring items error:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data barang kadaluarsa'
    });
  }
};