/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', lg: '2rem', xl: '2.5rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        navy: {
          DEFAULT: '#062B63',
          700: '#0A3478',
          600: '#0C3F8F',
        },
        aces: {
          navy: '#062B63',
          deep: '#0A3478',
          blue: '#0873D1',
          electric: '#00AEEF',
          gold: '#E6AD20',
          yellow: '#FFB000',
          ink: '#17243A',
          slate: '#64748B',
          mist: '#F3F6FA',
        },
        ink: {
          DEFAULT: '#17243A',
          soft: '#64748B',
        },
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['clamp(3rem, 6vw, 4.75rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display': ['clamp(2.4rem, 4.4vw, 3.4rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
        'display-sm': ['clamp(1.9rem, 3vw, 2.5rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(6, 43, 99, 0.04), 0 12px 32px -12px rgba(6, 43, 99, 0.18)',
        card: '0 2px 4px rgba(6, 43, 99, 0.04), 0 24px 48px -24px rgba(6, 43, 99, 0.28)',
        glow: '0 12px 40px -12px rgba(8, 115, 209, 0.55)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(circle at 1px 1px, rgba(8,115,209,0.14) 1px, transparent 0)',
        'navy-gradient': 'linear-gradient(135deg, #062B63 0%, #0A3478 55%, #0C3F8F 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1.12)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(37, 211, 102, 0.55)' },
          '70%': { boxShadow: '0 0 0 18px rgba(37, 211, 102, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(37, 211, 102, 0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'ken-burns': 'ken-burns 14s ease-out both',
        'pulse-ring': 'pulse-ring 2.4s infinite',
      },
    },
  },
  plugins: [],
};
