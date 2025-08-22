'use client'

interface Tab {
  id: string
  label: string
  route: string
  icon: string
}

interface HeaderTabButtonProps {
  tab: Tab
  isActive: boolean
  isLoading?: boolean
  hasError?: boolean
  onClick: () => void
  onFocus?: () => void
  tabIndex?: number
}

export function HeaderTabButton({ 
  tab, 
  isActive, 
  isLoading = false, 
  hasError = false, 
  onClick,
  onFocus,
  tabIndex = 0
}: HeaderTabButtonProps) {
  return (
    <button
      className={`adaptive-tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
      onFocus={onFocus}
      role="tab"
      tabIndex={tabIndex}
      aria-selected={isActive}
      aria-label={`Switch to ${tab.label}`}
    >
      {/* Icon with loading/error states */}
      <span className="mr-1 md:mr-2 text-sm md:text-base relative">
        {isLoading && (
          <span className="absolute inset-0 animate-spin">⟳</span>
        )}
        {hasError && !isLoading && (
          <span style={{ color: 'var(--c-accent-100)' }}>⚠</span>
        )}
        {!isLoading && !hasError && (
          <>
            {tab.icon === 'house' && '🏠'}
            {tab.icon === 'timeline' && '📅'}
            {tab.icon === 'chat' && '💬'}
            {tab.icon === 'user' && '👤'}
            {tab.icon === 'settings' && '⚙️'}
          </>
        )}
      </span>
      
      {/* Label - responsive display */}
      <span className="hidden sm:inline">{tab.label}</span>
    </button>
  )
}
