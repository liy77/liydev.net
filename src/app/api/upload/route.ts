import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { saveImage } from '@/lib/upload'

export async function POST(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 })
    }

    const result = await saveImage(file)
    return NextResponse.json({ success: true, path: result.path })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
