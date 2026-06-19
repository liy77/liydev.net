'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface AdminHeaderProps {
  email: string
}

export default function AdminHeader({ email }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        router.push('/admin/login')
        router.refresh()
      } else {
        alert('Falha ao sair. Tente novamente.')
      }
    } catch {
      alert('Erro de rede ao sair.')
    }
  }

  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-theme-border gap-4">
      <div className="flex items-center gap-3 md:gap-6 min-w-0">
        <Link href="/admin/projects" className="text-xl font-bold text-gradient shrink-0">
          Admin
        </Link>
        <span className="hidden md:inline text-theme-muted text-sm truncate">
          {email}
        </span>
      </div>
      <Button variant="secondary" onClick={handleLogout}>
        Sair
      </Button>
    </header>
  )
}
