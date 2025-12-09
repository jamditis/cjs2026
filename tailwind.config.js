/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-red': '#CA3553',
        'brand-black': '#000000',
        'brand-white': '#FFFFFF',
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'arial': ['Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
