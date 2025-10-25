/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#000000',
          foreground: '#FFFFFF',
        },
        accent: {
          50: '#F4F0FF',
          100: '#E9E0FF',
          200: '#D3C1FF',
          300: '#B492FF',
          400: '#9361FF',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#3E1B78',
          950: '#2E1255',
          DEFAULT: '#7C3AED',
          foreground: '#FFFFFF',
        },
        background: '#000000',
        foreground: '#FFFFFF',
        muted: {
          DEFAULT: 'rgba(255,255,255,0.1)',
          foreground: 'rgba(255,255,255,0.7)',
        },
        card: {
          DEFAULT: 'rgba(0,0,0,0.8)',
          foreground: '#FFFFFF',
        },
        border: 'rgba(255,255,255,0.1)',
        input: 'rgba(255,255,255,0.1)',
        ring: 'rgba(94,23,235,0.5)',
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#FFFFFF',
        },
      },
      fontSize: {
        'display-md': ['2.25rem', { lineHeight: '1.1' }], // 36px
        'display-lg': ['3.75rem', { lineHeight: '1.05' }], // 60px
      },
      spacing: {
        '9': '2.25rem'
      },
      borderRadius: {
        'lg': '0.5rem',
        'md': '0.375rem',
        'sm': '0.25rem',
      }
    },
  },
  plugins: [],
};
