import { ReactNode, forwardRef } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div ref={ref} className={`glass-card p-6 ${className}`}>
        {children}
      </div>
    )
  }
)
GlassCard.displayName = 'GlassCard'
export default GlassCard
