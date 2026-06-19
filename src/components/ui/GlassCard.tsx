import { ReactNode, CSSProperties } from 'react'
import LiquidGlassWrapper from './LiquidGlassWrapper'

interface GlassCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export default function GlassCard({ children, className = '', style }: GlassCardProps) {
  return (
    <LiquidGlassWrapper
      className={`rounded-2xl ${className}`}
      style={style}
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
