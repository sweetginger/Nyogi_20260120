'use client'

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 focus:ring-primary-500 active:scale-[0.98]',
      secondary:
        'bg-surface-100 hover:bg-surface-200 text-surface-800 border border-surface-200 hover:border-surface-300 focus:ring-surface-400',
      ghost:
        'hover:bg-surface-100 text-surface-600 hover:text-surface-800 focus:ring-surface-400',
      danger:
        'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 focus:ring-red-500 active:scale-[0.98]',
    }

    const sizes = {
      sm: 'text-sm py-2 px-3 gap-1.5',
      md: 'text-sm py-2.5 px-5 gap-2',
      lg: 'text-base py-3 px-6 gap-2',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

