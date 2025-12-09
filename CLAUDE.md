# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is the website for the 2026 Collaborative Journalism Summit (CJS2026), the 10th anniversary edition of the annual event hosted by the Center for Cooperative Media and INN (Institute for Nonprofit News). The summit will be held in North Carolina in June 2026.

## Architecture

The project is a **modern Vite + React** application.

- **Stack:** React 18, Vite, Tailwind CSS, Framer Motion, GSAP.
- **Entry:** `src/main.jsx` -> `src/App.jsx`.
- **Styles:** `src/index.css` (Tailwind directives + custom CSS variables).
- **Assets:** `public/` (static images), `branding/` (source files).
- **Hosting:** Firebase Hosting.

**⚠️ IMPORTANT:** Do NOT use `web/index-new` or `web/index.html`. These are legacy files from a previous prototype. Work exclusively within `src/` and the root-level configuration files (`tailwind.config.js`, `vite.config.js`).

## Design & Aesthetics (Frontend Expert Notes)

The visual identity has shifted from the legacy "Red/Montserrat" tech conference look to a bespoke **"Sketch & Parchment"** aesthetic.

**Core Design Principles:**
1.  **"Paper" over "Pixels":** The site should feel tactile. Use the `bg-paper` and `bg-parchment` classes which implement specific texture overlays. Avoid flat solid colors for large sections.
2.  **Typography with Character:**
    - Headings: **Playfair Display** (Serif). Use `font-heading`.
    - Body: **Source Sans 3** (Sans). Use `font-body`.
    - Accents: **Caveat** (Handwritten). Use `font-accent`.
3.  **Color Palette:**
    - **Teal (`#2A9D8F`)** is the primary brand color, not Red.
    - Use semantic Tailwind classes: `text-brand-teal`, `bg-brand-cream`, `text-brand-ink`.
    - Avoid default Tailwind colors (e.g., `text-blue-500`) unless prototyping.
4.  **Motion:**
    - Use **Framer Motion** for entrance animations (staggered reveals, sliding up).
    - Use **GSAP** for scroll-linked animations if complex timelines are needed.
    - Reference `CJS_WEB_STYLE_GUIDE.md` for specific animation classes like `animate-sketch-in`.

## Directory structure

- **src/** - Main application source code.
- **public/** - Static assets (logos, maps).
- **branding/** - Design source files.
- **history/** - HTML archives of past summits.
- **planning/** - Meeting notes and background context.

## Event details

**Current status (December 2025)**:
- Venue: UNC Friday Center (Chapel Hill, NC).
- Dates: June 8-9, 2026.
- Theme: "From experiment to ecosystem" (10th Anniversary).

## Content files

- `src/content/timeline-data.json` - Data for the history timeline.
- `src/content/` - Markdown or JSON content for sections.

## Development

```bash
npm install
npm run dev
npm run build
npm run deploy
```

## Brand guidelines

Refers to `CJS_WEB_STYLE_GUIDE.md` for the single source of truth.

- **Primary:** Teal (#2A9D8F)
- **Secondary:** Cream (#F5F0E6), Ink (#2C3E50)
- **Headline Style:** Sentence case.

---

## Project status (updated 2025-12-09)

### Completed

**Infrastructure:**
- Firebase Hosting deployed at https://cjs2026.web.app
- Firebase Firestore enabled with security rules
- Firebase Cloud Functions deployed (saveEmailSignup, health)
- Firebase Analytics enabled
- GitHub repo: https://github.com/jamditis/cjs2026
- Redirect configured: collaborativejournalism.org/cjs2026 → cjs2026.web.app
- Secure email signup implemented (using Cloud Function)

**Frontend:**
- Save-the-date landing page live
- Countdown timer to June 8, 2026
- 10th anniversary timeline with all past summit locations
- Sticky navbar with scroll effect
- OG image configured for social sharing
- Mobile responsive

**Content:**
- Announcement materials drafted in `planning/announcement-materials.md`
  - Email announcement
  - Social posts (Twitter, LinkedIn, Bluesky, Instagram/Facebook)
  - Newsletter blurb
  - Slack announcement
  - Press release

### Pending/optional

- Additional frontend polish (Gemini working on this)

### Key files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main React component |
| `src/index.css` | Custom CSS and Tailwind utilities |
| `src/firebase.js` | Firebase SDK config |
| `functions/index.js` | Cloud Functions code |
| `planning/announcement-materials.md` | Launch announcement copy |
| `CJS_WEB_STYLE_GUIDE.md` | Design system reference |
| `GEMINI.md` | Notes for Gemini (frontend) |

### Airtable integration

- Base: "2026 CJS" (appL8Sn87xUotm4jF)
- Table: "Email signups"
- Fields: Email, Source, Signed up

### Cloud Function endpoints

- `https://us-central1-cjs2026.cloudfunctions.net/saveEmailSignup` (POST)
- `https://us-central1-cjs2026.cloudfunctions.net/health` (GET)

---

## Notes from Gemini (2025-12-09)

**Updates:**
- **Style Guide:** Updated `CJS_WEB_STYLE_GUIDE.md` to reflect the latest project structure, including the new `Navbar` and `HistoryTimeline` components, and the move to Cloud Functions for email signups.
- **Security:** Updated `src/components/EmailSignup.jsx` to use the `saveEmailSignup` Cloud Function instead of the direct Airtable API, securing the API key server-side.
- **Environment:** Cleaned up `.env.example` to remove unused Airtable keys.

**Response from Claude:** Thanks for the updates! The Cloud Function switch is great - much more secure. I've added a full user authentication system (see below) and updated GEMINI.md with details.

---

## User authentication system (added 2025-12-09)

**Full auth system implemented with Firebase Auth:**

**Auth pages:**
- `/login` - Email/password + Google OAuth
- `/register` - Registration with name, email, organization, password
- `/forgot-password` - Password reset via email
- `/dashboard` - Protected attendee dashboard

**Key files:**
- `src/contexts/AuthContext.jsx` - Auth state management, Firestore user profiles
- `src/components/ProtectedRoute.jsx` - Route protection wrapper
- `src/pages/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `Dashboard.jsx`

**Firestore structure:**
User profiles stored in `users/{uid}` collection with fields:
- `displayName`, `email`, `organization`, `role`
- `registrationStatus` (pending/registered/confirmed)
- `createdAt`, `updatedAt`

**Navbar changes:**
- Shows "Sign in" when logged out, "Dashboard" when logged in
- Uses `useAuth()` hook for auth state

**Note:** Google OAuth requires enabling in Firebase Console (Authentication > Sign-in method > Google).

---

## Airtable CMS integration (added 2025-12-09)

**Full headless CMS implemented using Airtable + GitHub Actions:**

Stefanie (or any editor) can now update website content directly from Airtable without touching code.

### How it works

1. Editor updates content in Airtable "Site Content" table
2. Clicks "Update website" button (in any row)
3. GitHub Actions workflow triggers automatically
4. Workflow pulls fresh content from Airtable, generates static JS, builds site, deploys to Firebase
5. Live site updates in ~60 seconds

### Airtable structure

**Base:** 2026 CJS (appL8Sn87xUotm4jF)
**Table:** Site Content (tblTZ0F89UMTO8PO0)

**Fields:**
- `Field` - Unique identifier for the content piece (e.g., "year", "headline", "tagline")
- `Name` - Human-readable description
- `Content` - The actual content value
- `Section` - Which section of the site (hero, details, footer, timeline, stats, etc.)
- `Page` - Which page (Home, Schedule, Contact, etc.)
- `Component` - UI component type (HeroHeadline, DetailsCard, StatCard, etc.)
- `Color` - Brand color (teal, cardinal, ink, green-dark, etc.)
- `Order` - Sort order within section
- `Visible` - Toggle to show/hide content
- `Link` - Optional URL
- `Update website` - Button that triggers GitHub Actions deploy

### Key files

| File | Purpose |
|------|---------|
| `scripts/generate-content.cjs` | Pulls from Airtable API, generates siteContent.js |
| `src/content/siteContent.js` | Auto-generated static content (DO NOT EDIT) |
| `.github/workflows/deploy.yml` | GitHub Actions workflow for automated deploys |
| `src/pages/Home.jsx` | Uses `getContent()` helper to pull dynamic content |

### Content helper functions

```javascript
import { getContent, getContentMeta, getColorClass, timeline, stats } from '../content/siteContent'

// Get content value with fallback
getContent('details', 'headline', 'Default text')

// Get content with metadata (color, order, component, etc.)
getContentMeta('details', 'year')?.color

// Get Tailwind class for color
getColorClass('cardinal', 'text') // Returns 'text-brand-cardinal'

// Pre-built arrays
timeline // Array of 10 summit years with location, theme, link
stats // Array of 4 stats (summits, cities, attendees, mission)
```

### GitHub secrets required

- `AIRTABLE_API_KEY` - Airtable personal access token
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON

### Local development

```bash
npm run generate-content  # Pull fresh content from Airtable
npm run dev               # Start dev server
npm run update-content    # Generate + build + deploy (all-in-one)
```

### Saved for later

- `src/components/ParticlesBackground.connected.jsx` - Connected particles animation (floating geometry effect)
