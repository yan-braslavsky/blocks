import React from 'react'
import { colors, spacing, borderRadius, shadows } from '../../design-system/tokens'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = `
      bg-white rounded-lg
      dark:bg-slate-800
    `

    const variants = {
      default: `
        border border-slate-200
        dark:border-slate-600
      `,
      outlined: `
        border-2 border-slate-300
        dark:border-slate-600
      `,
      elevated: `
        border border-slate-200 shadow-md
        dark:border-slate-600 dark:shadow-slate-900/20
      `
    }

    const paddings = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }

    const combinedClassName = `
      ${baseStyles}
      ${variants[variant]}
      ${paddings[padding]}
      ${className}
    `.replace(/\s+/g, ' ').trim()

    return (
      <div
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card