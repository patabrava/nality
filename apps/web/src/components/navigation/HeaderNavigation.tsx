'use client'

import { useState, useEffect } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { useRouter, usePathname } from 'next/navigation'
import { ThemeToggleCompact } from '@/components/theme/ThemeToggle'
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher'
import { HeaderTabButton } from './HeaderTabButton'
import { Menu, X, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { useI18n } from '@/components/i18n/I18nProvider'

export function HeaderNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { activeModule, setActiveModule } = useDashboard()
  const { t } = useI18n()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const tabs = [
    { id: 'dashboard', label: t('dashboardNav.tabs.dashboard'), route: '/dash' },
    { id: 'timeline', label: t('dashboardNav.tabs.timeline'), route: '/dash/timeline' },
    { id: 'chat', label: t('dashboardNav.tabs.chat'), route: '/dash/chat' },
    { id: 'contact', label: t('dashboardNav.tabs.contact'), route: '/dash/contact' }
  ] as const

  // Sync activeModule with current pathname
  useEffect(() => {
    const currentTab = tabs.find(tab => {
      if (tab.route === '/dash') {
        // Exact match for dashboard (avoid matching /dash/*)
        return pathname === '/dash' || pathname === '/dash/'
      }
      return pathname?.startsWith(tab.route)
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
      className="fixed top-0 left-0 right-0 z-[10000] min-h-[64px] transition-all duration-500 border-b border-white/10 bg-neutral-950/90 backdrop-blur-md py-3"
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <div className="flex-shrink-0 cursor-pointer group" onClick={() => router.push('/')}>
          <h1 className="font-serif text-2xl tracking-tight text-white group-hover:text-[#D4AF37] transition-colors duration-300">
            NALITY
            <span className="text-[#D4AF37] text-xs align-top ml-1">®</span>
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 p-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
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
        <div className="hidden md:flex items-center gap-4">
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
          className="md:hidden w-10 h-10 flex items-center justify-center text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={t('header.toggleMenu')}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-[#0A0A0A] border-l border-white/10 z-50 p-6 flex flex-col gap-6 md:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif text-xl text-white">{t('header.menu')}</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

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

              <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4">
                <button
                  className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors text-left group"
                  onClick={handleProfileClick}
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#D4AF37]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-[#D4AF37] transition-colors">{t('header.myProfile')}</div>
                    <div className="text-xs text-gray-500">{t('header.viewSettings')}</div>
                  </div>
                </button>
                <div className="flex items-center justify-center gap-4">
                  <LanguageSwitcher />
                  <ThemeToggleCompact />
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
