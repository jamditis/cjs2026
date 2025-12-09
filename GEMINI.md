# GEMINI.md - Context & Instructions for CJS2026

## Project Overview
This project (`cjs2026`) is the official website for the **2026 Collaborative Journalism Summit**, the 10th anniversary edition of the event hosted by the Center for Cooperative Media and INN. It is a single-page React application that serves as the main information hub for the summit, taking place in Chapel Hill, NC in June 2026.

## Tech Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (configured with specific brand colors/fonts)
- **Hosting:** Firebase Hosting
- **Animations:** Framer Motion, GSAP
- **Icons:** Lucide React

## Development Workflow

### Key Commands
- **Install Dependencies:** `npm install`
- **Start Dev Server:** `npm run dev` (Runs Vite)
- **Build for Production:** `npm run build` (Outputs to `dist/`)
- **Preview Build:** `npm run preview`
- **Deploy:** `npm run deploy` (Builds and deploys to Firebase)

## Architecture & Directory Structure
The application is a standard Vite+React setup.

- **`src/`**: Source code
  - **`App.jsx`**: Main application component containing the landing page sections (Hero, Details, History, Partners).
  - **`components/`**: Reusable UI components (SplashScreen, CountUp, etc.).
  - **`assets/`**: Imported assets.
  - **`index.css`**: Global styles, Tailwind directives, and custom animations.
- **`public/`**: Static assets served directly (logos, map illustrations, favicons).
- **`branding/`**: Source files for logos, style guides, and design assets.
- **`planning/`**: Meeting notes and planning documents for the event.
- **`history/`**: HTML archives of past summit schedules.

## Design & Style Guidelines
Refer to `CJS_WEB_STYLE_GUIDE.md` for the definitive source of truth.

- **Typography:**
  - Headings: **Playfair Display** (`font-heading`, `.editorial-headline`)
  - Body: **Source Sans 3** (`font-body`)
  - Accents: **Caveat** (`font-accent`, `.handwritten`)
- **Colors:**
  - Primary: Teal (`#2A9D8F`)
  - Backgrounds: Cream (`#F5F0E6`), Parchment (`#EDE8DC`)
  - Text: Ink (`#2C3E50`)
  - Accent: Cardinal (`#C84B31`)
- **Conventions:**
  - **Headlines:** Use **sentence case** (only capitalize the first letter and proper nouns).
  - **Styling:** Use Tailwind utility classes primarily. Custom CSS for complex animations or specific textures (paper/parchment) is in `index.css`.

## Content Management
- **Timeline Data:** `web/content/timeline-data.json` contains the history of past summits used in the timeline component.
- **Email Signups:** Currently integrated directly in `App.jsx` connecting to Airtable (Base: `appL8Sn87xUotm4jF`).

## Important Files
- **`CJS_WEB_STYLE_GUIDE.md`**: Essential for frontend work.
- **`CLAUDE.md`**: Contains legacy context and additional project details.
- **`tailwind.config.js`**: Custom theme configuration.
- **`vite.config.js`**: Vite configuration.

## User Context (Joe Amditis)
- **Role:** Associate Director of Operations, Center for Cooperative Media.
- **Preferences:** Direct, structured communication. No bulleted lists unless requested.
- **Values:** Anti-oppression, collaboration, kindness.

## Role: Frontend Design Expert
- **Goal:** Ensure the frontend is "incredible" and avoids generic "AI slop" aesthetics.
- **Directives:**
  - Enforce the "Sketch & Parchment" aesthetic.
  - Review Claude's architectural decisions for visual impact.
  - Prioritize unique typography and custom textures over default styles.
  - Refer to `CJS_WEB_STYLE_GUIDE.md` and `@design/frontend_aesthetics.txt` constantly.

---

## Notes from Claude (Backend/Infrastructure)

### Firebase Setup Complete (2025-12-09)

**Services deployed:**
- **Hosting:** https://cjs2026.web.app (live)
- **Firestore:** Database enabled with security rules
- **Cloud Functions:** Two functions deployed:
  - `saveEmailSignup`: https://us-central1-cjs2026.cloudfunctions.net/saveEmailSignup
  - `health`: https://us-central1-cjs2026.cloudfunctions.net/health
- **Analytics:** Enabled

**Email signup flow:**
Currently the frontend (`App.jsx`) sends emails directly to Airtable with the API key exposed client-side. I've created a secure Cloud Function (`saveEmailSignup`) that:
1. Saves to Firestore (backup)
2. Saves to Airtable (primary)
3. Keeps the API key server-side

**TODO for frontend:** When ready, update `EmailSignup` component to call the Cloud Function instead of Airtable directly. Change:
```javascript
// FROM (current - insecure):
const response = await fetch(`https://api.airtable.com/v0/...`)

// TO (secure):
const response = await fetch('https://us-central1-cjs2026.cloudfunctions.net/saveEmailSignup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, source: 'CJS 2026 Website' })
})
```

**Files I created:**
- `src/firebase.js` - Firebase SDK config
- `functions/index.js` - Cloud Functions code
- `functions/package.json` - Functions dependencies
- `firestore.rules` - Security rules (write-only for signups)
- `firestore.indexes.json` - Index config

**I noticed Gemini's frontend changes:**
- Added `Navbar` component with scroll effect
- Added `HistoryTimeline` component with summit history data
- Added new icons and imports
- Great work on the timeline! The sketch aesthetic looks good.

**Questions/suggestions:**
1. Should the splash screen duration be shorter? Currently 2 seconds.
2. The NC map background opacity is at 0.08 - want it more/less visible?
3. Consider adding a loading state to the email form while it submits.

Let me know if you need anything else from the backend side!

---

### Update (2025-12-09 afternoon)

**Site is ready for launch announcement.**

Joe set up the redirect from collaborativejournalism.org/cjs2026 to cjs2026.web.app. I deployed your frontend changes (navbar, timeline) along with the OG image for social sharing.

**Announcement materials drafted:** See `planning/announcement-materials.md` for:
- Email announcement copy
- Social posts (Twitter thread, LinkedIn, Bluesky, Instagram/Facebook)
- Newsletter blurb
- Slack announcement
- Press release

**When you're ready to secure the API key:** The Cloud Function is deployed and working. To switch from exposed Airtable key to secure endpoint, update the `EmailSignup` component's fetch URL from the Airtable API to:
```
https://us-central1-cjs2026.cloudfunctions.net/saveEmailSignup
```

This saves to both Firestore (backup) and Airtable (primary), keeping the API key server-side.

**Your frontend changes look great** - the navbar scroll effect and timeline are solid additions. Let me know if you need any backend support!

---

### Update (2025-12-09 evening) - User authentication system

**Major addition: Full auth system with attendee dashboard.**

I built out the user authentication infrastructure per Joe's request. Here's what's new:

**New pages created:**
- `/login` - Email/password + Google OAuth login
- `/register` - Registration with name, email, organization, password
- `/forgot-password` - Password reset flow via email
- `/dashboard` - Protected attendee dashboard (requires authentication)

**New components:**
- `src/contexts/AuthContext.jsx` - Full auth context with:
  - Email/password signup and login
  - Google OAuth authentication
  - Password reset functionality
  - User profile management (stored in Firestore `users` collection)
  - Loading states and auth persistence
- `src/components/ProtectedRoute.jsx` - Wrapper that redirects unauthenticated users to /login

**Navbar updated:**
- Now shows "Sign in" button when logged out
- Shows "Dashboard" button when logged in
- Uses `useAuth()` hook to check auth state

**Routes configured in main.jsx:**
- All routes wrapped with `<AuthProvider>`
- Dashboard route wrapped with `<ProtectedRoute>`

**Dashboard features:**
- Registration status card (pending/registered/confirmed)
- Event details (dates, venue, times)
- Quick links to schedule and code of conduct
- Editable user profile (name, organization, role)
- Sign out button

**Styling notes:**
I followed the "Sketch & Parchment" aesthetic for all new pages:
- Used `bg-paper` for page backgrounds
- Used `font-heading` for headlines, `font-body` for text
- Used `brand-teal` for primary actions, `brand-ink` for text
- Used `card-sketch` class for card styling
- Added Framer Motion entrance animations

**Files created/modified:**
- `src/contexts/AuthContext.jsx` (new)
- `src/components/ProtectedRoute.jsx` (new)
- `src/pages/Login.jsx` (new)
- `src/pages/Register.jsx` (new)
- `src/pages/ForgotPassword.jsx` (new)
- `src/pages/Dashboard.jsx` (new)
- `src/pages/index.js` (updated exports)
- `src/components/index.js` (updated exports)
- `src/components/Navbar.jsx` (added auth state)
- `src/main.jsx` (added AuthProvider and routes)

**Firebase requirements:**
For Google OAuth to work in production, you'll need to enable Google sign-in in the Firebase Console (Authentication > Sign-in method > Google).

**Frontend polish opportunities:**
1. The dashboard could use some visual polish to match the landing page aesthetic better
2. Consider adding profile photo upload functionality
3. The registration status colors use dynamic Tailwind classes (`bg-${status.color}`) which may need safelist in tailwind.config.js
4. Mobile responsive but could use testing on actual devices

Let me know if you want to adjust the visual design of any of these pages!
