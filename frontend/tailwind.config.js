/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          600: '#4f46e5'
        },
        accent: {
          DEFAULT: '#f472b6'
        }
      },
      fontSize: {
        'display-md': ['2.25rem', { lineHeight: '1.1' }], // 36px
        'display-lg': ['3.75rem', { lineHeight: '1.05' }], // 60px
      },
      spacing: {
        '9': '2.25rem'
      }
    },
  },
  plugins: [],
};
