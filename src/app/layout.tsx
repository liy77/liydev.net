import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'liy.dev — Portfolio',
  description: 'Projetos pessoais de desenvolvimento de software',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased relative min-h-screen pt-24`}>
        <AnimatedBackground />
        <Navbar />
        {children}
        <footer className="relative z-10 px-6 py-8 text-center text-white/40 text-sm">
          <p>© {new Date().getFullYear()} liy.dev — Construído com Next.js, SQLite e muito café.</p>
        </footer>
      </body>
    </html>
  )
}
