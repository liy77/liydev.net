import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { updateProjectOrder } from '@/lib/projects'

const reorderSchema = z.array(
  z.object({
    id: z.number(),
    display_order: z.number(),
  })
)

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = reorderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid order data' }, { status: 400 })
  }

  updateProjectOrder(parsed.data)
  return NextResponse.json({ success: true })
}
