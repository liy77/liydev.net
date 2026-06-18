'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import GlassCard from '@/components/ui/GlassCard'
import ImageUpload from './ImageUpload'
import type { Project } from '@/types'

interface ProjectFormProps {
  project?: Project
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [imagePath, setImagePath] = useState(project?.image_path || '')

  const isEditing = !!project

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!imagePath) {
      setError('Envie uma imagem para o projeto')
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const payload = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      short_description: formData.get('short_description'),
      description: formData.get('description'),
      github_url: formData.get('github_url'),
      website_url: formData.get('website_url') || '',
      image_path: imagePath,
    }

    const url = isEditing ? `/api/projects/${project.id}` : '/api/projects'
    const method = isEditing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/admin/projects')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save project')
    }
  }

  return (
    <GlassCard className="animate-slide-up">
      <h1 className="text-2xl font-bold text-gradient mb-6">
        {isEditing ? 'Editar projeto' : 'Novo projeto'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input name="title" defaultValue={project?.title} placeholder="Título" required />
          <Input name="slug" defaultValue={project?.slug} placeholder="Slug (ex: copper-lang)" required />
        </div>

        <Textarea
          name="short_description"
          defaultValue={project?.short_description}
          placeholder="Descrição curta (aparece no card)"
          required
        />

        <Textarea
          name="description"
          defaultValue={project?.description}
          placeholder="Descrição completa (markdown)"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input name="github_url" defaultValue={project?.github_url} placeholder="URL do GitHub" required />
          <Input name="website_url" defaultValue={project?.website_url || ''} placeholder="URL do site (opcional)" />
        </div>

        <ImageUpload defaultImage={project?.image_path} onUpload={setImagePath} />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push('/admin/projects')}>
            Cancelar
          </Button>
        </div>
      </form>
    </GlassCard>
  )
}
