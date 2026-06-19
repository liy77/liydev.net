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
        <li key={project.id}>
          <GlassCard className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-4">
            <div className="flex items-start md:items-center gap-3">
            <span className="text-theme-secondary text-sm min-w-[2rem]">
              #{project.display_order}
            </span>
            <div>
              <h3 className="font-medium text-theme-primary text-base">
                {project.title}
              </h3>
              <p className="text-theme-secondary text-sm">/{project.slug}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:flex md:flex-row gap-2">
            <div className="grid grid-cols-2 gap-2 md:flex md:flex-col">
              <Button
                type="button"
                variant="secondary"
                className="min-h-[44px] text-sm md:px-2 md:py-1"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Mover ${project.title} para cima`}
              >
                <span className="md:hidden">Subir</span>
                <span className="hidden md:inline">↑</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="min-h-[44px] text-sm md:px-2 md:py-1"
                onClick={() => move(index, 1)}
                disabled={index === projects.length - 1}
                aria-label={`Mover ${project.title} para baixo`}
              >
                <span className="md:hidden">Descer</span>
                <span className="hidden md:inline">↓</span>
              </Button>
            </div>
            <Button
              asChild
              variant="secondary"
              className="min-h-[44px] text-sm"
            >
              <Link href={`/admin/projects/${project.id}/edit`}>Editar</Link>
            </Button>
            <Button
              variant="danger"
              className="min-h-[44px] text-sm"
              onClick={() => onDelete(project.id)}
            >
              Excluir
            </Button>
          </div>
          </GlassCard>
        </li>
      ))}
    </ul>
  )
}
