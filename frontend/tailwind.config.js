/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000',
        },
        accent: {
          DEFAULT: '#a238ff',
          200: '#d1a4ff',
          300: '#b75fff',
          500: '#a238ff',
          600: '#8a1ff0',
          700: '#7215d0',
          foreground: '#000000',
        },
        background: '#000000',
        foreground: '#FFFFFF',
        muted: {
          DEFAULT: '#333333',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#000000',
          foreground: '#FFFFFF',
        },
        border: '#FFFFFF',
        ring: '#FFFFFF',
        destructive: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000',
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
