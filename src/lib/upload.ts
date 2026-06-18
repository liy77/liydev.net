import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads')
const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface UploadResult {
  path: string
  filename: string
}

export async function saveImage(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG and WebP allowed.')
  }

  if (file.size > MAX_SIZE) {
    throw new Error('File too large. Max 2MB.')
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const metadata = await sharp(buffer).metadata()
  if (metadata.width && metadata.width > 1920) {
    throw new Error('Image too wide. Max 1920px.')
  }
  if (metadata.height && metadata.height > 1080) {
    throw new Error('Image too tall. Max 1080px.')
  }

  const filename = `${randomUUID()}.webp`
  const outputPath = path.join(UPLOAD_DIR, filename)

  await sharp(buffer).webp({ quality: 85 }).toFile(outputPath)

  return {
    path: `/uploads/${filename}`,
    filename,
  }
}
