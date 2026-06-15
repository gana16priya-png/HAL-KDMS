/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hal: {
          navy: '#0B2545',
          steel: '#134074',
          powder: '#8DA9C4',
          ice: '#EEF4F8',
          silver: '#C5D3E8',
          darkBg: '#050C1A',
          darkCard: '#0E1E38',
          darkBorder: '#1A365D',
          glow: '#38BDF8'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
