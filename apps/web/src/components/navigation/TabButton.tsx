'use client'

import { LayoutGrid, Calendar, MessageSquare, Users, Settings, Loader2, AlertTriangle, type LucideIcon } from 'lucide-react'

interface Tab {
  id: string
  label: string
  route: string
  icon: string
}

interface TabButtonProps {
  tab: Tab
  isActive: boolean
  isLoading?: boolean
  hasError?: boolean
  onClick: () => void
}

export function TabButton({ tab, isActive, isLoading = false, hasError = false, onClick }: TabButtonProps) {
  // Icon mapping
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'house': return LayoutGrid
      case 'timeline': return Calendar
      case 'chat': return MessageSquare
      case 'user': return Users
      case 'settings': return Settings
      default: return LayoutGrid
    }
  }

  const Icon = getIcon(tab.icon)

  return (
    <button
      className={`
        w-full h-16 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-all duration-200
        hover:bg-white/5 focus:outline-none
        ${isActive ? 'text-[#D4AF37]' : 'text-gray-400 hover:text-gray-200'}
      `}
      style={{
        borderLeft: isActive ? '3px solid #D4AF37' : '3px solid transparent'
      }}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      aria-label={`Switch to ${tab.label}`}
    >
      {/* Icon with loading/error states */}
      <span className="relative">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : hasError ? (
          <AlertTriangle className="w-5 h-5 text-red-500" />
        ) : (
          <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
        )}
      </span>
      
      <span className="leading-tight uppercase tracking-wide">
        {tab.label}
      </span>
    </button>
  )
}
