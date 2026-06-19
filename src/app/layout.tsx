import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import AnimatedBackground from '@/components/ui/AnimatedBackground'
import Navbar from '@/components/ui/Navbar'
import ThemeProvider from '@/components/ui/ThemeProvider'
import BackgroundMusic from '@/components/ui/BackgroundMusic'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'liy.dev — Portfolio',
  description: 'Projetos pessoais de desenvolvimento de software',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  const saved = localStorage.getItem('theme')
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                  const theme = saved || (prefersDark ? 'dark' : 'light')
                  document.documentElement.classList.toggle('dark', theme === 'dark')
                  document.documentElement.classList.toggle('light', theme === 'light')
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased relative min-h-screen pt-24`}>
        <ThemeProvider>
          <AnimatedBackground />
          <Navbar />
          {children}
          <BackgroundMusic />
          <footer className="relative z-10 px-6 py-8 text-center text-sm text-theme-muted">
            <p>© {new Date().getFullYear()} liy.dev — Construído com Next.js, SQLite e muito café.</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
