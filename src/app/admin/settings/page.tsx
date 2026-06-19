import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import SettingsForm from '@/components/admin/SettingsForm'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login')

  const settings = getSettings()

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold text-theme-primary">Aparência do site</h1>
      <SettingsForm initialSettings={settings} />
    </main>
  )
}
