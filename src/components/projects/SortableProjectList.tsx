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

function ArrowUpIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  )
}

function ArrowDownIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function PencilIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
}

function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
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
          <GlassCard className="flex flex-col md:flex-row md:items-center gap-4 p-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <span className="text-theme-muted text-sm font-medium w-8">#{project.display_order}</span>
              <div className="min-w-0">
                <h3 className="font-semibold text-theme-primary text-base truncate">{project.title}</h3>
                <p className="text-theme-secondary text-sm truncate">/{project.slug}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 border border-theme-border rounded-lg p-1 bg-theme-surface/50">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Mover ${project.title} para cima`}
                  className="p-1.5 rounded-md text-theme-secondary hover:bg-theme-surface hover:text-theme-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowUpIcon />
                </button>
                <div className="w-px h-4 bg-theme-border" />
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === projects.length - 1}
                  aria-label={`Mover ${project.title} para baixo`}
                  className="p-1.5 rounded-md text-theme-secondary hover:bg-theme-surface hover:text-theme-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowDownIcon />
                </button>
              </div>

              <Button
                asChild
                variant="secondary"
                className="h-9 px-3 text-sm gap-2"
              >
                <Link href={`/admin/projects/${project.id}/edit`}>
                  <PencilIcon />
                  <span className="hidden sm:inline">Editar</span>
                </Link>
              </Button>

              <Button
                variant="danger"
                className="h-9 px-3 text-sm gap-2"
                onClick={() => onDelete(project.id)}
                aria-label={`Excluir ${project.title}`}
              >
                <TrashIcon />
                <span className="hidden sm:inline">Excluir</span>
              </Button>
            </div>
          </GlassCard>
        </li>
      ))}
    </ul>
  )
}
