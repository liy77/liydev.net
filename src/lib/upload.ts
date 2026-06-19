import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads')
const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_WIDTH = 1920
const MAX_HEIGHT = 1080
const MAX_PIXELS = 50_000_000
const ALLOWED_FORMATS = ['jpeg', 'png', 'webp'] as const
const ALLOWED_AUDIO_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac'] as const

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadValidationError'
  }
}

export interface UploadResult {
  path: string
  filename: string
}

export async function saveImage(file: File): Promise<UploadResult> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (Buffer.byteLength(buffer) > MAX_SIZE) {
    throw new UploadValidationError('File too large. Max 2MB.')
  }

  const image = sharp(buffer, { limitInputPixels: MAX_PIXELS })

  let metadata: sharp.Metadata
  try {
    metadata = await image.metadata()
  } catch {
    throw new UploadValidationError('Invalid image file.')
  }

  const format = metadata.format
  if (!format || !ALLOWED_FORMATS.includes(format as (typeof ALLOWED_FORMATS)[number])) {
    throw new UploadValidationError('Invalid file type. Only JPG, PNG and WebP allowed.')
  }

  if (metadata.width && metadata.width > MAX_WIDTH) {
    throw new UploadValidationError('Image too wide. Max 1920px.')
  }
  if (metadata.height && metadata.height > MAX_HEIGHT) {
    throw new UploadValidationError('Image too tall. Max 1080px.')
  }

  const filename = `${randomUUID()}.webp`
  const outputPath = path.join(UPLOAD_DIR, filename)

  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  await image.webp({ quality: 85 }).toFile(outputPath)

  return {
    path: `/uploads/${filename}`,
    filename,
  }
}

export async function saveAudio(file: File): Promise<UploadResult> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (Buffer.byteLength(buffer) > MAX_AUDIO_SIZE) {
    throw new UploadValidationError('Audio file too large. Max 10MB.')
  }

  const type = file.type.toLowerCase()
  if (!ALLOWED_AUDIO_FORMATS.includes(type as (typeof ALLOWED_AUDIO_FORMATS)[number])) {
    throw new UploadValidationError('Invalid audio type. Only MP3, WAV, OGG, WebM and AAC allowed.')
  }

  const ext = type === 'audio/mpeg' ? 'mp3' : type.split('/')[1]
  const filename = `${randomUUID()}.${ext}`
  const outputPath = path.join(UPLOAD_DIR, filename)

  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  await fs.writeFile(outputPath, buffer)

  return {
    path: `/uploads/${filename}`,
    filename,
  }
}
