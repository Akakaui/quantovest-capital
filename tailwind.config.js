/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        accent: {
          signal: '#22C55E',
          active: '#16A34A',
          soft: 'rgba(34, 197, 94, 0.10)',
        },
        semantic: {
          up: '#22C55E',
          down: '#CF202F',
        },
        dark: {
          bg: '#0A0D0C',
          surface: '#12161A',
          'surface-strong': '#1A1F24',
          border: '#202722',
          muted: '#A8ACB3',
        },
        light: {
          bg: '#FFFFFF',
          surface: '#F7F7F7',
          'surface-strong': '#EEF0F3',
          border: '#DEE1E6',
          muted: '#5B616E',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'pill': '100px',
        'xl': '24px',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        }
      }
    },
  },
  plugins: [],
}
