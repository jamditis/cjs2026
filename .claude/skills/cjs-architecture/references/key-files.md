# Key Files Reference

Quick reference for the most important files in the CJS2026 codebase.

## Entry Points

| File | Purpose |
|------|---------|
| `src/main.jsx` | React app entry, routing, context providers |
| `src/App.jsx` | Legacy landing page (mostly unused) |
| `index.html` | HTML template, meta tags, font loading |

## Pages (src/pages/)

| File | Lines | Route | Auth |
|------|-------|-------|------|
| `Home.jsx` | ~500 | `/` | No |
| `Dashboard.jsx` | 2,067 | `/dashboard` | Yes |
| `Admin.jsx` | 3,129 | `/admin` | Admin |
| `Schedule.jsx` | ~300 | `/schedule` | No |
| `Login.jsx` | ~200 | `/login` | No |
| `MySchedulePage.jsx` | ~100 | `/my-schedule` | Yes |
| `SharedSchedule.jsx` | ~150 | `/schedule/user/:uid` | Depends |

## Core Components (src/components/)

| File | Purpose |
|------|---------|
| `Navbar.jsx` | Site navigation, auth state |
| `Footer.jsx` | Site footer |
| `SessionCard.jsx` | Schedule session display |
| `MySchedule.jsx` | Personal schedule widget |
| `Stepper.jsx` | Multi-step form wizard |
| `ProfileSetupModal.jsx` | New user profile wizard |

## Contexts (src/contexts/)

| File | Lines | Exports |
|------|-------|---------|
| `AuthContext.jsx` | 488 | `useAuth()`, `AuthProvider` |
| `ContentContext.jsx` | 150 | UNUSED (dead code) |

## Content (src/content/) - AUTO-GENERATED

| File | Source | Generator |
|------|--------|-----------|
| `siteContent.js` | Site Content table | `generate-content.cjs` |
| `scheduleData.js` | Schedule table | `generate-schedule.cjs` |
| `organizationsData.js` | Organizations table | `generate-organizations.cjs` |

## Backend (functions/)

| File | Lines | Endpoints |
|------|-------|-----------|
| `index.js` | 1,988 | 20+ Cloud Functions |

## Configuration

| File | Purpose |
|------|---------|
| `firebase.json` | Firebase project config |
| `firestore.rules` | Firestore security rules |
| `storage.rules` | Storage security rules |
| `vite.config.js` | Vite build config |
| `tailwind.config.js` | Tailwind CSS config |

## Scripts (scripts/)

| File | Command | Purpose |
|------|---------|---------|
| `generate-content.cjs` | `npm run generate-content` | Pull site content |
| `generate-schedule.cjs` | `npm run generate-schedule` | Pull schedule |
| `generate-organizations.cjs` | `npm run generate-organizations` | Pull sponsors |
