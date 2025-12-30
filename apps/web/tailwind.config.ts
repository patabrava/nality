import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        'serif-text': ['var(--font-serif-text)', 'serif'],
      },
      colors: {
        // Design System Colors
        background: 'var(--bg-color)',
        surface: 'var(--surface-color)',
        gold: {
          DEFAULT: 'var(--accent-gold)',
          dim: 'var(--accent-gold-dim)',
        },
        
        // Use simple color values to avoid circular references
        'tl-bg': '#0F0F10',
        'tl-ink': '#FFFFFF',
        'tl-surface': '#1C1C1E',
        'tl-accent': '#007AFF',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #fbf5b7 0%, #bf953f 50%, #b38728 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 1.2s cubic-bezier(0.2, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 1.5s ease-out forwards',
        'shine': 'shine 1.5s ease-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config