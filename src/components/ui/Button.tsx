import {
  ButtonHTMLAttributes,
  Children,
  ReactElement,
  RefAttributes,
  cloneElement,
  forwardRef,
  isValidElement,
} from 'react'
import LiquidGlassWrapper from './LiquidGlassWrapper'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  asChild?: boolean
}

const Button = forwardRef<HTMLElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, asChild, ...props }, ref) => {
    const baseStyles = 'px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center'
    const variants = {
      primary: 'text-white',
      secondary: 'bg-theme-surface border border-theme-border text-theme-primary hover:bg-theme-surface hover:border-theme-secondary',
      danger: 'bg-red-500/15 border border-red-500/30 text-red-500 hover:bg-red-500/25',
    }

    const classes = `${baseStyles} ${variants[variant]} ${className}`.trim()

    const content = asChild && isValidElement(children) ? (
      (() => {
        const child = Children.only(children) as ReactElement<
          { className?: string } & RefAttributes<HTMLElement>
        >
        const childClassName = child.props.className || ''
        return cloneElement(child, {
          className: childClassName ? `${childClassName} ${classes}` : classes,
          ref,
        })
      })()
    ) : (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} {...props}>
        {children}
      </button>
    )

    if (variant === 'primary') {
      return (
        <LiquidGlassWrapper
          className="rounded-xl inline-block"
          cornerRadius={12}
          displacementScale={32}
          blurAmount={0.06}
          saturation={150}
          aberrationIntensity={1}
          elasticity={0.2}
        >
          {content}
        </LiquidGlassWrapper>
      )
    }

    return content
  }
)
Button.displayName = 'Button'
export default Button
