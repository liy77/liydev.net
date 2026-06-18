import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function AdminIndexPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect('/admin/projects')
  }
  redirect('/admin/login')
}
