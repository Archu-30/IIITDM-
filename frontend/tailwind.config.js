/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C63FF', // premium indigo accent
          dark: '#4F8CFF',    // secondary blue accent
        },
        sidebar: {
          bg: 'rgba(12,19,34,0.60)', // glass navy
          text: '#94A3B8',
          active: '#6C63FF',
        },
        customBg: '#05070D',
        cardBg: 'rgba(18,24,38,0.55)',
        textPrimary: '#F8FAFC',
        textSecondary: '#94A3B8',
        available: '#22C55E',
        lowStock: '#F59E0B',
        outOfStock: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg': '0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
    },
  },
  plugins: [],
}
