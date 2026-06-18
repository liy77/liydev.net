import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto">
        <div className="glass-card px-6 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gradient">
            liy.dev
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Projetos
            </Link>
            <Link
              href="/about"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Sobre
            </Link>
            <Link
              href="/admin"
              className="text-sm px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
