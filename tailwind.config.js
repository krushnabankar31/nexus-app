/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/stores/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nexus brand palette
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',  // primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        // Dark theme surfaces
        surface: {
          100: '#f9fafb',
          200: '#f3f4f6',
          800: '#1a1a2e',   // sidebar bg
          850: '#16213e',   // deep panel
          900: '#0f0f17',   // main bg darkest
          950: '#080810',   // absolute dark
        },
        // Muted text
        muted: {
          foreground: '#6b7280',
        },
        // Status colors
        status: {
          online:    '#22c55e',
          idle:      '#f59e0b',
          dnd:       '#ef4444',
          offline:   '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glow':        '0 0 20px rgba(99,102,241,0.3)',
        'glow-lg':     '0 0 40px rgba(99,102,241,0.4)',
        'panel':       '0 4px 32px rgba(0,0,0,0.4)',
        'float':       '0 8px 32px rgba(0,0,0,0.5)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'fade-in':       'fadeIn 0.2s ease-out',
        'slide-up':      'slideUp 0.3s ease-out',
        'slide-down':    'slideDown 0.3s ease-out',
        'slide-right':   'slideRight 0.25s ease-out',
        'scale-in':      'scaleIn 0.2s ease-out',
        'bounce-soft':   'bounceSoft 0.4s ease-out',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':       'shimmer 1.5s infinite',
        'ping-slow':     'ping 2s cubic-bezier(0,0,0.2,1) infinite',
        'float-up':      'floatUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight:{ from: { opacity: '0', transform: 'translateX(-12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        bounceSoft:{ '0%': { transform: 'scale(0.9)' }, '50%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)' } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        floatUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      backgroundImage: {
        'gradient-radial':    'radial-gradient(var(--tw-gradient-stops))',
        'shimmer-gradient':   'linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.05) 50%, transparent 75%)',
        'hero-gradient':      'linear-gradient(135deg, #0f0f17 0%, #1a1a2e 50%, #16213e 100%)',
        'brand-gradient':     'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'card-gradient':      'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}
