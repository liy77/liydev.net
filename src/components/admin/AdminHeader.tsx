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
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
      <div className="flex items-center gap-6">
        <Link href="/admin/projects" className="text-xl font-bold text-gradient">
          Admin
        </Link>
        <span className="text-white/40 text-sm">{email}</span>
      </div>
      <Button variant="secondary" onClick={handleLogout}>
        Sair
      </Button>
    </header>
  )
}
