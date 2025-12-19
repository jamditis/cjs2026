# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Current date context:** December 2025. We are building the website for CJS2026 (June 2026). The most recent past summit was CJS 2025 in Denver.

## Style rules

- **CJS2026 is one word** - Always write "CJS2026" without a space, not "CJS 2026". This applies to all copy, code, comments, and documentation.

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

---

## 🚨 CRITICAL: Airtable CMS sync protocol

**This is a mandatory workflow rule. Failure to follow will cause the site to break when editors use Airtable.**

### The problem

The site uses Airtable as a headless CMS. When the deploy workflow runs, it pulls content from Airtable and overwrites `src/content/siteContent.js`. If code changes reference content that doesn't match Airtable, or if Airtable has outdated values, the site will show incorrect content or break.

### Mandatory protocol for ANY content-related change

Before completing any task that touches user-visible text or content:

1. **Identify CMS-controlled content:** Check if the text uses `getContent()` in the code
2. **If CMS-controlled:** The Airtable "Site Content" table MUST be updated to match
3. **If hardcoded:** Document it clearly so editors know it can't be changed in Airtable
4. **Log pending updates:** Add any required Airtable changes to the "Pending Airtable updates" section below
5. **CHECK IN WITH USER:** Before making any change that would impact the Airtable CMS workflow, alert the user and get confirmation

### What IS controlled by Airtable CMS

- Home.jsx hero text (headline, tagline, dates, registration_note)
- Timeline data (years, locations, themes)
- Stats (summits count, cities, attendees, mission)
- Info cards content and colors
- Footer content
- **Sponsors section** (Organizations with "Sponsor" checkbox checked)
- Schedule sessions (Schedule table)
- Any field accessed via `getContent()`, `getContentMeta()`, `timeline`, `stats`, or `sponsors`

### What is NOT controlled by Airtable CMS

- React components (EmailSignup, Navbar, Dashboard, etc.)
- Component logic and functionality
- Auth system and user profiles
- Styling and layout (Tailwind classes)
- App.jsx (legacy landing page, mostly unused now)

### Pending Airtable updates

**These changes MUST be made in Airtable to keep the CMS in sync:**

| Field | Section | Current value | Required value | Status |
|-------|---------|---------------|----------------|--------|
| `registration_note` | details | "Registration opens soon!" | "Tickets now available" | ✅ DONE 2025-12-15 |
| `signup_headline` | footer | "Stay connected" | "Join us in Chapel Hill" | ✅ DONE 2025-12-15 |
| `signup_description` | footer | "Get updates on programming, registration, and more." | "Secure your spot at the 10th anniversary summit." | ✅ DONE 2025-12-15 |

*When you complete an Airtable update, change status to ✅ DONE and add the date.*

### Schedule table (for Personal Schedule Builder feature)

**Table:** Schedule (in same base: appL8Sn87xUotm4jF)

**Current fields:** Session title, Type, Last modified (29 records exist)

**Required fields to add:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `session_id` | Formula/Text | Unique ID (e.g., "mon-session-1") | Yes |
| `description` | Long text | Full session description | No |
| `day` | Single select | "Monday" / "Tuesday" | Yes |
| `start_time` | Single line text | "9:00 AM" format | Yes |
| `end_time` | Single line text | "10:00 AM" format | No |
| `track` | Single select | Track name for parallel sessions | No |
| `room` | Single line text | Location/room | No |
| `speakers` | Long text | Speaker names | No |
| `speaker_orgs` | Long text | Speaker organizations | No |
| `is_bookmarkable` | Checkbox | Can users save this? (false for breaks) | Yes |
| `order` | Number | Display order within day | Yes |
| `visible` | Checkbox | Show on public schedule? | Yes |
| `color` | Single select | teal, cardinal, green-dark | No |

**Note:** The generate-schedule.cjs script will work with whatever fields exist, using defaults for missing fields.

### Organizations table (for Sponsors display)

**Table:** Organizations (in same base: appL8Sn87xUotm4jF)

**Purpose:** Organizations with the "Sponsor" checkbox checked will display as sponsors on both the homepage ("Supported by" section) and the Sponsors page ("Thank you to our sponsors" section).

**Current fields:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `Name` | Single line text | Organization name | Yes |
| `Logo` | Attachment | Organization logo image | Yes (for sponsors) |
| `Website` | URL | Organization website | No |
| `Sponsor` | Checkbox | If checked, displays as sponsor on homepage | Yes |
| `Sponsor tier` | Single select | presenting, lead, supporting, partner, media, community | No |
| `Sponsor order` | Number | Display order within tier | No |
| `Description` | Long text | Organization description | No |
| `Type` | Single select | Organization type | No |
| `Visible` | Checkbox | Show organization? | No (defaults to true) |

**How it works:**
1. Add organization to the "Organizations" table in Airtable
2. Upload logo as an attachment
3. Check the "Sponsor" checkbox
4. Set "Sponsor tier" (e.g., "Presenting sponsor", "Lead sponsor", "Supporting sponsor")
5. Optionally set "Sponsor order" for sorting within tier
6. Deploy triggers `npm run generate-organizations` which updates `src/content/organizationsData.js`
7. Sponsors display on both Homepage and Sponsors page, grouped by tier with tier labels

**NPM scripts:**
```bash
npm run generate-organizations  # Pull sponsors from Airtable
npm run generate-all            # Generate content, schedule, AND organizations
```

---

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

**Auto-generated from Airtable (DO NOT EDIT):**
- `src/content/siteContent.js` - Homepage content, stats, timeline
- `src/content/scheduleData.js` - Schedule sessions
- `src/content/organizationsData.js` - Sponsors data

**Static:**
- `src/content/timeline-data.json` - Legacy timeline data (now in Airtable)

## Development

```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run deploy                 # Build and deploy to Firebase

# Content generation (pulls from Airtable)
npm run generate-content       # Site content
npm run generate-schedule      # Schedule sessions
npm run generate-organizations # Sponsors
npm run generate-all           # All three
```

## Brand guidelines

Refers to `CJS_WEB_STYLE_GUIDE.md` for the single source of truth.

- **Primary:** Teal (#2A9D8F)
- **Secondary:** Cream (#F5F0E6), Ink (#2C3E50)
- **Headline Style:** Sentence case.

---

## Project status (updated 2025-12-18)

### Completed

**Infrastructure:**
- Firebase Hosting deployed at https://cjs2026.web.app and https://summit.collaborativejournalism.org
- Firebase Firestore enabled with comprehensive security rules
- Firebase Cloud Functions deployed (saveEmailSignup, health, syncProfileToAirtable, exportAttendees, getSystemErrors, etc.)
- Firebase Analytics enabled
- Firebase Storage configured for profile photos
- GitHub repo: https://github.com/jamditis/cjs2026
- GitHub Actions workflow for automated deploys from Airtable
- Secure email signup implemented (using Cloud Function)

**Frontend:**
- Save-the-date landing page live
- Countdown timer to June 8, 2026
- 10th anniversary timeline with all past summit locations
- Sticky navbar with scroll effect (consistent links on all pages)
- OG image configured for social sharing
- Mobile responsive
- Dynamic sponsor display on Homepage and Sponsors page
- User authentication with magic links + Google OAuth (cross-browser compatible)
- Attendee dashboard with profile wizard
- Personal schedule builder with sharing options
- User-facing ticket reset

**Admin panel:**
- Full admin command center at `/admin`
- Attendee management with search, filter, sort
- Edit/delete user profiles
- Admin badge indicators
- System error tracking
- Activity logging
- Announcement banner management
- CSV export and Airtable sync

**Content:**
- Announcement materials drafted in `planning/announcement-materials.md`
  - Email announcement
  - Social posts (Twitter, LinkedIn, Bluesky, Instagram/Facebook)
  - Newsletter blurb
  - Slack announcement
  - Press release

### Pending/optional

- Additional frontend polish (Gemini working on this)
- Firebase Storage rules deployment (config ready, needs deploy)

### Key files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main React component |
| `src/index.css` | Custom CSS and Tailwind utilities |
| `src/firebase.js` | Firebase SDK config |
| `functions/index.js` | Cloud Functions code |
| `scripts/generate-content.cjs` | Pull site content from Airtable |
| `scripts/generate-schedule.cjs` | Pull schedule from Airtable |
| `scripts/generate-organizations.cjs` | Pull sponsors from Airtable |
| `src/content/siteContent.js` | Auto-generated site content (DO NOT EDIT) |
| `src/content/scheduleData.js` | Auto-generated schedule data (DO NOT EDIT) |
| `src/content/organizationsData.js` | Auto-generated sponsor data (DO NOT EDIT) |
| `src/pages/Home.jsx` | Homepage with dynamic content |
| `src/pages/Sponsors.jsx` | Sponsors page with dynamic sponsors |
| `src/pages/Dashboard.jsx` | User dashboard |
| `src/components/Navbar.jsx` | Navigation (consistent across all pages) |
| `CJS_WEB_STYLE_GUIDE.md` | Design system reference |
| `GEMINI.md` | Notes for Gemini (frontend) |

### Airtable integration

**Base:** 2026 CJS (appL8Sn87xUotm4jF)

**Tables:**
| Table | Purpose | Script |
|-------|---------|--------|
| Site Content | Homepage text, stats, timeline | `generate-content.cjs` |
| Schedule | Session data for schedule page | `generate-schedule.cjs` |
| Organizations | Sponsors (checkbox-based) | `generate-organizations.cjs` |
| Email signups | Newsletter signups | Cloud Function |
| Attendees | User profiles (sync from Firestore) | Cloud Function |

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

## Updates (2025-12-10)

### Custom domain setup (in progress)

Setting up `summit.collaborativejournalism.org` as custom domain to avoid DNS resolution issues with `.web.app` domain.

**Status:**
- Custom domain added to Firebase Hosting console
- Waiting on Marty (Cloudflare admin) to add CNAME record:
  - Name: `summit`
  - Target: `cjs2026.web.app`
  - Proxy status: DNS only (grey cloud)
- Once DNS propagates, verify domain in Firebase and wait for SSL

### Airtable CMS color fix

Fixed hardcoded colors in Home.jsx so CMS color changes are properly reflected:

**Changes:**
- `InfoCard` component now accepts `color` prop and uses `getColorClass()` dynamically
- Updated InfoCard usages to pass color from CMS metadata
- "What to expect" section now uses dynamic colors from `expect` section in CMS
- Regenerated content from Airtable to pull latest color changes

**Files changed:**
- `src/pages/Home.jsx` - Dynamic colors for InfoCard and "What to expect" section

### Attendee profile sync to Airtable

Created Cloud Functions for syncing user profiles to Airtable for networking at the summit:

**New Cloud Functions (in `functions/index.js`):**
- `syncProfileToAirtable` - Syncs single user profile (upsert pattern)
- `exportAttendees` - Returns all profiles as JSON (admin only)
- `syncAllProfilesToAirtable` - Batch sync all users (admin only)

**Admin dashboard (new page):**
- `src/pages/Admin.jsx` - Admin-only page at `/admin`
- Table view with search, filter by badge/status, sorting
- Expandable rows with full profile details
- CSV export and "Sync to Airtable" button
- Admin access via email list: amditisj@montclair.edu, jamditis@gmail.com, murrays@montclair.edu

### Airtable Attendees table setup (in progress)

**Base:** 2026 CJS (appL8Sn87xUotm4jF)
**Table:** Attendees (viw3bQPelgsSvk9QK)

**Required fields:**
| Field | Type | Status |
|-------|------|--------|
| uid | Single line text | Pending |
| Email | Email | Pending |
| Name | Single line text | Pending |
| Organization | Single line text | Pending |
| Role | Single line text | Pending |
| Photo URL | URL | Pending |
| Website | URL | Pending |
| Instagram | Single line text | Pending |
| LinkedIn | Single line text | Pending |
| Bluesky | Single line text | Pending |
| Badges | Long text | Pending |
| Attended Summits | Long text | Pending |
| Custom Badges | Long text | Pending |
| Registration Status | Single select | ✓ Done |
| Notify When Tickets Available | Checkbox | ✓ Done |
| Created At | Date | Pending |
| Updated At | Date | Pending |

**Helper script:** `node scripts/check-attendees-table.cjs` - Checks table structure

### Next steps

1. Add remaining 15 fields to Attendees table in Airtable
2. Deploy Cloud Functions: `firebase deploy --only functions`
3. Wait for Marty to add DNS record, then verify domain
4. Update meta tags/canonical URLs once domain is verified

---

## Personal schedule builder (added 2025-12-15)

**Full personal schedule feature allowing users to save and share sessions:**

### Features

- **Save sessions:** Logged-in users can bookmark sessions from the Schedule page
- **My Schedule view:** Dashboard widget + dedicated /my-schedule page
- **Sharing:** Three visibility levels (private, attendees-only, public)
- **Shared schedule page:** View another user's schedule at /schedule/user/:uid

### Architecture

**Data flow:**
1. Session data generated from Airtable Schedule table at build time
2. User's saved sessions stored as array of session IDs in Firestore
3. Sessions looked up from static data at runtime (fast, no API calls)

**Firestore user fields (added):**
- `savedSessions: string[]` - Array of session IDs
- `scheduleVisibility: 'private' | 'attendees_only' | 'public'`

### Key files

| File | Purpose |
|------|---------|
| `scripts/generate-schedule.cjs` | Pulls from Airtable Schedule table |
| `src/content/scheduleData.js` | Auto-generated session data (DO NOT EDIT) |
| `src/components/SessionCard.jsx` | Session display with save/unsave button |
| `src/components/MySchedule.jsx` | Reusable personal schedule component |
| `src/components/ShareScheduleModal.jsx` | Visibility settings modal |
| `src/pages/Schedule.jsx` | Updated to use dynamic data + filtering |
| `src/pages/MySchedulePage.jsx` | Full /my-schedule page |
| `src/pages/SharedSchedule.jsx` | View shared schedule at /schedule/user/:uid |
| `src/contexts/AuthContext.jsx` | Added saveSession, unsaveSession, isSessionSaved, updateScheduleVisibility |

### Routes

| Route | Component | Auth |
|-------|-----------|------|
| `/schedule` | Schedule.jsx | No |
| `/my-schedule` | MySchedulePage.jsx | Yes |
| `/schedule/user/:uid` | SharedSchedule.jsx | Depends on visibility |

### Airtable Schedule table

**Base:** 2026 CJS (appL8Sn87xUotm4jF)
**Table:** Schedule

**Fields (current):**
- `Session title` - Session name
- `Type` - session, workshop, break, special, lightning
- `day` / `Day` - Monday or Tuesday
- `start_time` / `Start time` - Start time
- `end_time` / `End time` - End time
- `description` / `Description` - Session description
- `room` / `Room` - Location
- `speakers` / `Speakers` - Speaker names
- `speaker_orgs` / `Speaker orgs` - Speaker organizations
- `track` / `Track` - Track name (for parallel sessions)
- `order` / `Order` - Display order
- `visible` / `Visible` - Show on schedule
- `is_bookmarkable` - Can users save this session
- `session_id` - Unique ID for the session

### NPM scripts

```bash
npm run generate-schedule    # Pull sessions from Airtable
npm run generate-all         # Generate both content and schedule
```

### Deploy workflow integration

The deploy workflow now runs `npm run generate-all` which generates both site content and schedule data from Airtable before building.

---

## Pending/backlog

- Additional frontend polish (Gemini working on this)
- Firebase Storage rules need to be deployed (see above for rule config)
- Deploy profile sync Cloud Functions after Attendees table is set up
- Firestore security rules for schedule sharing (allow read based on scheduleVisibility)

---

## Updates (2025-12-17)

### Organizations CMS integration for sponsors

Implemented full CMS-driven sponsor display system:

**What was built:**
- `scripts/generate-organizations.cjs` - Pulls organizations from Airtable, filters by "Sponsor" checkbox
- `src/content/organizationsData.js` - Auto-generated sponsor data (DO NOT EDIT)
- Homepage "Supported by" section now uses dynamic data
- Sponsors page "Thank you to our sponsors" section now uses dynamic data
- Sponsors grouped by tier with tier labels (e.g., "Presenting sponsor")

**Airtable setup:**
- Table: Organizations (in base appL8Sn87xUotm4jF)
- Key fields: Name, Logo (attachment), Website, Sponsor (checkbox), Sponsor tier (single select)
- Current sponsor: Knight Foundation (Presenting sponsor)

**Files changed:**
| File | Changes |
|------|---------|
| `scripts/generate-organizations.cjs` | New - pulls sponsors from Airtable |
| `src/content/organizationsData.js` | New - auto-generated sponsor data |
| `src/pages/Home.jsx` | Dynamic sponsor display with tier grouping |
| `src/pages/Sponsors.jsx` | Dynamic sponsor display at top of page |
| `package.json` | Added generate-organizations script |

### Navbar consistency fix

Fixed navigation links disappearing on non-homepage routes:

**Before:** History and Partners links only showed on homepage
**After:** All nav links show on all pages, using `/#history` and `/#partners` format

**Files changed:**
- `src/components/Navbar.jsx` - Removed `isHome` conditional, changed to `homeSectionLinks` with hash URLs

### User-facing ticket reset

Added ability for users to reset their ticket purchase status:

**Before:** Only admins could reset ticket status
**After:** Users see "Not correct? Reset status" link under "Tickets purchased" confirmation

**Files changed:**
- `src/pages/Dashboard.jsx` - Added reset button in ticket confirmation card

### Key files summary

| File | Purpose |
|------|---------|
| `scripts/generate-organizations.cjs` | Pull sponsors from Airtable Organizations table |
| `src/content/organizationsData.js` | Auto-generated sponsor data (DO NOT EDIT) |
| `src/pages/Home.jsx` | Homepage with dynamic sponsors |
| `src/pages/Sponsors.jsx` | Sponsors page with dynamic sponsors |
| `src/components/Navbar.jsx` | Consistent navigation across all pages |
| `src/pages/Dashboard.jsx` | User dashboard with ticket reset |

### NPM scripts (updated)

```bash
npm run generate-content       # Pull site content from Airtable
npm run generate-schedule      # Pull schedule from Airtable
npm run generate-organizations # Pull sponsors from Airtable
npm run generate-all           # Run all three generators
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run deploy                 # Build and deploy to Firebase
```

### Current sponsors

| Organization | Tier | Status |
|--------------|------|--------|
| Knight Foundation | Presenting sponsor | ✅ Live |

*To add sponsors: Go to Airtable Organizations table → Check "Sponsor" checkbox → Set tier → Deploy*

---

## Updates (2025-12-18)

### Admin panel enhancements

**Edit/delete users from admin dashboard:**
- Admins and super admins can now edit user profiles directly from the Admin panel
- Edit modal allows updating: name, email, organization, job title, registration status, system role, social links
- Delete confirmation modal with warning
- Super admins can change system roles; regular admins cannot

**Admin badges in attendees table:**
- Shield icon badges next to user names identify admins
- Amber badge with "Super" label for super_admins
- Teal badge with "Admin" label for admins

### Firestore security rules updates

Updated `firestore.rules` to support admin operations:

```javascript
match /users/{userId} {
  // Users can read/write their own profile
  allow read, write: if request.auth != null && request.auth.uid == userId;
  // Admins can read all profiles
  allow read: if isAdmin() || isSuperAdmin();
  // Admins can update (except role field)
  allow update: if isAdmin() && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']);
  // Super admins can update any field including role
  allow update: if isSuperAdmin();
  // Admins and super admins can delete users
  allow delete: if isAdmin() || isSuperAdmin();
}
```

### Access control for unpaid users

Dashboard now gates full access based on registration status:
- **Full access:** Admins, super_admins, users with `registrationStatus: 'registered'` or `'confirmed'`
- **Gated view:** Pending users see a message about purchasing tickets or requesting admin approval
- Includes "Notify me when tickets are available" option

### Authentication improvements

**Fixed Firestore permission errors:**
- Removed email-based duplicate user query that caused permission errors for non-admin users
- Firebase Auth's "One account per email" setting handles duplicate prevention instead
- Added try-catch error handling to `createUserProfile()`, `getUserProfile()`, `loginWithGoogle()`

**Cross-browser Google OAuth with redirect fallback:**
- Mobile and Safari browsers now use redirect-based auth (more reliable)
- Desktop browsers try popup first, automatically fall back to redirect if blocked
- Added loading state "Completing sign-in..." for redirect auth in progress
- No longer requires users to enable popups or use specific browsers

**Key auth files updated:**
- `src/contexts/AuthContext.jsx` - Redirect-based auth, error handling
- `src/pages/Login.jsx` - Redirect state handling, improved error messages

### OG image fix

Replaced incorrect OG social share image:
- Copied correct 2.5MB og-image.png to public folder
- Same image now used across all pages

### Admin email management

**Removed hardcoded admin email:**
- Denise Shannon's email removed from `ADMIN_EMAILS` arrays
- Admin access should be granted via Firestore `role` field, not hardcoded emails
- Proper flow: User signs in → Admin edits their profile → Sets role to `admin` or `super_admin`

### Files changed

| File | Changes |
|------|---------|
| `src/pages/Admin.jsx` | Edit/delete modals, admin badges |
| `src/pages/Dashboard.jsx` | Access control gating, ticket reset |
| `src/pages/AdminOld.jsx` | Removed hardcoded admin email |
| `src/contexts/AuthContext.jsx` | Redirect auth, error handling |
| `src/pages/Login.jsx` | Redirect state, improved errors |
| `firestore.rules` | Admin update/delete permissions |
| `public/og-image.png` | Replaced with correct image |

### Current admin emails (hardcoded bootstrap only)

| Email | Purpose |
|-------|---------|
| jamditis@gmail.com | Joe (super admin) |
| murrayst@montclair.edu | Stefanie |
| etiennec@montclair.edu | Etienne |

*New admins should be added via Firestore role field, not hardcoded.*

---

## Updates (2025-12-18 evening session)

### Bug fixes

**1. Firestore document not created on Google sign-in**
- **Root cause:** `createUserProfile()` returned early without creating document when Google account lacked a `displayName` (common with Google Workspace accounts)
- **Fix:** Now always creates document with full 20+ field schema, then flags for profile completion if displayName missing
- **File:** `src/contexts/AuthContext.jsx`

**2. Partial documents created by updateUserProfile**
- **Root cause:** Using `merge: true` on non-existent documents creates partial documents with only the passed fields
- **Fix:** Added `ensureUserDocumentExists()` helper that checks if document exists before any merge operation; if not, creates it with full schema first
- **Files:** `src/contexts/AuthContext.jsx` - Updated `updateUserProfile`, `saveSession`, `unsaveSession`, `updateScheduleVisibility`

**3. Dashboard crash for unknown registration status**
- **Root cause:** `statusConfig[registrationStatus]` returned undefined for status values like "approved"
- **Fix:** Added fallback `|| statusConfig.pending` and added 'approved' as alias for 'registered' in hasFullAccess check
- **File:** `src/pages/Dashboard.jsx`

**4. Admin panel access denied for ADMIN_EMAILS users**
- **Root cause:** Cloud Function `isAdmin()` only checked Firestore `role` field, not the hardcoded ADMIN_EMAILS list that Dashboard.jsx uses
- **Fix:** Added ADMIN_EMAILS list to Cloud Functions and updated `isAdmin()` to check both email list and role field
- **File:** `functions/index.js`

**5. Airtable API 401 error in getSiteContent**
- **Root cause:** Expired Airtable API token
- **Fix:** Updated `AIRTABLE_API_KEY` Firebase secret with new token
- **Command:** `firebase functions:secrets:set AIRTABLE_API_KEY`

### UX improvements

**Softened pending approval wall**
- **Before:** Full-page blocker prevented pending users from doing anything
- **After:** Compact banner at top + full dashboard access
- Pending users can now:
  - Complete profile wizard (name, photo, organization, badges)
  - Edit their profile
  - View event details and quick links
- Still gated for pending users:
  - MySchedule widget shows "Locked" badge and "Build your personal schedule after approval"
  - Personal schedule builder features

### New files

| File | Purpose |
|------|---------|
| `docs/USER_PROFILE_SCHEMA.md` | Complete user document schema with all 20+ fields |
| `docs/test-user-example.json` | JSON template for creating test users |
| `scripts/clear-test-users.cjs` | Script for cleaning up test user records |

### Updated admin emails

Removed old emails, updated to current team:
- `jamditis@gmail.com` (super admin)
- `murrayst@montclair.edu` (admin)
- `etiennec@montclair.edu` (admin)

Files updated: `Dashboard.jsx`, `functions/index.js`, `scripts/clear-test-users.cjs`

---

## Pre-launch backlog

### Must-fix before launch

| Item | Priority | Status |
|------|----------|--------|
| Test fresh sign-up flow with Denise Shannon | High | Pending |
| Verify Firestore documents created correctly | High | ✅ Done |
| Deploy Firebase Storage rules for profile photos | Medium | Pending |

### Nice-to-have

| Item | Priority | Status |
|------|----------|--------|
| Additional frontend polish (Gemini) | Low | In progress |
| Email notifications for account approval (via Airtable automation) | Low | Backlog |
| Firestore security rules for schedule sharing | Low | Backlog |

### Testing checklist

- [ ] New user can sign in with Google (Workspace account)
- [ ] Firestore document created with all 20+ fields
- [ ] Profile wizard appears for users without displayName
- [ ] Pending users see banner + can edit profile
- [ ] Pending users see "Locked" on MySchedule widget
- [ ] Approved users have full dashboard access
- [ ] Admin panel accessible to ADMIN_EMAILS users
- [ ] Admin can approve pending users
- [ ] Admin can grant/revoke admin roles

---

## Quick reference

### Adding a new admin

1. User signs in to the site (Google or magic link)
2. Go to Admin Panel → Attendees
3. Find the user and click Edit
4. Set "System role" to `admin` or `super_admin`
5. Save changes

### Deploying changes

```bash
npm run build && npx firebase deploy --only hosting  # Frontend only
firebase deploy --only functions                      # Cloud Functions only
firebase deploy --only firestore:rules                # Security rules only
npm run deploy                                        # Full deploy (build + hosting)
```

### Troubleshooting auth issues

1. **Google sign-in fails:** Now auto-falls back to redirect; should work on all browsers
2. **Magic link shows blank page:** Link was already used or expired; request a new one
3. **Permission denied errors:** Check Firestore rules are deployed; user may not have correct role

---

## Updates (2025-12-19)

### Session bookmark counter badges

Added real-time bookmark counters showing how many attendees have saved each session:

**Features:**
- Counter badge appears next to bookmark button on Schedule page
- Badge changes appearance based on popularity:
  - **Normal (1-4)**: Gray badge with user icon
  - **Popular (5-9)**: Amber badge with flame icon
  - **Hot (10+)**: Red/orange gradient badge with pulsing flame icon
- Real-time updates via Firestore subscription
- Shows on Schedule page, MySchedule, and SharedSchedule views

**Architecture:**
- Bookmark counts stored in `sessionBookmarks/{sessionId}` collection
- `count` field uses Firestore `increment()` for atomic updates
- `useBookmarkCounts` hook subscribes to counts collection
- Counts update when any user saves/unsaves a session

**New files:**
| File | Purpose |
|------|---------|
| `src/hooks/useBookmarkCounts.js` | Hook to fetch and subscribe to bookmark counts |

**Files changed:**
| File | Changes |
|------|---------|
| `src/contexts/AuthContext.jsx` | Added increment/decrement on save/unsave |
| `src/components/SessionCard.jsx` | Added tiered bookmark count badge |
| `src/pages/Schedule.jsx` | Pass bookmark counts to SessionCard |
| `src/components/MySchedule.jsx` | Pass bookmark counts to SessionCard |
| `src/pages/SharedSchedule.jsx` | Pass bookmark counts to SessionCard |
| `firestore.rules` | Added rules for sessionBookmarks collection |

**Firestore rules for sessionBookmarks:**
```javascript
match /sessionBookmarks/{sessionId} {
  allow read: if true;  // Public read for schedule page
  allow create, update: if request.auth != null;  // Authenticated users can update counts
  allow delete: if isAdmin() || isSuperAdmin();  // Admins can reset counts
}
```

### Backlog: Airtable sync for bookmark counts

Future enhancement to sync bookmark counts to Airtable for CMS visibility:

**Proposed approach:**
1. Add `bookmark_count` field to Schedule table in Airtable
2. Create Cloud Function to sync counts from Firestore to Airtable
3. Add admin button to manually sync or reset counts
4. Potentially run scheduled sync daily

**Benefits:**
- Editors can see session popularity in Airtable
- Can export popularity data for reporting
- Can manually override counts if needed

### Admin panel: Sessions tab

Added new "Sessions" tab to the admin dashboard showing session popularity analytics:

**Features:**
- Summary cards: Total bookmarks, Hot sessions (10+), Popular (5-9), Need attention (0)
- Ranked list of all bookmarkable sessions sorted by popularity
- Color-coded tier badges (Hot/Popular/Normal/Cold)
- Alert section highlighting sessions with zero bookmarks that need promotion
- Real-time updates from Firestore

**Location:** Admin Panel → Sessions (in sidebar)
