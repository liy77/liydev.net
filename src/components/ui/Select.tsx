'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-theme-secondary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            style={{ backgroundColor: 'var(--background-mid)' }}
            className={`
              w-full appearance-none
              border border-theme-border hover:border-theme-secondary
              text-theme-primary font-medium
              rounded-xl px-4 py-2.5 pr-10
              focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue
              transition-colors cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `.trim()}
            {...props}
          >
            {children}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
export default Select
