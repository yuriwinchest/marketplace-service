/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        forest: {
          900: '#021a0f',
          800: '#042f1c',
          700: '#064328',
          600: '#085d35',
          500: '#0a7742',
        },
      },
      backgroundImage: {
        'emerald-gradient': 'linear-gradient(135deg, #021a0f 0%, #042f1c 25%, #064328 50%, #021a0f 100%)',
      },
    },
  },
  plugins: [],
}
