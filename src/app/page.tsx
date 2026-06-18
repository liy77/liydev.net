import Link from 'next/link'
import type { Metadata } from 'next'
import ProjectCard from '@/components/projects/ProjectCard'
import Button from '@/components/ui/Button'
import { getAllProjects } from '@/lib/projects'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'liy.dev - Projetos pessoais',
  description: 'Projetos pessoais em linguagens de programação, engines de jogos e ferramentas de desenvolvimento.',
}

export default function HomePage() {
  const projects = getAllProjects()

  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      <section className="relative py-20 md:py-32 mb-20 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[120px]" />
        </div>

        <p className="text-blue-500 font-medium mb-4 tracking-wide uppercase text-sm animate-fade-in">
          Portfolio de desenvolvimento
        </p>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
          <span className="text-gradient">liy.dev</span>
        </h1>
        <p className="text-xl md:text-2xl text-theme-secondary max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
          Linguagens de programação, engines de jogos e ferramentas nativas.
          <br />
          Código que vira realidade.
        </p>
        <div className="flex flex-wrap justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Button asChild>
            <Link href="#projetos">Ver projetos</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/about">Sobre mim</Link>
          </Button>
        </div>
      </section>

      <section id="projetos" className="scroll-mt-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-theme-primary mb-2">Projetos</h2>
            <p className="text-theme-muted">Coisas que eu construí do zero.</p>
          </div>
          <Link href="/about" className="text-sm text-theme-muted hover:text-theme-primary transition-colors hidden sm:block">
            Sobre →
          </Link>
        </div>

        {projects.length === 0 ? (
          <p className="text-theme-muted">Nenhum projeto cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
