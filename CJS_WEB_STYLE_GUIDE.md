# CJS 2026 website style guide

This document provides a comprehensive reference for the visual design system, components, and CSS classes used on the CJS 2026 website. Use this guide when making frontend updates or modifications.

---

## Project structure

```
cjs2026/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Navbar.jsx       # Sticky navigation
│   │   ├── Footer.jsx       # Site footer
│   │   ├── Layout.jsx       # Main page layout wrapper
│   │   ├── HistoryTimeline.jsx # Timeline of past summits
│   │   ├── EmailSignup.jsx  # Cloud Function integrated form
│   │   └── ...
│   ├── pages/           # Page components
│   │   ├── Home.jsx         # Landing page
│   │   └── ...
│   ├── data/            # Static data files
│   │   └── timeline-data.json # History data
│   ├── App.jsx          # Main application router/structure
│   ├── main.jsx         # React entry point
│   └── index.css        # Custom CSS and Tailwind utilities
├── public/
│   ├── cjs-logo-iso.png # CJS logo (teal gear icon)
│   ├── ccm-logo.png     # Center for Cooperative Media logo
│   ├── inn-logo.png     # Institute for Nonprofit News logo
│   ├── nc-map.png       # NC topographical illustration (hero background)
│   └── favicon files
├── index.html           # HTML entry with font imports
├── tailwind.config.js   # Tailwind configuration with brand colors
└── package.json         # Dependencies
```

---

## Color palette

### CSS custom properties (defined in index.css)

```css
:root {
  --teal: #2A9D8F;
  --teal-dark: #1E7268;
  --teal-light: #5FBFB3;
  --cream: #F5F0E6;
  --parchment: #EDE8DC;
  --ink: #2C3E50;
  --cardinal: #C84B31;
  --sketch: #8B9A8B;
}
```

### Tailwind color classes

| Color | Tailwind class | Hex | Usage |
|-------|---------------|-----|-------|
| Teal (primary) | `brand-teal` | #2A9D8F | Primary buttons, links, accents |
| Teal dark | `brand-teal-dark` | #1E7268 | Button shadows, hover states |
| Teal light | `brand-teal-light` | #5FBFB3 | Light accents, backgrounds |
| Dark green | `brand-green-dark` | #005442 | Stats section text |
| Cream | `brand-cream` | #F5F0E6 | Primary background |
| Parchment | `brand-parchment` | #EDE8DC | Secondary background sections |
| Ink | `brand-ink` | #2C3E50 | Primary text color |
| Cardinal | `brand-cardinal` | #C84B31 | Accent (10th anniversary badge) |
| Sketch | `brand-sketch` | #8B9A8B | Subtle borders, noise textures |

### Usage examples

```jsx
// Text colors
<p className="text-brand-ink">Primary text</p>
<p className="text-brand-teal">Accent text</p>
<p className="text-brand-ink/70">Muted text (70% opacity)</p>
<p className="text-brand-ink/50">Subtle text (50% opacity)</p>

// Background colors
<section className="bg-brand-cream">Cream background</section>
<section className="bg-brand-parchment">Parchment background</section>
<section className="bg-brand-ink">Dark background</section>
```

---

## Typography

### Font families

Fonts are loaded via Google Fonts in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Source+Sans+3:wght@300;400;500;600&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

| Font | Tailwind class | CSS class | Usage |
|------|---------------|-----------|-------|
| Playfair Display | `font-heading` | `.font-heading` | Headlines, section titles |
| Source Sans 3 | `font-body` | `.font-body` | Body text, paragraphs, UI |
| Caveat | `font-accent` | `.font-accent` | Handwritten accents, decorative text |

### Typography utility classes

```css
/* Editorial headline - large serif titles */
.editorial-headline {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

/* Italic accent - like "Prepare to partner" tagline */
.italic-accent {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-weight: 400;
}

/* Handwritten style text */
.handwritten {
  font-family: 'Caveat', cursive;
  font-size: 1.5em;
  line-height: 1.2;
}
```

### Usage examples

```jsx
// Main headline
<h1 className="editorial-headline text-4xl md:text-6xl lg:text-7xl text-brand-ink">
  Collaborative Journalism Summit
</h1>

// Tagline
<p className="italic-accent text-2xl md:text-3xl text-brand-teal">
  Prepare to partner.
</p>

// Handwritten year
<span className="font-accent text-6xl md:text-8xl text-brand-teal font-bold">
  2026
</span>

// Body text
<p className="font-body text-lg text-brand-ink/70">
  Description text here...
</p>
```

---

## Background textures

### Paper texture (primary background)

```css
.bg-paper {
  background-color: var(--cream);
  background-image:
    url("data:image/svg+xml,..."), /* SVG noise texture */
    linear-gradient(90deg, transparent 0%, rgba(139, 154, 139, 0.02) 50%, transparent 100%);
}
```

Usage: `<div className="bg-paper">`

### Parchment texture (secondary sections)

```css
.bg-parchment {
  background-color: var(--parchment);
  background-image: url("data:image/svg+xml,..."); /* SVG noise texture */
}
```

Usage: `<section className="bg-parchment">`

---

## Buttons

### Primary button

```css
.btn-primary {
  @apply px-8 py-4 rounded-lg font-body font-semibold text-lg transition-all duration-200;
  background-color: var(--teal);
  color: white;
  border: 2px solid var(--teal-dark);
  box-shadow: 3px 3px 0 var(--teal-dark);
}

.btn-primary:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 var(--teal-dark);
}

.btn-primary:active {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 var(--teal-dark);
}
```

Usage:
```jsx
<button className="btn-primary">Notify me</button>
```

### Secondary button

```css
.btn-secondary {
  @apply px-6 py-3 rounded-lg font-body font-medium transition-all duration-200;
  background-color: transparent;
  color: var(--teal);
  border: 2px solid var(--teal);
}

.btn-secondary:hover {
  background-color: var(--teal);
  color: white;
}
```

Usage:
```jsx
<button className="btn-secondary">Learn more</button>
```

---

## Cards

### Sketch-style card

```css
.card-sketch {
  background: white;
  border: 2px solid var(--ink);
  border-radius: 12px;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-sketch::before {
  content: '';
  position: absolute;
  inset: 4px 4px -4px -4px;
  background: var(--teal-light);
  border-radius: inherit;
  z-index: -1;
  opacity: 0.3;
  transition: transform 0.3s ease;
}

.card-sketch:hover {
  transform: translate(-2px, -2px);
}

.card-sketch:hover::before {
  transform: translate(4px, 4px);
}
```

Usage:
```jsx
<div className="card-sketch p-6">
  Card content here
</div>
```

### Countdown card

```css
.countdown-card {
  background: white;
  border: 2px solid var(--teal);
  border-radius: 8px;
  position: relative;
  box-shadow:
    4px 4px 0 var(--teal-light),
    inset 0 0 0 1px rgba(42, 157, 143, 0.1);
}
```

Usage:
```jsx
<div className="countdown-card p-3 md:p-4 min-w-[56px] md:min-w-[72px]">
  <span className="countdown-number text-2xl md:text-4xl font-bold text-brand-ink">
    08
  </span>
</div>
```

---

## Decorative elements

### Squiggly underline

```css
.squiggle-underline {
  position: relative;
  display: inline-block;
}

.squiggle-underline::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  height: 6px;
  background-image: url("data:image/svg+xml,..."); /* SVG wave pattern */
  background-size: 50px 6px;
  background-repeat: repeat-x;
}
```

### Sketch border

```css
.sketch-border {
  position: relative;
}

.sketch-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  border: 2px solid var(--ink);
  border-radius: inherit;
  opacity: 0.15;
  transform: rotate(-0.5deg);
}

.sketch-border::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 1px solid var(--ink);
  border-radius: inherit;
  opacity: 0.08;
  transform: rotate(0.5deg);
}
```

### Sketch circle

```css
.sketch-circle {
  position: relative;
}

.sketch-circle::before {
  content: '';
  position: absolute;
  inset: -8px;
  border: 3px solid var(--teal);
  border-radius: 50%;
  opacity: 0.6;
  transform: rotate(-3deg);
}
```

### Hand-drawn arrow

```css
.hand-arrow::after {
  content: '→';
  font-family: 'Caveat', cursive;
  font-size: 1.5em;
  color: var(--teal);
  margin-left: 0.5em;
}
```

### Logo glow

```css
.logo-glow {
  filter: drop-shadow(0 0 8px rgba(42, 157, 143, 0.3));
  transition: filter 0.3s ease;
}

.logo-glow:hover {
  filter: drop-shadow(0 0 16px rgba(42, 157, 143, 0.5));
}
```

---

## Dividers

### Sketch divider (horizontal line)

```css
.divider-sketch {
  height: 2px;
  background-image: url("data:image/svg+xml,..."); /* SVG wave line */
  background-size: 100px 2px;
  background-repeat: repeat-x;
}
```

### Mountain divider

```css
.divider-mountains {
  height: 60px;
  background-image: url("data:image/svg+xml,..."); /* SVG mountain silhouette */
  background-size: 100% 100%;
}
```

Usage:
```jsx
<div className="divider-sketch" />
<div className="divider-mountains" />
```

---

## Animations

### CSS animations (defined in index.css)

```css
/* Fade in with upward motion */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Sketch-style entrance */
@keyframes sketchIn {
  from { opacity: 0; transform: translateY(20px) rotate(-1deg); }
  to { opacity: 1; transform: translateY(0) rotate(0deg); }
}

/* Hand draw effect for paths */
@keyframes handDraw {
  0% { stroke-dashoffset: 1000; opacity: 0; }
  10% { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}

/* Floating animation */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
}

/* Soft pulse */
@keyframes pulse-soft {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.02); }
}
```

### Animation utility classes

```css
.animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
.animate-sketch-in { animation: sketchIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
```

### Staggered children

```css
.stagger-children > * {
  animation: sketchIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
}

.stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
.stagger-children > *:nth-child(5) { animation-delay: 0.5s; }
```

---

## Framer Motion patterns

The site uses Framer Motion for scroll-triggered animations. Common patterns:

### Fade in on scroll

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

### Staggered entrance

```jsx
<motion.div
  initial={{ opacity: 0, y: 20, rotate: -2 }}
  animate={{ opacity: 1, y: 0, rotate: 0 }}
  transition={{ delay: 0.3, duration: 0.5 }}
>
  Content
</motion.div>
```

### Hover scale

```jsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  Button
</motion.button>
```

---

## React components

### Navbar
Sticky navigation bar with scroll-triggered background and logo resizing. Includes "Register", "History", and "Sponsors" links.

```jsx
<Navbar />
```

### SplashScreen

Initial loading screen with logo and tagline.

```jsx
<SplashScreen onComplete={() => {}}>
  {children}
</SplashScreen>
```

### Countdown

Displays countdown to summit date.

```jsx
<Countdown targetDate="2026-06-08T09:00:00" />
```

### EmailSignup

Email capture form. Uses **Firebase Cloud Functions** to securely save to Airtable.
- Dark mode prop (`darkBg`) toggles input field styling.

```jsx
<EmailSignup darkBg={false} />
```

### InfoCard

Card with icon, title, and content.

```jsx
<InfoCard icon={Calendar} title="When" delay={0}>
  <p><strong>Monday, June 8</strong></p>
  <p className="text-sm">Full day of sessions + dinner</p>
</InfoCard>
```

### CountUp

Animated number counter (triggers on scroll into view).

```jsx
<CountUp end={1500} duration={2} suffix="+" />
```

### HistoryTimeline
Visual timeline of past summits using data from `src/data/timeline-data.json`.
Features scroll-linked connecting lines and alternating layout.

```jsx
<HistoryTimeline />
```

---

## Page sections

### Hero section
- Background: `bg-paper` with NC map illustration overlay
- Mountain SVG silhouettes at bottom
- Contains: Header, year badge, headline, tagline, countdown, email signup

### Details section
- Background: `bg-parchment`
- Contains: InfoCards (When, Where, Who), "What to expect" card

### 10 Years section (History)
- Background: `bg-brand-cream` with grid pattern overlay
- Text color: `text-brand-green-dark`
- Contains: Headline, description, animated stats (CountUp), Timeline component

### Partners section
- Background: `bg-paper`
- Contains: CCM logo, INN logo

### Footer
- Background: `bg-parchment`
- Contains: Email signup, contact links, copyright

---

## Responsive breakpoints

Using Tailwind's default breakpoints:

| Breakpoint | Min width | Example usage |
|------------|-----------|---------------|
| `sm` | 640px | `sm:flex-row` |
| `md` | 768px | `md:text-6xl` |
| `lg` | 1024px | `lg:text-7xl` |

Common patterns:
```jsx
// Stack on mobile, row on tablet+
<div className="flex flex-col md:flex-row">

// Smaller text on mobile
<h1 className="text-4xl md:text-6xl lg:text-7xl">

// Smaller padding on mobile
<div className="p-3 md:p-4">
```

---

## File references

### Images in /public

| File | Description | Usage |
|------|-------------|-------|
| `cjs-logo-iso.png` | CJS gear logo (teal) | Header, splash screen |
| `ccm-logo.png` | Center for Cooperative Media | Partners section |
| `inn-logo.png` | Institute for Nonprofit News | Partners section |
| `nc-map.png` | NC topographical illustration | Hero background |

### Key files to edit

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main React component and page structure |
| `src/index.css` | Custom CSS classes and animations |
| `src/components/Navbar.jsx` | Navigation and branding |
| `tailwind.config.js` | Brand colors and font families |
| `index.html` | Google Fonts imports, meta tags |

---

## External dependencies

```json
{
  "framer-motion": "^11.x",  // Animations
  "lucide-react": "^0.x",    // Icons
  "react": "^18.x",
  "tailwindcss": "^3.x"
}
```

### Icons used (from lucide-react)

- `Calendar` - When section
- `MapPin` - Where section
- `Users` - Who section
- `Mail` - Contact email
- `ExternalLink` - External links
- `ChevronDown` - Scroll indicator
- `Feather` - 10th anniversary badge
- `History` - Timeline/History link
- `Menu`, `X` - Mobile navigation

---

## Airtable integration

Email signups are saved to Airtable via **Firebase Cloud Functions**.

- **Function:** `saveEmailSignup` (deployed)
- **Base ID:** `appL8Sn87xUotm4jF`
- **Table:** `Email signups`
- **Fields:** Email, Source, Signed up (timestamp)

**Security Note:** Do not expose the Airtable API key in client-side code. Use the Cloud Function endpoint.

---

## Quick reference: common class combinations

```jsx
// Section container
<section className="py-20 px-6 bg-parchment">
  <div className="max-w-6xl mx-auto">

// Headline
<h2 className="editorial-headline text-3xl md:text-5xl text-brand-ink mb-4">

// Body text
<p className="font-body text-brand-ink/60 max-w-2xl mx-auto text-lg">

// Card
<div className="card-sketch p-6">

// Primary button
<button className="btn-primary">

// Accent text
<span className="font-accent text-xl text-brand-teal">

// Muted label
<p className="text-brand-ink/40 text-sm font-body">
```