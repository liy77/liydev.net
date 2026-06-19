'use client'

import { useEffect, useRef, useState } from 'react'
import type { SiteSettings } from '@/lib/settings'

export default function BackgroundMusic() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(50)
  const [showControls, setShowControls] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  // Aplica o volume usando o GainNode (Web Audio) quando disponível. No iOS/Safari
  // a propriedade `audio.volume` é somente-leitura e ignorada, então o slider só
  // funciona de verdade através do GainNode. Antes do grafo existir, caímos no
  // fallback de `audio.volume` (funciona no desktop).
  const applyVolume = (v: number) => {
    if (gainRef.current) {
      gainRef.current.gain.value = v / 100
    } else if (audioRef.current) {
      audioRef.current.volume = v / 100
    }
  }

  // Cria o grafo de áudio (AudioContext -> source -> gain -> destino) de forma
  // preguiçosa, dentro de um gesto do usuário (exigência das políticas de autoplay).
  const ensureGraph = () => {
    const audio = audioRef.current
    if (!audio) return
    if (!ctxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      const ctx = new Ctor()
      const source = ctx.createMediaElementSource(audio)
      const gain = ctx.createGain()
      gain.gain.value = volume / 100
      source.connect(gain).connect(ctx.destination)
      ctxRef.current = ctx
      sourceRef.current = source
      gainRef.current = gain
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {})
    }
  }

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
    // Não baixa o arquivo (pode ser grande) até o usuário ativar o som.
    audio.preload = muted ? 'none' : 'auto'
    audio.loop = true
    audio.volume = volume / 100
    audioRef.current = audio

    if (!muted) {
      audio.play().catch(() => {})
    }

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
      gainRef.current = null
      sourceRef.current = null
      ctxRef.current?.close().catch(() => {})
      ctxRef.current = null
    }
  }, [settings?.background_music])

  useEffect(() => {
    applyVolume(volume)
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!muted) {
      ensureGraph()
      applyVolume(volume)
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
    localStorage.setItem('bg-music-muted', String(muted))
  }, [muted])

  if (!settings?.background_music) return null

  const MutedIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  )
  const SoundIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  )

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      <div
        className={`glass-card flex items-center gap-3 overflow-hidden transition-all duration-300 ease-out ${
          showControls
            ? 'max-w-[260px] opacity-100 px-3 py-2'
            : 'max-w-0 opacity-0 px-0 py-0 border-0'
        }`}
      >
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="shrink-0 text-theme-primary hover:opacity-80 transition-opacity"
          aria-label={muted ? 'Tocar música' : 'Silenciar música'}
        >
          {muted ? MutedIcon : SoundIcon}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => {
            const v = Number(e.target.value)
            setVolume(v)
            // Mexer no volume reativa o som se estiver mutado e o volume > 0
            if (v > 0 && muted) setMuted(false)
          }}
          className="w-28 accent-[var(--accent-blue)]"
          aria-label="Volume da música"
        />
        <span className="text-xs text-theme-secondary w-8 shrink-0">{volume}%</span>
      </div>
      <button
        type="button"
        onClick={() => {
          // Um toque no ícone: toca/muta E expande (ou recolhe) a barra de volume.
          setMuted((m) => {
            const next = !m
            setShowControls(!next)
            return next
          })
        }}
        className="glass-button w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0"
        aria-label={muted ? 'Tocar música' : 'Silenciar música'}
        aria-expanded={showControls}
      >
        {muted ? MutedIcon : SoundIcon}
      </button>
    </div>
  )
}
