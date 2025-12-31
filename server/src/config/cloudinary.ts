import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

interface UploadOptions {
  folder?: string
  width?: number
  height?: number
  crop?: string
  format?: string
  quality?: string
}

/**
 * Upload image to Cloudinary with transformations
 * - Resize to 500x500 square
 * - Convert to WebP format
 * - Auto quality optimization
 */
export async function uploadToCloudinary(
  file: Express.Multer.File,
  options: UploadOptions = {}
): Promise<UploadApiResponse> {
  const {
    folder = 'deepos/products',
    width = 500,
    height = 500,
    crop = 'fill',
    format = 'webp',
    quality = 'auto'
  } = options

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width, height, crop, gravity: 'auto' },
          { fetch_format: format, quality }
        ],
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve(result)
        } else {
          reject(new Error('Upload failed: No result returned'))
        }
      }
    )

    uploadStream.end(file.buffer)
  })
}

/**
 * Delete image from Cloudinary by public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}

/**
 * Extract public_id from Cloudinary URL
 * Example: https://res.cloudinary.com/xxx/image/upload/v123/deepos/products/abc.webp
 * Returns: deepos/products/abc
 */
export function extractPublicId(url: string): string | null {
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/
    const match = url.match(regex)
    return match ? match[1] : null
  } catch {
    return null
  }
}

export default cloudinary
