'use client'

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
  return (
    <button
      className="w-full h-16 flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{
        color: isActive ? 'var(--c-primary-invert)' : 'var(--c-neutral-dark)',
        backgroundColor: isActive ? 'var(--c-neutral-dark)' : 'transparent'
      }}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      aria-label={`Switch to ${tab.label}`}
    >
      {/* Icon with loading/error states */}
      <span className="text-lg relative">
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
      
      <span className="text-[10px] leading-tight">
        {tab.label}
      </span>
    </button>
  )
}
