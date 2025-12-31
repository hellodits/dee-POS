import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import { Request } from 'express'

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

/**
 * Generic multer instance for image uploads
 * Memory storage for Cloudinary upload
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: imageFilter
})

/**
 * Memory storage for Cloudinary upload
 * Images are stored in buffer, then uploaded to Cloudinary
 * NO local file storage - compliant with MongoDB Free Tier
 */
export const uploadProductImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: imageFilter
}).single('image')

// Multiple images upload (for future use)
export const uploadProductImages = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5 // Max 5 files
  },
  fileFilter: imageFilter
}).array('images', 5)
