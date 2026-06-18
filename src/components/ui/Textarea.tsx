import { TextareaHTMLAttributes, forwardRef } from 'react'

const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full px-4 py-3 bg-theme-surface border border-theme-border rounded-xl text-theme-primary placeholder:text-theme-muted focus:outline-none focus:border-[var(--focus-border)] focus:ring-1 focus:ring-[var(--focus-ring)] resize-y min-h-[120px] ${className}`}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'
export default Textarea
