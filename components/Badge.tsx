"use client"
import clsx from 'clsx'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

export type BadgeVariant = 'low' | 'medium' | 'high' | 'safe' | 'caution' | 'dangerous' | 'info' | 'success' | 'warning' | 'danger'

interface BadgeProps {
  level?: BadgeVariant 
  variant?: BadgeVariant 
  children: React.ReactNode
  showIcon?: boolean
}

export default function Badge({ level, variant, children, showIcon = false }: BadgeProps) {
  const activeVariant = level || variant || 'info'
  
  const mapVariantToClass = {
    low: 'badge-low',
    safe: 'badge-low',
    success: 'badge-low',
    medium: 'badge-medium',
    caution: 'badge-medium',
    warning: 'badge-medium',
    high: 'badge-high',
    dangerous: 'badge-high',
    danger: 'badge-high',
    info: 'bg-sky-100 text-sky-800 rounded-full text-xs font-semibold px-2.5 py-0.5 inline-flex items-center'
  }

  const renderIcon = () => {
    if (!showIcon) return null
    const props = { className: "w-3 h-3 mr-1" }
    switch (activeVariant) {
      case 'low':
      case 'safe':
      case 'success':
        return <CheckCircle {...props} />
      case 'medium':
      case 'caution':
      case 'warning':
        return <AlertTriangle {...props} />
      case 'high':
      case 'dangerous':
      case 'danger':
        return <XCircle {...props} />
      case 'info':
        return <Info {...props} />
    }
  }

  return (
    <span className={clsx(mapVariantToClass[activeVariant as keyof typeof mapVariantToClass])}>
      {renderIcon()}
      <span className="capitalize">{children}</span>
    </span>
  )
}
