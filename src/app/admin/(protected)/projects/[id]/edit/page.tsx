import { notFound } from 'next/navigation'
import { z } from 'zod'
import { getProjectById } from '@/lib/projects'
import ProjectForm from '@/components/projects/ProjectForm'

const idSchema = z.coerce.number().int().positive()

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const parsed = idSchema.safeParse(params.id)
  if (!parsed.success) notFound()

  const project = getProjectById(parsed.data)
  if (!project) notFound()

  return <ProjectForm project={project} />
}
