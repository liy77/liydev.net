'use client'

import { useEffect, useRef, useState } from 'react'
import type { SiteSettings } from '@/lib/settings'

export default function BackgroundMusic() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(50)
  const [showControls, setShowControls] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const savedMute = localStorage.getItem('bg-music-muted')
    setMuted(savedMute === null ? true : savedMute === 'true')

    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SiteSettings | null) => {
        if (data) {
          setSettings(data)
          setVolume(data.music_volume)
        }
      })
  }, [])

  useEffect(() => {
    if (!settings?.background_music) return

    const audio = new Audio(settings.background_music)
    audio.loop = true
    audio.volume = volume / 100
    audio.muted = muted
    audioRef.current = audio

    if (!muted) {
      audio.play().catch(() => {})
    }

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [settings?.background_music])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume / 100
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = muted
    if (!muted) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
    localStorage.setItem('bg-music-muted', String(muted))
  }, [muted])

  if (!settings?.background_music) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {showControls && (
        <div className="glass-card px-3 py-2 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24 accent-[var(--accent-blue)]"
            aria-label="Volume da música"
          />
          <span className="text-xs text-theme-secondary w-8">{volume}%</span>
        </div>
      )}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        className="glass-button w-10 h-10 rounded-full flex items-center justify-center text-white"
        aria-label={muted ? 'Ativar música' : 'Silenciar música'}
      >
        {muted ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>
    </div>
  )
}
