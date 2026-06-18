import { ReactNode, forwardRef, ElementType, ComponentPropsWithoutRef } from 'react'

type GlassCardProps<T extends ElementType = 'div'> = {
  as?: T
  children: ReactNode
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>

const GlassCard = forwardRef<HTMLElement, GlassCardProps<ElementType>>(
  ({ as: Component = 'div', children, className = '', ...props }, ref) => {
    return (
      <Component ref={ref} className={`glass-card p-6 ${className}`} {...props}>
        {children}
      </Component>
    )
  }
)
GlassCard.displayName = 'GlassCard'
export default GlassCard
