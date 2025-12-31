import { Request, Response, NextFunction } from 'express'
import { Product } from '../models/Product'
import { InventoryLog } from '../models/InventoryLog'
import { Types } from 'mongoose'
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../config/cloudinary'

/**
 * @desc    Get all products (with filters for Customer App)
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { 
      category, 
      search, 
      active_only = 'true',
      page = 1, 
      limit = 50 
    } = req.query

    // Build filter - optimized for indexed fields
    const filter: any = {}
    
    // Customer App should only see active products
    if (active_only === 'true') {
      filter.is_active = true
    }
    
    if (category) {
      filter.category = category
    }

    // Text search if provided
    if (search) {
      filter.$text = { $search: search as string }
    }

    const skip = (Number(page) - 1) * Number(limit)

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('-cost_price') // Hide cost from public API
        .sort({ category: 1, name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter)
    ])

    res.json({
      success: true,
      data: products,
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
 * @desc    Get all products for POS (includes cost_price)
 * @route   GET /api/products/pos
 * @access  Private (POS)
 */
export const getProductsForPOS = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { category, search, include_inactive } = req.query

    const filter: any = {}
    
    if (!include_inactive) {
      filter.is_active = true
    }
    
    if (category) {
      filter.category = category
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ]
    }

    const products = await Product.find(filter)
      .sort({ category: 1, name: 1 })

    res.json({
      success: true,
      data: products
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProduct = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('-cost_price')

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    res.json({
      success: true,
      data: product
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get product categories
 * @route   GET /api/products/categories
 * @access  Public
 */
export const getCategories = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const categories = await Product.distinct('category', { is_active: true })

    res.json({
      success: true,
      data: categories.sort()
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Create product (with Cloudinary image upload)
 * @route   POST /api/products
 * @access  Private (POS - Admin/Manager)
 */
export const createProduct = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const productData = { ...req.body }

    // Handle image upload to Cloudinary
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file, {
          folder: 'deepos/products',
          width: 500,
          height: 500,
          format: 'webp',
          quality: 'auto'
        })
        productData.image_url = result.secure_url
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError)
        return res.status(500).json({
          success: false,
          error: 'Failed to upload image'
        })
      }
    }

    // Parse attributes if sent as JSON string
    if (typeof productData.attributes === 'string') {
      try {
        productData.attributes = JSON.parse(productData.attributes)
      } catch {
        productData.attributes = []
      }
    }

    const product = await Product.create(productData)

    res.status(201).json({
      success: true,
      data: product
    })

  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Product with this SKU already exists'
      })
    }
    next(error)
  }
}

/**
 * @desc    Update product (with Cloudinary image upload)
 * @route   PUT /api/products/:id
 * @access  Private (POS - Admin/Manager)
 */
export const updateProduct = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Don't allow direct stock updates through this endpoint
    const { stock, ...updateData } = req.body

    // Handle image upload to Cloudinary
    if (req.file) {
      try {
        // Get old product to delete old image from Cloudinary
        const oldProduct = await Product.findById(req.params.id)
        if (oldProduct?.image_url) {
          const publicId = extractPublicId(oldProduct.image_url)
          if (publicId) {
            await deleteFromCloudinary(publicId)
          }
        }

        // Upload new image
        const result = await uploadToCloudinary(req.file, {
          folder: 'deepos/products',
          width: 500,
          height: 500,
          format: 'webp',
          quality: 'auto'
        })
        updateData.image_url = result.secure_url
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError)
        return res.status(500).json({
          success: false,
          error: 'Failed to upload image'
        })
      }
    }

    // Parse attributes if sent as JSON string
    if (typeof updateData.attributes === 'string') {
      try {
        updateData.attributes = JSON.parse(updateData.attributes)
      } catch {
        delete updateData.attributes
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    res.json({
      success: true,
      data: product
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Delete product (soft delete)
 * @route   DELETE /api/products/:id
 * @access  Private (POS - Admin)
 */
export const deleteProduct = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Soft delete - just mark as inactive
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    res.json({
      success: true,
      message: 'Product deactivated'
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Update stock (restock/adjustment)
 * @route   POST /api/products/:id/stock
 * @access  Private (POS - requires can_manage_inventory)
 */
export const updateStock = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { qty_change, reason, notes } = req.body
    const user = (req as any).user

    // Validate
    if (typeof qty_change !== 'number' || qty_change === 0) {
      return res.status(400).json({
        success: false,
        error: 'qty_change must be a non-zero number'
      })
    }

    const validReasons = ['RESTOCK', 'WASTAGE', 'ADJUSTMENT']
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        error: `reason must be one of: ${validReasons.join(', ')}`
      })
    }

    // Get current product
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    const qty_before = product.stock
    const qty_after = qty_before + qty_change

    // Prevent negative stock
    if (qty_after < 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot reduce stock below 0. Current: ${qty_before}, Change: ${qty_change}`
      })
    }

    // Update stock
    product.stock = qty_after
    await product.save()

    // Create inventory log
    await InventoryLog.create({
      product_id: product._id,
      product_name: product.name,
      qty_change,
      qty_before,
      qty_after,
      reason,
      user_id: user?.id ? new Types.ObjectId(user.id) : undefined,
      notes,
      timestamp: new Date()
    })

    res.json({
      success: true,
      data: {
        product_id: product._id,
        name: product.name,
        qty_before,
        qty_after,
        qty_change
      }
    })

  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get product stock history
 * @route   GET /api/products/:id/stock-history
 * @access  Private (POS)
 */
export const getStockHistory = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { limit = 50 } = req.query

    const logs = await InventoryLog.find({ product_id: req.params.id })
      .populate('user_id', 'username')
      .sort({ timestamp: -1 })
      .limit(Number(limit))

    res.json({
      success: true,
      data: logs
    })

  } catch (error) {
    next(error)
  }
}
