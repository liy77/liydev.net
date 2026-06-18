import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 pointer-events-auto">
      <div className="max-w-6xl mx-auto relative">
        <div className="glass-card px-6 py-3 flex items-center justify-between pointer-events-auto">
          <Link href="/" className="text-xl font-bold text-gradient pointer-events-auto relative z-10">
            liy.dev
          </Link>

          <div className="flex items-center gap-6 pointer-events-auto relative z-10">
            <Link
              href="/"
              className="text-sm text-white/70 hover:text-white transition-colors pointer-events-auto"
            >
              Projetos
            </Link>
            <Link
              href="/about"
              className="text-sm text-white/70 hover:text-white transition-colors pointer-events-auto"
            >
              Sobre
            </Link>
            <Link
              href="/admin"
              className="text-sm px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all pointer-events-auto"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
