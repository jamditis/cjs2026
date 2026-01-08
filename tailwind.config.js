/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Public site palette (from og-image)
        'brand-teal': '#2A9D8F',
        'brand-teal-dark': '#1E7268',
        'brand-teal-light': '#5FBFB3',
        'brand-green-dark': '#005442',
        'brand-cream': '#F5F0E6',
        'brand-parchment': '#EDE8DC',
        'brand-ink': '#2C3E50',
        'brand-ink-muted': '#5C6B7A', // Accessible alternative to ink/60-70 opacity
        'brand-cardinal': '#C84B31',
        'brand-red': '#CA3553',
        'brand-black': '#000000',
        'brand-white': '#FFFFFF',
        // Admin Command Center palette (PRD v2.1)
        'admin-ink': '#0F172A',
        'admin-parchment': '#F8FAF1',
        'admin-teal': '#0D9488',
        'admin-lead': '#64748B',
        'admin-amber': '#F59E0B',
        'admin-rose': '#F43F5E',
        'admin-emerald': '#10B981',
      },
      fontFamily: {
        // Public site typography
        'heading': ['Playfair Display', 'Georgia', 'serif'],
        'body': ['Source Sans 3', 'sans-serif'],
        'accent': ['Caveat', 'cursive'],
        'montserrat': ['Montserrat', 'sans-serif'],
        // Admin Command Center typography (sans-serif only)
        'admin-heading': ['Outfit', 'sans-serif'],
        'admin-body': ['Outfit', 'sans-serif'],
        'admin-mono': ['Space Mono', 'monospace'],
      },
      backgroundImage: {
        'paper-texture': "url('/paper-texture.png')",
        'sketch-lines': "url('/sketch-lines.svg')",
      },
    },
  },
  plugins: [],
}
