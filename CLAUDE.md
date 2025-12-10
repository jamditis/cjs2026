# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Current date context:** December 2025. We are building the website for CJS 2026 (June 2026). The most recent past summit was CJS 2025 in Denver.

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

---

## Updates (2025-12-09)

### Passwordless authentication

Changed auth flow from email/password to **passwordless magic links**:
- `/login` - Email input sends magic link, or use Google OAuth
- `/auth/callback` - Handles magic link verification
- `/privacy` - Privacy policy page
- Removed `/register` and `/forgot-password` (not needed with magic links)

**Key changes:**
- `AuthContext.jsx` now uses `sendSignInLinkToEmail` and `signInWithEmailLink`
- Login page shows spam folder warning after email sent
- Profile completion happens in dashboard after sign-in

### Dashboard enhancements

**Tutorial animation:**
- Pulsing teal glow on profile card when profile incomplete
- Two dismiss options: "I'll do this later" (session) / "I know what I'm doing" (permanent)

**Input validation with forced prefixes:**
| Field | Prefix | User enters |
|-------|--------|-------------|
| Website | `https://` | `yoursite.com` |
| Twitter/X | `@` | `username` |
| LinkedIn | `linkedin.com/in/` | `username` |
| Bluesky | `@` | `handle.bsky.social` |

**Badge system (1 per category, custom badges allowed):**
- Experience: collab curious, practitioner, veteran, evangelist
- Role: reporter, editor, leadership, funder, academic, technologist, organizer, personality hire
  - If "personality hire" selected, can pick 2 roles
- CJS attendance: summit picker (2017-2025) → auto-generates badges based on history
- Philosophy: 8 predefined + up to 3 custom
- Misc: 12 predefined + up to 3 custom

**Past summits (for attendance picker):**
- 2017 Philadelphia (inaugural)
- 2018 New Orleans
- 2019 Philadelphia
- 2020 virtual
- 2021 virtual
- 2022 New Orleans
- 2023 Atlanta
- 2024 Austin
- 2025 Denver

Badges stored in Firestore user profile as array of badge IDs + custom badges object.

### shadcn MCP integration

Initialized shadcn MCP server for Claude Code integration:

```bash
npx shadcn@latest mcp init --client claude
```

Creates `.mcp.json` with shadcn server config. Restart Claude Code to activate. Enables direct access to shadcn/ui component tools.

---

## Updates (2025-12-09 evening)

### Stepper UX improvements

- **More breathing room:** Modal widened to `max-w-lg`, padding increased, scrollable on small screens
- **Animation direction reversed:** Forward = slide from right, Back = slide from left (more intuitive)
- **Progress indicators:** Moved to bottom with smaller size for cleaner modal

### Profile photo upload

New step in profile wizard allows photo upload:
- Max 2MB, JPG/PNG/WebP only
- Auto-resizes to 800x800px max to save bandwidth/storage
- Preview with remove button
- Uploads to Firebase Storage: `profile-photos/{uid}/{timestamp}.jpg`

**Firebase Storage rules needed:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-photos/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 2 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### Slur filter (hate speech only)

`src/utils/profanityFilter.js` + `src/utils/profane-words.json`:
- ~170 slurs (racial, ethnic, religious, disability, anti-LGBTQ)
- Does NOT block general profanity (fuck, shit, etc.) - only hate speech
- Fuzzy matching for common substitutions (`@` for `a`, `$` for `s`, etc.)
- Applied to name, organization, role, custom badges in profile wizard
- Stepper blocks advancement if slurs detected (validateStep prop)

### Social links update

- Replaced Twitter/X with Instagram in profile social links
- Field: `instagram` (username without @)
- URL: `https://instagram.com/{username}`

### CJS summit history (corrected)

| Year | Location | Note |
|------|----------|------|
| 2017 | Montclair, NJ | inaugural 🎓 |
| 2018 | Montclair, NJ | 🎓 |
| 2019 | Philadelphia, PA | 🔔 |
| 2020 | virtual | pandemic 🏠 |
| 2021 | virtual | pandemic 💻 |
| 2022 | Chicago, IL | 🌆 |
| 2023 | Washington D.C. | 🏛️ |
| 2024 | Detroit, MI | 🚗 |
| 2025 | Denver, CO | 🏔️ |

### Attendance badges

Auto-generated based on summit history:
- **OG** - attended inaugural 2017
- **COVID badges** - pandemic pioneer (2020), lockdown loyalist (2021), zoom veteran (both)
- **Streak badges** - back-to-back (2 consecutive), three-peat (3), N-year streak (4+)
- **City badges** - for single in-person summit attendance

### Bug fixes

- **getSiteContent 500 error:** Fixed incorrect API key reference in Cloud Function
- **API key exposure:** App.jsx email signup now uses Cloud Function
- **Stepper modal close:** Fixed modal squashing instead of closing
- **Spam folder message:** Centered, teal background, larger text

### Key files changed

| File | Changes |
|------|---------|
| `src/pages/Dashboard.jsx` | Photo upload, slur validation, Instagram, attendance badges |
| `src/components/Stepper.jsx` | Reversed animation, validateStep prop |
| `src/components/Stepper.css` | More padding, small indicator styles |
| `src/utils/profanityFilter.js` | Slur filter (hate speech only) |
| `src/utils/profane-words.json` | ~170 slurs list |
| `src/firebase.js` | Added Firebase Storage export |
| `src/pages/Login.jsx` | Spam folder warning styling |

---

## Pending/backlog

- Additional frontend polish (Gemini working on this)
- Firebase Storage rules need to be deployed (see above for rule config)
