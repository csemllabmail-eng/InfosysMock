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
        brand: {
          50: '#f0f6fc',
          100: '#e1eef8',
          200: '#c3ddf2',
          300: '#94c5e9',
          400: '#5fa5dc',
          500: '#006699', // Infosys corporate & academic blue
          600: '#005080',
          700: '#003e66',
          800: '#002f4d',
          900: '#002033',
          950: '#001320',
        },
        navy: {
          50: '#f0f4f9',
          100: '#dce5f1',
          200: '#bfd1e6',
          300: '#95b3d6',
          400: '#648fc1',
          500: '#3f6fa9',
          600: '#2d548b',
          700: '#23416e',
          800: '#1b3254',
          900: '#0f2038',
          950: '#091322',
        },
        edu: {
          blue: '#0284c7',
          teal: '#0f766e',
          forest: '#15803d',
          amber: '#b45309',
          wine: '#881337',
          slate: '#334155',
          gold: '#c2410c'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Fira Code"', 'JetBrains Mono', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}

