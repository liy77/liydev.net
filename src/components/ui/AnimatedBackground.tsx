'use client'

import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    resize()
    window.addEventListener('resize', resize)

    const blobs = [
      { x: width * 0.2, y: height * 0.3, r: 300, dx: 0.3, dy: 0.2, color: 'rgba(56, 189, 248, 0.15)' },
      { x: width * 0.8, y: height * 0.6, r: 350, dx: -0.2, dy: 0.3, color: 'rgba(168, 85, 247, 0.12)' },
      { x: width * 0.5, y: height * 0.8, r: 250, dx: 0.15, dy: -0.25, color: 'rgba(236, 72, 153, 0.1)' },
    ]

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

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

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)' }}
    />
  )
}
