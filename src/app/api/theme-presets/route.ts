import { NextResponse } from 'next/server'
import { listPresets, createPreset, deletePreset } from '@/lib/themePresets'
import { getCurrentUser } from '@/lib/auth'
import type { SiteSettings } from '@/lib/settings'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  settings: z.record(z.unknown()) as unknown as z.ZodType<SiteSettings>,
})

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const presets = listPresets()
  return NextResponse.json({ presets })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const result = createSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const preset = createPreset(result.data.name, result.data.settings as unknown as Record<string, unknown>)
  return NextResponse.json({ preset })
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get('id'))
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  deletePreset(id)
  return NextResponse.json({ success: true })
}
