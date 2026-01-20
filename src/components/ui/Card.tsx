'use client'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  const Component = onClick ? 'button' : 'div'
  
  return (
    <Component
      onClick={onClick}
      className={`
        bg-white dark:bg-surface-900 
        rounded-2xl border border-surface-200 dark:border-surface-800 
        shadow-sm
        ${hover ? 'hover:shadow-md hover:border-surface-300 dark:hover:border-surface-700 transition-all duration-200 cursor-pointer' : ''}
        ${onClick ? 'text-left w-full' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-b border-surface-200 dark:border-surface-800 ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-surface-200 dark:border-surface-800 ${className}`}>
      {children}
    </div>
  )
}

