import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/projects'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug)
  if (!project) notFound()

  return (
    <main className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      <Link href="/" className="text-white/60 hover:text-white transition-colors mb-8 inline-block">
        ← Voltar
      </Link>

      <GlassCard className="animate-slide-up">
        <div className="relative aspect-video mb-8 overflow-hidden rounded-xl">
          <Image
            src={project.image_path}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <h1 className="text-4xl font-bold text-gradient mb-4">{project.title}</h1>
        <p className="text-white/70 text-lg mb-8 leading-relaxed">{project.description}</p>

        <div className="flex flex-wrap gap-4">
          <a href={project.github_url} target="_blank" rel="noopener noreferrer">
            <Button>Ver no GitHub</Button>
          </a>
          {project.website_url && (
            <a href={project.website_url} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">Site do projeto</Button>
            </a>
          )}
        </div>
      </GlassCard>
    </main>
  )
}
