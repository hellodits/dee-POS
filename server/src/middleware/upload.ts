import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads')
const productsDir = path.join(uploadsDir, 'products')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true })
}

// Storage configuration for product images
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename: product_timestamp_random.ext
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `product_${uniqueSuffix}${ext}`)
  }
})

// File filter - only allow images
const imageFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'))
  }
}

// Product image upload middleware
export const uploadProductImage = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: imageFilter
}).single('image')

// Multiple images upload (for future use)
export const uploadProductImages = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5 // Max 5 files
  },
  fileFilter: imageFilter
}).array('images', 5)

// Generic memory storage (for S3/Cloudinary upload)
export const uploadToMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: imageFilter
}).single('image')

/**
 * Get public URL for uploaded file
 */
export const getFileUrl = (filename: string, type: 'products' = 'products'): string => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`
  return `${baseUrl}/uploads/${type}/${filename}`
}

/**
 * Delete uploaded file
 */
export const deleteFile = (filename: string, type: 'products' = 'products'): boolean => {
  try {
    const filePath = path.join(uploadsDir, type, filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return true
    }
    return false
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}
