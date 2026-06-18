import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getProjectById, updateProject, deleteProject } from '@/lib/projects'
import { requireAuth } from '@/lib/auth'
import { projectWithImageSchema } from '@/lib/validators'

const paramsSchema = z.object({
  id: z.coerce.number().int().positive('Invalid project ID'),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const parsedParams = paramsSchema.safeParse(params)
  if (!parsedParams.success) {
    return NextResponse.json({ success: false, error: 'Invalid project ID' }, { status: 400 })
  }

  const project = getProjectById(parsedParams.data.id)
  if (!project) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, project })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const parsedParams = paramsSchema.safeParse(params)
  if (!parsedParams.success) {
    return NextResponse.json({ success: false, error: 'Invalid project ID' }, { status: 400 })
  }

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

  const parsed = projectWithImageSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 })
  }

  const existing = getProjectById(parsedParams.data.id)
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
  }

  try {
    const project = updateProject(parsedParams.data.id, {
      ...parsed.data,
      website_url: parsed.data.website_url ?? null,
    })
    return NextResponse.json({ success: true, project })
  } catch (error) {
    const isUniqueConstraint =
      error instanceof Error &&
      ((error as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE' ||
        error.message.includes('UNIQUE constraint failed'))
    if (isUniqueConstraint) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 409 })
    }
    console.error('Failed to update project:', error)
    return NextResponse.json({ success: false, error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const parsedParams = paramsSchema.safeParse(params)
  if (!parsedParams.success) {
    return NextResponse.json({ success: false, error: 'Invalid project ID' }, { status: 400 })
  }

  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const existing = getProjectById(parsedParams.data.id)
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
  }

  deleteProject(parsedParams.data.id)
  return NextResponse.json({ success: true })
}
