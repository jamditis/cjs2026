---
allowed-tools: Read, Write, Edit, Grep, Glob
argument-hint: <PageName> <route-path> <protected: yes|no>
description: Add a new page to the React app with routing, following existing patterns
---

# Add New Page

Create a new page component and add routing.

**Arguments:** $1 = PageName (PascalCase), $2 = route path, $3 = protected (yes/no)

## File Structure

Create: `src/pages/$1.jsx`

## Page Template

```jsx
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function $1() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-4xl md:text-5xl text-brand-ink mb-8">
              Page Title
            </h1>

            {/* Page content */}
            <div className="card-sketch p-8">
              <p className="font-body text-brand-ink/80">
                Content goes here.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
```

## Add Route to main.jsx

```jsx
// If protected ($3 = yes)
import ProtectedRoute from './components/ProtectedRoute';
import $1 from './pages/$1';

<Route
  path="$2"
  element={
    <ProtectedRoute>
      <$1 />
    </ProtectedRoute>
  }
/>

// If public ($3 = no)
import $1 from './pages/$1';

<Route path="$2" element={<$1 />} />
```

## Add to Navbar (if needed)

In `src/components/Navbar.jsx`, add to `navLinks` array:
```jsx
{ name: 'Link Text', href: '$2' },
```

Or for hash links on homepage:
```jsx
{ name: 'Link Text', href: '/#section-id' },
```

## SEO Meta Tags

Add Helmet for page-specific meta:
```jsx
import { Helmet } from 'react-helmet-async';

<Helmet>
  <title>Page Title | CJS2026</title>
  <meta name="description" content="Page description" />
</Helmet>
```
