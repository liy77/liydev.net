'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'
import SortableProjectList from '@/components/projects/SortableProjectList'
import type { Project } from '@/types'

export default function AdminProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/projects')
      .then(async (res) => {
        if (!res.ok) throw new Error('Falha ao carregar projetos')
        const data = await res.json()
        setProjects(data.projects || [])
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Falha ao carregar projetos')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir?')) return
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id))
      router.refresh()
    } else {
      alert('Falha ao excluir projeto')
    }
  }

  const handleReorder = async (newProjects: Project[]) => {
    setProjects(newProjects)

    const order = newProjects.map((p, index) => ({
      id: p.id,
      display_order: index + 1,
    }))

    const res = await fetch('/api/projects/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    })

    if (!res.ok) {
      setError('Falha ao salvar nova ordem')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-theme-primary">Projetos</h2>
        <Button asChild>
          <Link href="/admin/projects/new">Novo projeto</Link>
        </Button>
      </div>

      <GlassCard>
        {loading ? (
          <p className="text-theme-muted">Carregando...</p>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : projects.length === 0 ? (
          <p className="text-theme-muted">Nenhum projeto cadastrado.</p>
        ) : (
          <SortableProjectList
            projects={projects}
            onReorder={handleReorder}
            onDelete={handleDelete}
          />
        )}
      </GlassCard>
    </div>
  )
}
