'use client'

import React from 'react'

interface AddMemoryButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'children'> {
  label?: string
  icon?: React.ReactNode
  styleOverrides?: React.CSSProperties
}

const ADD_MEMORY_BUTTON_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.6rem',
  padding: '0.9rem 1.25rem',
  borderRadius: '999px',
  border: '1px solid var(--md-sys-color-primary)',
  background: 'var(--md-sys-color-primary)',
  color: 'var(--md-sys-color-on-primary)',
  fontWeight: 700,
  letterSpacing: '0.01em',
  cursor: 'pointer',
  boxShadow: '0 10px 26px rgba(0, 0, 0, 0.35)',
  transition: 'transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease',
}

const applyHoverState = (target: HTMLButtonElement) => {
  target.style.transform = 'translateY(-1px)'
  target.style.boxShadow = '0 14px 36px rgba(0, 0, 0, 0.45)'
  target.style.background = 'var(--md-sys-color-primary-container)'
  target.style.color = 'var(--md-sys-color-on-primary-container)'
}

const resetHoverState = (target: HTMLButtonElement) => {
  target.style.transform = 'translateY(0)'
  target.style.boxShadow = '0 10px 26px rgba(0, 0, 0, 0.35)'
  target.style.background = 'var(--md-sys-color-primary)'
  target.style.color = 'var(--md-sys-color-on-primary)'
}

export function AddMemoryButton({
  label = 'Add memory',
  icon,
  styleOverrides,
  disabled = false,
  onMouseEnter,
  onMouseLeave,
  type = 'button',
  ...buttonProps
}: AddMemoryButtonProps) {
  const mergedStyle: React.CSSProperties = {
    ...ADD_MEMORY_BUTTON_STYLE,
    cursor: disabled ? 'not-allowed' : ADD_MEMORY_BUTTON_STYLE.cursor,
    opacity: disabled ? 0.85 : 1,
    ...styleOverrides,
  }

  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      applyHoverState(event.currentTarget)
    }
    onMouseEnter?.(event)
  }

  const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      resetHoverState(event.currentTarget)
    }
    onMouseLeave?.(event)
  }

  return (
    <button
      type={type}
      aria-label={buttonProps['aria-label'] || label}
      {...buttonProps}
      disabled={disabled}
      style={mergedStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {icon ?? <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>}
      <span>{label}</span>
    </button>
  )
}
