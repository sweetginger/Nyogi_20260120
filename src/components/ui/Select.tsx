'use client'

import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 
              border rounded-xl appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:border-transparent
              transition-all duration-200
              ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-surface-200 dark:border-surface-700 focus:ring-primary-500'
              }
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-surface-400">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-surface-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

