'use client'

import { motion } from 'framer-motion'
import { LayoutGrid, Calendar, MessageSquare, Users, Settings, Loader2, AlertTriangle } from 'lucide-react'

export interface Tab {
  id: string
  label: string
  route: string
  icon?: string
}

interface HeaderTabButtonProps {
  tab: Tab
  isActive: boolean
  isLoading?: boolean
  hasError?: boolean
  onClick: () => void
  onFocus?: () => void
  tabIndex?: number
  isMobile?: boolean
}

export function HeaderTabButton({
  tab,
  isActive,
  isLoading = false,
  hasError = false,
  onClick,
  onFocus,
  tabIndex = 0,
  isMobile = false
}: HeaderTabButtonProps) {

  // Icon mapping
  const getIcon = (id: string) => {
    switch (id) {
      case 'dashboard': return LayoutGrid
      case 'timeline': return Calendar
      case 'chat': return MessageSquare
      case 'contact': return Users
      case 'settings': return Settings
      default: return LayoutGrid
    }
  }

  const Icon = getIcon(tab.id)

  return (
    <button
      onClick={onClick}
      onFocus={onFocus}
      role="tab"
      tabIndex={tabIndex}
      aria-selected={isActive}
      aria-label={`Switch to ${tab.label}`}
      className={`
        relative group flex items-center gap-3 transition-all duration-500
        ${isMobile
          ? 'w-full justify-start p-4 rounded-xl hover:bg-white/5'
          : 'justify-center px-4 py-2 rounded-full'}
        ${isActive
          ? 'text-[#D4AF37] ' + (isMobile ? 'bg-[#D4AF37]/5' : '')
          : 'text-gray-400 hover:text-gray-100'}
      `}
    >
      {/* Active Background/Glow (Desktop) */}
      {!isMobile && isActive && (
        <motion.div
          className="absolute inset-0 bg-[#D4AF37]/10 rounded-full blur-[1px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Mobile Active Indicator */}
      {isMobile && isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[2px] bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)] rounded-r-full" />
      )}

      {/* Icon Wrapper */}
      <div className={`relative ${isMobile ? 'ml-2' : ''}`}>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : hasError ? (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        ) : (
          <Icon
            className={`
              transition-transform duration-300
              ${isMobile ? 'w-5 h-5' : 'w-4 h-4'}
              ${isActive ? 'scale-110' : 'group-hover:scale-110'}
            `}
          />
        )}
      </div>

      {/* Label */}
      <span className={`
        font-medium tracking-wide transition-colors duration-300
        ${isMobile ? 'text-base' : 'hidden sm:inline text-sm'}
        ${isActive ? 'text-[#D4AF37]' : 'text-gray-400 group-hover:text-gray-100'}
      `}>
        {tab.label}
      </span>

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
      </div>
    </button>
  )
}
