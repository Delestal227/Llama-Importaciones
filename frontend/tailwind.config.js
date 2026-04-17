/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#F39C12',
          DEFAULT: '#E67E22',
          dark: '#D35400',
        },
        surface: {
          50: '#FFFFFF',
          100: '#FAFAFA',
          200: '#F5F5F5',
          300: '#E0E0E0',
        },
        brand: {
          charcoal: '#1A1A1A',
          gray: '#4A4A4A',
          muted: '#8E8E8E',
        }
      },
      fontFamily: {
        bebas: ['"Bebas Neue"', 'cursive'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'premium': '0 4px 30px rgba(0, 0, 0, 0.05)',
        'premium-hover': '0 10px 40px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
