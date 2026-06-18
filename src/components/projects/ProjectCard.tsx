import Link from 'next/link'
import Image from 'next/image'
import GlassCard from '@/components/ui/GlassCard'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.slug}`}>
      <GlassCard className="h-full hover:bg-white/[0.08] transition-all duration-300 group overflow-hidden">
        <div className="relative aspect-video mb-4 overflow-hidden rounded-lg">
          <Image
            src={project.image_path}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-gradient transition-all">
          {project.title}
        </h3>
        <p className="text-white/60 text-sm line-clamp-2">{project.short_description}</p>
      </GlassCard>
    </Link>
  )
}
