'use client'

import { useState, useEffect, useMemo } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useRouter, usePathname } from 'next/navigation'
import { ThemeToggleCompact } from '@/components/theme/ThemeToggle'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { HeaderTabButton } from './HeaderTabButton'
import { Menu, X, User, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/components/i18n/I18nProvider'

export function HeaderNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { activeModule, setActiveModule } = useDashboard()
  const { t } = useI18n()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Memoize tabs to avoid unnecessary re-renders
  const tabs = useMemo(() => [
    { id: 'feed', label: t('dashboardNav.tabs.feed') || 'Feed', route: '/dash' },
    { id: 'chapters', label: t('dashboardNav.tabs.chapters') || 'Chapters', route: '/dash/chapters' },
    { id: 'biography', label: t('dashboardNav.tabs.biography') || 'Biography', route: '/dash/biography' },
    { id: 'contact', label: t('dashboardNav.tabs.contact') || 'Contact', route: '/dash/contact' },
    { id: 'profile', label: t('dashboardNav.tabs.profile') || 'Profile', route: '/dash/profile' }
  ] as const, [t])

  // Sync activeModule with current pathname
  useEffect(() => {
    if (!pathname) return

    // Sort tabs by route length (descending) to match most specific route first
    // e.g. Match /dash/timeline before /dash
    const sortedTabs = [...tabs].sort((a, b) => b.route.length - a.route.length)

    // Normalize path to ignore potential locale prefixes (e.g. /en/dash -> /dash)
    // We check if the path contains the route
    const currentTab = sortedTabs.find(tab => {
      return pathname.endsWith(tab.route) || pathname.includes(`${tab.route}/`)
    })

    if (currentTab && currentTab.id !== activeModule) {
      setActiveModule(currentTab.id)
    }
  }, [pathname, tabs, activeModule, setActiveModule])

  // Handle scroll effect for glass header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleTabSwitch = (tabId: string, route: string) => {
    setActiveModule(tabId)
    router.push(route)
    setIsMobileMenuOpen(false)
  }

  const handleProfileClick = () => {
    setIsMobileMenuOpen(false)
    router.push('/dash/profile')
  }

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-[10000] transition-all duration-500
        border-b border-white/5
        ${scrolled ? 'bg-[#050505]/95 backdrop-blur-xl h-16 lg:h-20' : 'bg-[#050505]/50 backdrop-blur-md h-20 lg:h-24'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-full flex items-center justify-between">

        {/* Logo */}
        <div className="flex-shrink-0 cursor-pointer group relative z-50" onClick={() => router.push('/')}>
          <h1 className="font-serif text-xl lg:text-2xl tracking-tight text-white group-hover:text-[#D4AF37] transition-colors duration-300">
            NALITY
            <span className="text-[#D4AF37] text-xs align-top ml-1">®</span>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2 p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
          {tabs.map((tab) => (
            <HeaderTabButton
              key={tab.id}
              tab={tab}
              isActive={activeModule === tab.id}
              onClick={() => handleTabSwitch(tab.id, tab.route)}
            />
          ))}
        </nav>

        {/* Right Section: Theme & Profile */}
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeToggleCompact />
          <button
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#D4AF37]/10 border border-white/10 hover:border-[#D4AF37]/30 flex items-center justify-center transition-all duration-300 group"
            aria-label={t('header.accessProfile')}
            onClick={handleProfileClick}
          >
            <User className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden relative z-50 w-10 h-10 flex items-center justify-center text-white active:scale-95 transition-transform"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={t('header.toggleMenu')}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-[#D4AF37]" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[300px] bg-[#0A0A0A] border-l border-white/10 z-50 flex flex-col lg:hidden shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-6 pt-24 border-b border-white/5">
                <span className="font-serif text-2xl text-white block mb-1">{t('header.menu')}</span>
                <span className="text-xs text-[#D4AF37] tracking-widest uppercase">The Autobiography for the Elite</span>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 py-6 px-4 overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {tabs.map((tab) => (
                    <HeaderTabButton
                      key={`mobile-${tab.id}`}
                      tab={tab}
                      isActive={activeModule === tab.id}
                      onClick={() => handleTabSwitch(tab.id, tab.route)}
                      isMobile={true}
                    />
                  ))}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-white/10 bg-white/[0.02]">
                <button
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group mb-6"
                  onClick={handleProfileClick}
                >
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-sm font-medium text-white group-hover:text-[#D4AF37] transition-colors">{t('header.myProfile')}</div>
                    <div className="text-xs text-gray-500">{t('header.viewSettings')}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#D4AF37]" />
                </button>

                <div className="flex items-center justify-between px-2">
                  <div className="text-xs text-gray-600 uppercase tracking-wider">Preferences</div>
                  <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ThemeToggleCompact />
                  </div>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
