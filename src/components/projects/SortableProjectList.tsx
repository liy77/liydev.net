'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'
import type { Project } from '@/types'

interface SortableProjectListProps {
  projects: Project[]
  onReorder: (projects: Project[]) => void
  onDelete: (id: number) => void
}

export default function SortableProjectList({
  projects,
  onReorder,
  onDelete,
}: SortableProjectListProps) {
  const move = (index: number, direction: number) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= projects.length) return

    const newProjects = [...projects]
    const [moved] = newProjects.splice(index, 1)
    newProjects.splice(newIndex, 0, moved)

    onReorder(newProjects)
  }

  return (
    <ul className="space-y-3">
      {projects.map((project, index) => (
        <GlassCard as="li" key={project.id} className="flex justify-between items-center p-4">
          <div className="flex items-center gap-4">
            <span className="text-theme-secondary text-sm w-8">#{project.display_order}</span>
            <div>
              <h3 className="font-medium text-theme-primary">{project.title}</h3>
              <p className="text-theme-secondary text-sm">/{project.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="secondary"
                className="px-2 py-1 text-xs"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Mover ${project.title} para cima`}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="px-2 py-1 text-xs"
                onClick={() => move(index, 1)}
                disabled={index === projects.length - 1}
                aria-label={`Mover ${project.title} para baixo`}
              >
                ↓
              </Button>
            </div>
            <Button asChild variant="secondary" className="text-sm">
              <Link href={`/admin/projects/${project.id}/edit`}>Editar</Link>
            </Button>
            <Button
              variant="danger"
              className="text-sm"
              onClick={() => onDelete(project.id)}
            >
              Excluir
            </Button>
          </div>
        </GlassCard>
      ))}
    </ul>
  )
}
