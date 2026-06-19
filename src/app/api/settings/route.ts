import { NextResponse } from 'next/server'
import { getSettings, updateSettings } from '@/lib/settings'
import { settingsUpdateSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = getSettings()
  return NextResponse.json(settings)
}

export async function PUT(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const result = settingsUpdateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const updated = updateSettings(result.data)
  return NextResponse.json(updated)
}
