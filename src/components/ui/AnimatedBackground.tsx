'use client'

import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  baseX: number
  baseY: number
  size: number
  vx: number
  vy: number
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Lighten the animation drastically on mobile / touch devices: fewer particles
    // and no connection lines. This is the main source of jank and slow first
    // paint on phones.
    const isMobile =
      window.matchMedia('(max-width: 768px)').matches ||
      window.matchMedia('(pointer: coarse)').matches
    const drawLines = !isMobile

    const root = document.documentElement
    const themeColors = {
      '--canvas-start': '#0a0a0f',
      '--canvas-mid': '#1a1a2e',
      '--canvas-end': '#0f0f1a',
      '--particle-color': 'rgba(255, 255, 255, 0.4)',
      '--particle-line': 'rgba(255, 255, 255, 0.05)',
      '--blob-blue': 'rgba(56, 189, 248, 0.12)',
      '--blob-purple': 'rgba(168, 85, 247, 0.1)',
      '--blob-pink': 'rgba(236, 72, 153, 0.08)',
    }
    const getVar = (name: keyof typeof themeColors) => {
      const value = getComputedStyle(root).getPropertyValue(name).trim()
      return value || themeColors[name]
    }

    let animationFrameId: number
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      initParticles()
    }

    const initParticles = () => {
      const density = isMobile ? 60000 : 25000
      const cap = isMobile ? 28 : 80
      const count = Math.min(Math.floor((width * height) / density), cap)
      particlesRef.current = []
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        particlesRef.current.push({
          x,
          y,
          baseX: x,
          baseY: y,
          size: Math.random() * 2 + 1,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true }
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId)
      } else {
        animationFrameId = requestAnimationFrame(animate)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    let blobs = [
      { x: width * 0.2, y: height * 0.3, r: 300, dx: 0.3, dy: 0.2, color: getVar('--blob-blue') },
      { x: width * 0.8, y: height * 0.6, r: 350, dx: -0.2, dy: 0.3, color: getVar('--blob-purple') },
      { x: width * 0.5, y: height * 0.8, r: 250, dx: 0.15, dy: -0.25, color: getVar('--blob-pink') },
    ]

    const updateThemeColors = () => {
      blobs[0].color = getVar('--blob-blue')
      blobs[1].color = getVar('--blob-purple')
      blobs[2].color = getVar('--blob-pink')
    }

    const themeObserver = new MutationObserver(updateThemeColors)
    themeObserver.observe(root, { attributes: true, attributeFilter: ['class'] })

    const hasBackgroundImage = () => {
      const bg = getComputedStyle(root).backgroundImage
      return bg && bg !== 'none'
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw base gradient only when no background image is set
      if (!hasBackgroundImage()) {
        const baseGradient = ctx.createLinearGradient(0, 0, width, height)
        baseGradient.addColorStop(0, getVar('--canvas-start'))
        baseGradient.addColorStop(0.5, getVar('--canvas-mid'))
        baseGradient.addColorStop(1, getVar('--canvas-end'))
        ctx.fillStyle = baseGradient
        ctx.fillRect(0, 0, width, height)
      }

      // Mouse spotlight
      if (mouseRef.current.active) {
        const mx = mouseRef.current.x
        const my = mouseRef.current.y
        const spotlight = ctx.createRadialGradient(mx, my, 0, mx, my, 450)
        spotlight.addColorStop(0, 'rgba(56, 189, 248, 0.08)')
        spotlight.addColorStop(0.4, 'rgba(168, 85, 247, 0.04)')
        spotlight.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = spotlight
        ctx.fillRect(0, 0, width, height)
      }

      // Animated blobs
      for (const blob of blobs) {
        blob.x += blob.dx
        blob.y += blob.dy

        if (blob.x < -blob.r || blob.x > width + blob.r) blob.dx *= -1
        if (blob.y < -blob.r || blob.y > height + blob.r) blob.dy *= -1

        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r)
        gradient.addColorStop(0, blob.color)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.beginPath()
        ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Particles reacting to mouse
      const mouse = mouseRef.current
      const particles = particlesRef.current

      ctx.fillStyle = getVar('--particle-color')
      ctx.strokeStyle = getVar('--particle-line')

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Mouse interaction
        if (mouse.active) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 180

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist
            const angle = Math.atan2(dy, dx)
            p.vx -= Math.cos(angle) * force * 0.8
            p.vy -= Math.sin(angle) * force * 0.8
          }
        }

        // Return to base position
        const homeX = p.baseX - p.x
        const homeY = p.baseY - p.y
        p.vx += homeX * 0.01
        p.vy += homeY * 0.01

        // Friction
        p.vx *= 0.94
        p.vy *= 0.94

        p.x += p.vx
        p.y += p.vy

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        // Connect nearby particles (skipped on mobile for performance)
        if (!drawLines) continue
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.globalAlpha = (1 - dist / 100) * 0.3
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('visibilitychange', handleVisibility)
      themeObserver.disconnect()
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ pointerEvents: 'none' }}
    />
  )
}
