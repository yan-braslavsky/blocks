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
    `

    const variants = {
      default: `
        border border-slate-200
      `,
      outlined: `
        border-2 border-slate-300
      `,
      elevated: `
        border border-slate-200 shadow-md
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