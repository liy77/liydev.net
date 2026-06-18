import { InputHTMLAttributes, forwardRef } from 'react'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-theme-surface border border-theme-border rounded-xl text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-[var(--focus-border)] focus:ring-1 focus:ring-[var(--focus-ring)] ${className}`}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
export default Input
