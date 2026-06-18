import { NextResponse } from 'next/server'
import { getProjectById, updateProject, deleteProject } from '@/lib/projects'
import { requireAuth } from '@/lib/auth'
import { projectWithImageSchema } from '@/lib/validators'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const project = getProjectById(Number(params.id))
  if (!project) {
    return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, project })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await requireAuth()

  const body = await request.json()
  const parsed = projectWithImageSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 })
  }

  try {
    const project = updateProject(Number(params.id), {
      ...parsed.data,
      website_url: parsed.data.website_url || null,
    })
    return NextResponse.json({ success: true, project })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Project not found or slug conflict' }, { status: 404 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await requireAuth()
  deleteProject(Number(params.id))
  return NextResponse.json({ success: true })
}
