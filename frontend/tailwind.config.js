/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Dark portfolio theme
        dark: {
          50:  '#f8fafc',
          100: '#e2e8f0',
          200: '#94a3b8',
          300: '#64748b',
          400: '#475569',
          500: '#334155',
          600: '#1e293b',
          700: '#0f172a',
          800: '#0d1117',
          900: '#080c14',
          950: '#030508',
        },
        // Cyan accent
        accent: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Legacy brand (kept for compatibility)
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      backgroundImage: {
        'grid-dots': 'radial-gradient(rgba(6,182,212,0.15) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backgroundSize: {
        'grid-30': '30px 30px',
      },
      animation: {
        'blob':       'blob 8s infinite',
        'blob-slow':  'blob 12s infinite',
        'float':      'float 6s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'fade-up':    'fadeUp 0.6s ease-out forwards',
        'slide-in':   'slideIn 0.5s ease-out forwards',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%':      { transform: 'translate(30px,-50px) scale(1.1)' },
          '66%':      { transform: 'translate(-20px,20px) scale(0.9)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(6,182,212,0.3)' },
          to:   { boxShadow: '0 0 40px rgba(6,182,212,0.6)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'glow-cyan':   '0 0 20px rgba(6,182,212,0.4)',
        'glow-purple': '0 0 20px rgba(139,92,246,0.4)',
        'card-dark':   '0 4px 24px rgba(0,0,0,0.4)',
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
