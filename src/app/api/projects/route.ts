import { NextResponse } from 'next/server'
import { getAllProjects, createProject } from '@/lib/projects'
import { requireAuth } from '@/lib/auth'
import { projectWithImageSchema } from '@/lib/validators'

export async function GET() {
  const projects = getAllProjects()
  return NextResponse.json({ success: true, projects })
}

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

  const parsed = projectWithImageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 })
  }

  try {
    const project = createProject({
      ...parsed.data,
      website_url: parsed.data.website_url || null,
      display_order: 0,
    })
    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (error) {
    const isUniqueConstraint =
      error instanceof Error &&
      ((error as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE' ||
        error.message.includes('UNIQUE constraint failed'))
    if (isUniqueConstraint) {
      return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 409 })
    }
    console.error('Failed to create project:', error)
    return NextResponse.json({ success: false, error: 'Failed to create project' }, { status: 500 })
  }
}
