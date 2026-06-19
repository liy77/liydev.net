import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { saveImage, UploadValidationError } from '@/lib/upload'
import { POST as uploadPOST } from '@/app/api/upload/route'

const createdFiles: string[] = []

const mockRequireAuth = vi.fn()

vi.mock('@/lib/auth', () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
}))

async function createImageBuffer(
  options: { width?: number; height?: number; format?: 'png' | 'jpeg' | 'webp' } = {}
): Promise<Buffer> {
  const { width = 100, height = 100, format = 'png' } = options
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    .toFormat(format)
    .toBuffer()
}

async function createLargePngBuffer(): Promise<Buffer> {
  const width = 3000
  const height = 3000
  const raw = Buffer.alloc(width * height * 3)
  for (let i = 0; i < raw.length; i++) {
    raw[i] = Math.floor(Math.random() * 256)
  }
  return sharp(raw, { raw: { width, height, channels: 3 } })
    .png({ compressionLevel: 0 })
    .toBuffer()
}

async function cleanupFile(webPath: string) {
  const filePath = path.join(process.cwd(), 'public', webPath)
  try {
    await fs.unlink(filePath)
  } catch {
    // ignore missing files
  }
}

afterAll(async () => {
  for (const file of createdFiles) {
    await cleanupFile(file)
  }
})

describe('saveImage helper', () => {
  it('saves a valid image and returns a webp path', async () => {
    const buffer = await createImageBuffer({ format: 'png' })
    const file = new File([buffer], 'test.png', { type: 'image/png' })

    const result = await saveImage(file)

    expect(result.path.startsWith('/uploads/')).toBe(true)
    expect(result.filename.endsWith('.webp')).toBe(true)
    createdFiles.push(result.path)

    const savedPath = path.join(process.cwd(), 'public', result.path)
    await fs.access(savedPath)
  })

  it('rejects invalid image content regardless of declared type', async () => {
    const buffer = Buffer.from('this is not an image')
    const file = new File([buffer], 'fake.png', { type: 'image/png' })

    await expect(saveImage(file)).rejects.toBeInstanceOf(UploadValidationError)
  })

  it('rejects oversized files based on buffer byte length', async () => {
    const buffer = await createLargePngBuffer()
    expect(Buffer.byteLength(buffer)).toBeGreaterThan(2 * 1024 * 1024)

    const file = new File([buffer], 'large.png', { type: 'image/png' })

    await expect(saveImage(file)).rejects.toThrow('File too large')
  })
})

describe('upload API route', () => {
  beforeEach(() => {
    mockRequireAuth.mockReset()
  })

  it('returns 401 when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(new Error('Unauthorized'))

    const formData = new FormData()
    const buffer = await createImageBuffer({ format: 'png' })
    formData.append('type', 'image')
    formData.append('file', new File([buffer], 'test.png', { type: 'image/png' }))

    const request = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await uploadPOST(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('returns 400 when file field is missing', async () => {
    mockRequireAuth.mockResolvedValue({ id: 1, email: 'admin@example.com' })

    const request = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: new FormData(),
    })

    const response = await uploadPOST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('No file provided')
  })

  it('returns path for valid authenticated upload', async () => {
    mockRequireAuth.mockResolvedValue({ id: 1, email: 'admin@example.com' })

    const formData = new FormData()
    const buffer = await createImageBuffer({ format: 'webp' })
    formData.append('type', 'image')
    formData.append('file', new File([buffer], 'test.webp', { type: 'image/webp' }))

    const request = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await uploadPOST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.path.startsWith('/uploads/')).toBe(true)
    createdFiles.push(data.path)
  })

  it('returns 400 for invalid file type', async () => {
    mockRequireAuth.mockResolvedValue({ id: 1, email: 'admin@example.com' })

    const formData = new FormData()
    const buffer = Buffer.from('not an image')
    formData.append('type', 'image')
    formData.append('file', new File([buffer], 'fake.png', { type: 'image/png' }))

    const request = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await uploadPOST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('returns 400 for oversized file', async () => {
    mockRequireAuth.mockResolvedValue({ id: 1, email: 'admin@example.com' })

    const buffer = await createLargePngBuffer()
    const formData = new FormData()
    formData.append('type', 'image')
    formData.append('file', new File([buffer], 'large.png', { type: 'image/png' }))

    const request = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    })

    const response = await uploadPOST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
  })
})
