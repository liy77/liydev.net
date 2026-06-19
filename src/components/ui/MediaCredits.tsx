'use client'

import { useEffect, useState } from 'react'
import type { SiteSettings } from '@/lib/settings'

export default function MediaCredits() {
  const [credits, setCredits] = useState<{ image?: string; music?: string }>({})

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SiteSettings | null) => {
        if (!data) return
        setCredits({
          image: data.background_image_credit?.trim() || undefined,
          music: data.background_music_credit?.trim() || undefined,
        })
      })
      .catch(() => {})
  }, [])

  if (!credits.image && !credits.music) return null

  return (
    <div className="mt-2 space-y-0.5 text-xs text-theme-muted">
      {credits.image && <p>🖼️ Imagem de fundo: {credits.image}</p>}
      {credits.music && <p>🎵 Música: {credits.music}</p>}
    </div>
  )
}
