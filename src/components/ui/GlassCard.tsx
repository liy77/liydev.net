import { ReactNode } from 'react'
import LiquidGlassWrapper from './LiquidGlassWrapper'

interface GlassCardProps {
  children: ReactNode
  className?: string
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <LiquidGlassWrapper
      className={`rounded-2xl ${className}`}
      cornerRadius={16}
      displacementScale={40}
      blurAmount={0.08}
      saturation={140}
      aberrationIntensity={1}
      elasticity={0.15}
    >
      <div className="p-6">{children}</div>
    </LiquidGlassWrapper>
  )
}
