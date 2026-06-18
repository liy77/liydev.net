import Link from 'next/link'
import type { Metadata } from 'next'
import ProjectCard from '@/components/projects/ProjectCard'
import { getAllProjects } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'liy.dev - Projetos pessoais',
  description: 'Projetos pessoais em linguagens de programação, engines de jogos e ferramentas de desenvolvimento.',
}

export default function HomePage() {
  const projects = getAllProjects()

  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">liy.dev</h1>
          <p className="text-white/60">Projetos pessoais em linguagens, engines e ferramentas.</p>
        </div>
        <Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors">
          Sobre
        </Link>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Projetos</h2>
        {projects.length === 0 ? (
          <p className="text-white/40">Nenhum projeto cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
