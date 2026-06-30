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
          DEFAULT: '#5edff4', // Your exact color
          50: '#f0fdff',
          100: '#cff9fe',
          200: '#9ff4fc',
          300: '#5edff4', // Main
          400: '#22ccEB', // Slightly darker for hover
          500: '#06b6d4', // Darker for text
          600: '#0891b2',
          900: '#164e63',
        }
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
      }
    },
  },
  plugins: [],
}