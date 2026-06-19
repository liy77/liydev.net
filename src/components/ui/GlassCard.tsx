import { ReactNode, CSSProperties } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export default function GlassCard({ children, className = '', style }: GlassCardProps) {
  return (
    <div className={`glass-card p-6 ${className}`} style={style}>
      {children}
    </div>
  )
}
