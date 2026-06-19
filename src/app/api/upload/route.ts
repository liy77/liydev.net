import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { saveImage, saveAudio, UploadValidationError } from '@/lib/upload'

export async function POST(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const type = (formData.get('type') as string) || 'image'
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const result = type === 'audio' ? await saveAudio(file) : await saveImage(file)
    return NextResponse.json({ success: true, path: result.path })
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
