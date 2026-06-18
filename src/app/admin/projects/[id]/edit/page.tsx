import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/projects'
import ProjectForm from '@/components/projects/ProjectForm'

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const project = getProjectById(Number(params.id))
  if (!project) notFound()

  return <ProjectForm project={project} />
}
