import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllProjects, getProjectBySlug } from '@/lib/projects'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const projects = getAllProjects()
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = getProjectBySlug(params.slug)
  if (!project) {
    return { title: 'Projeto não encontrado | liy.dev' }
  }
  return {
    title: `${project.title} | liy.dev`,
    description: project.short_description || project.description,
  }
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug)
  if (!project) notFound()

  return (
    <main className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      <Link href="/" className="text-theme-secondary hover:text-theme-primary transition-colors mb-8 inline-block">
        ← Voltar
      </Link>

      <GlassCard className="animate-slide-up">
        <div className="relative aspect-video mb-8 overflow-hidden rounded-xl">
          <Image
            src={project.image_path}
            alt={project.title}
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover"
            priority
          />
        </div>

        <h1 className="text-4xl font-bold text-gradient mb-4">{project.title}</h1>
        <p className="text-theme-secondary text-lg mb-8 leading-relaxed">{project.description}</p>

        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
              Ver no GitHub
            </a>
          </Button>
          {project.website_url && (
            <Button asChild variant="secondary">
              <a href={project.website_url} target="_blank" rel="noopener noreferrer">
                Site do projeto
              </a>
            </Button>
          )}
        </div>
      </GlassCard>
    </main>
  )
}
