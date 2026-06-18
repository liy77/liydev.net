import { NextResponse } from 'next/server'
import { getAllProjects, createProject } from '@/lib/projects'
import { requireAuth } from '@/lib/auth'
import { projectWithImageSchema } from '@/lib/validators'

export async function GET() {
  const projects = getAllProjects()
  return NextResponse.json({ success: true, projects })
}

export async function POST(request: Request) {
  await requireAuth()

  const body = await request.json()
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
    return NextResponse.json({ success: false, error: 'Slug already exists' }, { status: 409 })
  }
}
