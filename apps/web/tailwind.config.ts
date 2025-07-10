import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Use simple color values to avoid circular references
        'tl-bg': '#0F0F10',
        'tl-ink': '#FFFFFF',
        'tl-surface': '#1C1C1E',
        'tl-accent': '#007AFF',
      },
    },
  },
  plugins: [],
}

export default config 