import { ReactNode, forwardRef, HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`glass-card p-6 ${className}`} {...props}>
        {children}
      </div>
    )
  }
)
GlassCard.displayName = 'GlassCard'
export default GlassCard
