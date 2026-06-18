import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'liy.dev — Portfolio',
  description: 'Projetos pessoais de desenvolvimento de software',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
