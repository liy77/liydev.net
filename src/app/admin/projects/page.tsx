'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'
import type { Project } from '@/types'

export default function AdminProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir?')) return
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
      router.refresh()
    } else {
      alert('Failed to delete project')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Projetos</h2>
        <Link href="/admin/projects/new">
          <Button>Novo projeto</Button>
        </Link>
      </div>

      <GlassCard>
        {loading ? (
          <p className="text-white/40">Carregando...</p>
        ) : projects.length === 0 ? (
          <p className="text-white/40">Nenhum projeto cadastrado.</p>
        ) : (
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
                <div className="flex gap-2">
                  <Link href={`/admin/projects/${project.id}/edit`}>
                    <Button variant="secondary" className="text-sm">
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    className="text-sm"
                    onClick={() => handleDelete(project.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}
