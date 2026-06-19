import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen px-4 md:px-6 py-8 max-w-5xl mx-auto">
      <AdminHeader email={user.email} />
      {children}
    </div>
  )
}
