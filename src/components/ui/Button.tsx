import {
  ButtonHTMLAttributes,
  Children,
  ReactElement,
  RefAttributes,
  cloneElement,
  forwardRef,
  isValidElement,
} from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  asChild?: boolean
}

const Button = forwardRef<HTMLElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, asChild, ...props }, ref) => {
    const baseStyles = 'px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
      primary: 'glass-button text-white',
      secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
      danger: 'bg-red-500/20 border border-red-500/30 text-red-200 hover:bg-red-500/30',
    }

    const classes = `${baseStyles} ${variants[variant]} ${className}`.trim()

    if (asChild && isValidElement(children)) {
      const child = Children.only(children) as ReactElement<
        { className?: string } & RefAttributes<HTMLElement>
      >
      const childClassName = child.props.className || ''
      return cloneElement(child, {
        className: childClassName ? `${childClassName} ${classes}` : classes,
        ref,
      })
    }

    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button
