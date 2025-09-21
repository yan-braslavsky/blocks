import React from 'react'
import { colors, spacing, borderRadius, typography, shadows } from '../../design-system/tokens'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium transition-colors
      focus:outline-none focus:ring-2 focus:ring-offset-2
      dark:focus:ring-offset-slate-900
      disabled:opacity-50 disabled:cursor-not-allowed
    `

    const variants = {
      primary: `
        bg-blue-600 text-white hover:bg-blue-700
        dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700
        focus:ring-blue-500 dark:focus:ring-blue-400
      `,
      secondary: `
        bg-green-600 text-white hover:bg-green-700
        dark:bg-green-600 dark:text-white dark:hover:bg-green-700
        focus:ring-green-500 dark:focus:ring-green-400
      `,
      outline: `
        border border-slate-300 bg-white text-slate-700
        hover:bg-slate-50 focus:ring-blue-500
        dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200
        dark:hover:bg-slate-700 dark:focus:ring-blue-400
      `,
      ghost: `
        text-slate-700 hover:bg-slate-100
        focus:ring-blue-500
        dark:text-slate-200 dark:hover:bg-slate-700
        dark:focus:ring-blue-400
      `
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-base rounded-md',
      lg: 'px-6 py-3 text-lg rounded-lg'
    }

    const combinedClassName = `
      ${baseStyles}
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `.replace(/\s+/g, ' ').trim()

    return (
      <button
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button