import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Sobre | liy.dev',
  description: 'Conheça mais sobre o desenvolvedor por trás dos projetos pessoais em linguagens, engines e ferramentas.',
}

const skills = [
  'Rust',
  'C',
  'C++',
  'TypeScript',
  'Compilers',
  'SDL3',
  'Game Engines',
  'UI Toolkits',
]

const socialLinks = [
  { name: 'GitHub', url: 'https://github.com/liy77' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      <section className="mb-12">
        <p className="text-blue-400 font-medium mb-4 tracking-wide uppercase text-sm animate-fade-in">
          Sobre mim
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-6 animate-slide-up">
          Construindo ferramentas de baixo nível
        </h1>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <GlassCard className="md:col-span-2 animate-slide-up">
          <h2 className="text-xl font-semibold mb-4 text-white">Quem sou</h2>
          <p className="text-white/70 leading-relaxed mb-4">
            Sou um desenvolvedor apaixonado por sistemas de software profundos: linguagens de programação,
            toolkits de UI nativos e engines de jogos. Acredito que software bonito também pode ser
            poderoso, e que a experiência do desenvolvedor importa tanto quanto a performance.
          </p>
          <p className="text-white/70 leading-relaxed">
            Meus projetos exploram a fronteira entre abstração de alto nível e controle de baixo nível.
            Do parser ao pixel, gosto de entender e construir cada camada.
          </p>
        </GlassCard>

        <GlassCard className="animate-slide-up flex flex-col items-center justify-center text-center" style={{ animationDelay: '100ms' }}>
          <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
            L
          </div>
          <h3 className="text-lg font-semibold text-white">liy.dev</h3>
          <p className="text-white/50 text-sm">Desenvolvedor de sistemas</p>
        </GlassCard>
      </div>

      <GlassCard className="mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-xl font-semibold mb-6 text-white">Tecnologias & interesses</h2>
        <div className="flex flex-wrap gap-3">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 hover:border-white/20 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="mb-12 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-xl font-semibold mb-4 text-white">Projetos em destaque</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/projects/copper-lang" className="group">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
              <h3 className="font-medium text-white group-hover:text-gradient transition-all">Copper Lang</h3>
              <p className="text-white/50 text-sm mt-1">Linguagem que transpila para Rust</p>
            </div>
          </Link>
          <Link href="/projects/mocida" className="group">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
              <h3 className="font-medium text-white group-hover:text-gradient transition-all">Mocida</h3>
              <p className="text-white/50 text-sm mt-1">Toolkit de UI nativo em C</p>
            </div>
          </Link>
          <Link href="/projects/ondaengine" className="group">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
              <h3 className="font-medium text-white group-hover:text-gradient transition-all">OndaEngine</h3>
              <p className="text-white/50 text-sm mt-1">Engine de jogos 2D + editor</p>
            </div>
          </Link>
        </div>
      </GlassCard>

      <GlassCard className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-xl font-semibold mb-4 text-white">Conecte-se</h2>
        <p className="text-white/70 mb-6">
          Quer trocar uma ideia sobre linguagens, engines ou desenvolvimento nativo?
        </p>
        <div className="flex flex-wrap gap-4">
          {socialLinks.map((link) => (
            <Button key={link.name} asChild>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.name}
              </a>
            </Button>
          ))}
          <Button variant="secondary" asChild>
            <Link href="/">Ver projetos</Link>
          </Button>
        </div>
      </GlassCard>
    </main>
  )
}
