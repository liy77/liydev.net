'use client'

import type { Project } from '@/types'

interface SortableProjectListProps {
  projects: Project[]
}

export default function SortableProjectList({ projects }: SortableProjectListProps) {
  return (
    <ul className="space-y-3">
      {projects.map((project) => (
        <li
          key={project.id}
          className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <div className="flex items-center gap-4">
            <span className="text-white/30 text-sm w-8">#{project.display_order}</span>
            <div>
              <h3 className="font-medium">{project.title}</h3>
              <p className="text-white/40 text-sm">/{project.slug}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
