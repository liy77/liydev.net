import Link from 'next/link'
import GlassCard from '@/components/ui/GlassCard'

export default function AboutPage() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <Link href="/" className="text-white/60 hover:text-white transition-colors mb-8 inline-block">
        ← Voltar
      </Link>

      <GlassCard className="animate-slide-up">
        <h1 className="text-3xl font-bold text-gradient mb-6">Sobre</h1>
        <p className="text-white/70 leading-relaxed mb-6">
          Desenvolvedor apaixonado por construir ferramentas de baixo nível: linguagens de programação,
          toolkits de UI nativos e engines de jogos. Acredito que software bonito também pode ser
          poderoso.
        </p>
        <p className="text-white/70 leading-relaxed">
          Projetos em destaque: <Link href="/projects/copper-lang" className="text-blue-400 hover:underline">Copper Lang</Link>,{' '}
          <Link href="/projects/mocida" className="text-blue-400 hover:underline">Mocida</Link> e{' '}
          <Link href="/projects/ondaengine" className="text-blue-400 hover:underline">OndaEngine</Link>.
        </p>
      </GlassCard>
    </main>
  )
}
