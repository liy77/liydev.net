'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import GlassCard from '@/components/ui/GlassCard'
import ImageUpload from './ImageUpload'
import type { Project } from '@/types'

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface ProjectFormProps {
  project?: Project
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [imagePath, setImagePath] = useState(project?.image_path || '')

  const isEditing = !!project
  const slugManuallyEdited = useRef(isEditing)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    const slugInput = document.getElementById('slug') as HTMLInputElement | null
    if (slugInput && !slugManuallyEdited.current) {
      slugInput.value = slugify(title)
    }
  }

  const handleSlugBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    slugManuallyEdited.current = true
    e.target.value = slugify(e.target.value)
  }

  useEffect(() => {
    if (!isEditing) {
      slugManuallyEdited.current = false
    }
  }, [isEditing])

  const handleUpload = (path: string) => {
    setImagePath(path)
    setError('')
  }

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

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/admin/projects')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Falha ao salvar projeto')
      }
    } catch {
      setError('Erro de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassCard className="animate-slide-up">
      <h1 className="text-2xl font-bold text-gradient mb-6">
        {isEditing ? 'Editar projeto' : 'Novo projeto'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor="title" className="text-sm text-theme-secondary">
              Título
            </label>
            <Input
              id="title"
              name="title"
              defaultValue={project?.title}
              placeholder="Título"
              onChange={handleTitleChange}
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="slug" className="text-sm text-theme-secondary">
              Slug
            </label>
            <Input
              id="slug"
              name="slug"
              defaultValue={project?.slug}
              placeholder="Slug (ex: copper-lang)"
              onBlur={handleSlugBlur}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="short_description" className="text-sm text-theme-secondary">
            Descrição curta
          </label>
          <Textarea
            id="short_description"
            name="short_description"
            defaultValue={project?.short_description}
            placeholder="Descrição curta (aparece no card)"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="text-sm text-theme-secondary">
            Descrição completa
          </label>
          <Textarea
            id="description"
            name="description"
            defaultValue={project?.description}
            placeholder="Descrição completa (markdown)"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor="github_url" className="text-sm text-theme-secondary">
              URL do GitHub
            </label>
            <Input
              id="github_url"
              name="github_url"
              defaultValue={project?.github_url}
              placeholder="URL do GitHub"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="website_url" className="text-sm text-theme-secondary">
              URL do site (opcional)
            </label>
            <Input
              id="website_url"
              name="website_url"
              defaultValue={project?.website_url || ''}
              placeholder="URL do site (opcional)"
            />
          </div>
        </div>

        <ImageUpload
          defaultImage={project?.image_path}
          onUpload={handleUpload}
          onError={setError}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-4">
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
