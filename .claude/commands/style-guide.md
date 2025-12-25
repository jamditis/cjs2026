---
allowed-tools: Read, Grep
description: Quick reference for CJS2026 design system - colors, typography, animations, components
---

# CJS2026 Style Guide Reference

## Brand Colors

```jsx
// Primary (use these)
text-brand-teal      // #2A9D8F - Primary brand color
text-brand-ink       // #2C3E50 - Primary text
bg-brand-cream       // #F5F0E6 - Primary background
bg-brand-parchment   // #EDE8DC - Secondary sections
text-brand-cardinal  // #C84B31 - 10th anniversary accent

// Opacity variants
text-brand-ink/70    // Secondary text
text-brand-ink/50    // Subtle text
text-brand-ink/30    // Very subtle
```

## Typography

```jsx
font-heading   // Playfair Display (serif) - Headlines
font-body      // Source Sans 3 (sans) - Body text
font-accent    // Caveat (handwritten) - Decorative accents
```

## Card Component

```jsx
<div className="card-sketch p-6">
  {/* Double-border offset shadow effect applied automatically */}
  {/* Hover: lift effect */}
</div>
```

## Button Styles

```jsx
// Primary button
<button className="btn-primary">
  Click Me
</button>

// Manual button styling
<button className="px-6 py-3 bg-brand-teal text-white font-body font-semibold
                   rounded-lg border-2 border-brand-teal-dark
                   shadow-[3px_3px_0_var(--teal-dark)]
                   hover:translate-x-[-2px] hover:translate-y-[-2px]
                   hover:shadow-[5px_5px_0_var(--teal-dark)]
                   transition-all duration-200">
```

## Animation Patterns

```jsx
// Framer Motion entrance
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>

// Scroll-triggered
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>

// Staggered children (increment delay)
transition={{ delay: index * 0.1 }}
```

## Admin Panel Styling

```jsx
// Admin uses different color system
const cardClass = `rounded-lg border ${
  theme === 'ink'
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200'
} p-6`;

// Admin fonts
font-admin-heading  // Outfit
font-admin-body     // Outfit
font-admin-mono     // Space Mono
```

## Decorative Elements

```jsx
// Squiggle underline (SVG)
<span className="squiggle-underline">Text</span>

// Sketch border (double line effect)
<div className="sketch-border">Content</div>

// Mountain divider (NC themed)
<div className="divider-mountains" />
```

## Responsive Breakpoints

```jsx
sm:  // 640px
md:  // 768px
lg:  // 1024px

// Common pattern
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```
