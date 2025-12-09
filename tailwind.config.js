/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New palette from og-image
        'brand-teal': '#2A9D8F',
        'brand-teal-dark': '#1E7268',
        'brand-teal-light': '#5FBFB3',
        'brand-green-dark': '#005442',
        'brand-cream': '#F5F0E6',
        'brand-parchment': '#EDE8DC',
        'brand-ink': '#2C3E50',
        'brand-cardinal': '#C84B31',
        // Keep red as accent
        'brand-red': '#CA3553',
        'brand-black': '#000000',
        'brand-white': '#FFFFFF',
      },
      fontFamily: {
        // Editorial typography
        'heading': ['Playfair Display', 'Georgia', 'serif'],
        'body': ['Source Sans 3', 'sans-serif'],
        'accent': ['Caveat', 'cursive'],
        // Fallbacks
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'paper-texture': "url('/paper-texture.png')",
        'sketch-lines': "url('/sketch-lines.svg')",
      },
    },
  },
  plugins: [],
}
