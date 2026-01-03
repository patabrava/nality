'use client'

import { useState, useCallback, useEffect } from 'react'

interface UseModalOptions {
  onOpen?: () => void
  onClose?: () => void
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
  preventBodyScroll?: boolean
}

interface UseModalReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const {
    onOpen,
    onClose,
    closeOnEscape = true,
    closeOnBackdrop = true,
    preventBodyScroll = true
  } = options

  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => {
    setIsOpen(true)
    onOpen?.()
  }, [onOpen])

  const close = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  const toggle = useCallback(() => {
    if (isOpen) {
      close()
    } else {
      open()
    }
  }, [isOpen, open, close])

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeOnEscape, isOpen, close])

  // Handle body scroll prevention
  useEffect(() => {
    if (!preventBodyScroll) return undefined

    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
    
    return undefined
  }, [isOpen, preventBodyScroll])

  return {
    isOpen,
    open,
    close,
    toggle
  }
}

// Hook for managing multiple modals with z-index stacking
export function useModalStack() {
  const [openModals, setOpenModals] = useState<string[]>([])

  const openModal = useCallback((modalId: string) => {
    setOpenModals(prev => {
      if (!prev.includes(modalId)) {
        return [...prev, modalId]
      }
      return prev
    })
  }, [])

  const closeModal = useCallback((modalId: string) => {
    setOpenModals(prev => prev.filter(id => id !== modalId))
  }, [])

  const closeAllModals = useCallback(() => {
    setOpenModals([])
  }, [])

  const getModalZIndex = useCallback((modalId: string) => {
    const index = openModals.indexOf(modalId)
    return index === -1 ? 0 : 1000 + index
  }, [openModals])

  const isTopModal = useCallback((modalId: string) => {
    return openModals[openModals.length - 1] === modalId
  }, [openModals])

  return {
    openModals,
    openModal,
    closeModal,
    closeAllModals,
    getModalZIndex,
    isTopModal
  }
}

export default useModal