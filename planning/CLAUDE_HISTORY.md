# CLAUDE.md Historical Archive

This file contains historical session notes and implementation details removed from CLAUDE.md on 2026-01-05 to reduce context size. Reference as needed.

---

## Project status (as of 2025-12-18)

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

### Cloud Function endpoints

- `https://us-central1-cjs2026.cloudfunctions.net/saveEmailSignup` (POST)
- `https://us-central1-cjs2026.cloudfunctions.net/health` (GET)

---

## Notes from Gemini (2025-12-09)

**Updates:**
- **Style Guide:** Updated `CJS_WEB_STYLE_GUIDE.md` to reflect the latest project structure, including the new `Navbar` and `HistoryTimeline` components, and the move to Cloud Functions for email signups.
- **Security:** Updated `src/components/EmailSignup.jsx` to use the `saveEmailSignup` Cloud Function instead of the direct Airtable API, securing the API key server-side.
- **Environment:** Cleaned up `.env.example` to remove unused Airtable keys.

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

**Note:** Google OAuth requires enabling in Firebase Console (Authentication > Sign-in method > Google).

---

## Airtable CMS integration (added 2025-12-09)

**Full headless CMS implemented using Airtable + GitHub Actions:**

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

### GitHub secrets required

- `AIRTABLE_API_KEY` - Airtable personal access token
- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON

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

Creates `.mcp.json` with shadcn server config. Restart Claude Code to activate.

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
| 2017 | Montclair, NJ | inaugural |
| 2018 | Montclair, NJ | |
| 2019 | Philadelphia, PA | |
| 2020 | virtual | pandemic |
| 2021 | virtual | pandemic |
| 2022 | Chicago, IL | |
| 2023 | Washington D.C. | |
| 2024 | Detroit, MI | |
| 2025 | Denver, CO | |

### Attendance badges

Auto-generated based on summit history:
- **OG** - attended inaugural 2017
- **COVID badges** - pandemic pioneer (2020), lockdown loyalist (2021), zoom veteran (both)
- **Streak badges** - back-to-back (2 consecutive), three-peat (3), N-year streak (4+)
- **City badges** - for single in-person summit attendance

### Bug fixes (2025-12-09)

- **getSiteContent 500 error:** Fixed incorrect API key reference in Cloud Function
- **API key exposure:** App.jsx email signup now uses Cloud Function
- **Stepper modal close:** Fixed modal squashing instead of closing
- **Spam folder message:** Centered, teal background, larger text

---

## Updates (2025-12-10)

### Custom domain setup

Setting up `summit.collaborativejournalism.org` as custom domain.

**DNS setup:**
- CNAME record: `summit` → `cjs2026.web.app`
- Proxy status: DNS only (grey cloud in Cloudflare)

### Airtable CMS color fix

Fixed hardcoded colors in Home.jsx so CMS color changes are properly reflected:
- `InfoCard` component now accepts `color` prop and uses `getColorClass()` dynamically
- "What to expect" section now uses dynamic colors from `expect` section in CMS

### Attendee profile sync to Airtable

**Cloud Functions (in `functions/index.js`):**
- `syncProfileToAirtable` - Syncs single user profile (upsert pattern)
- `exportAttendees` - Returns all profiles as JSON (admin only)
- `syncAllProfilesToAirtable` - Batch sync all users (admin only)

### Airtable Attendees table

**Base:** 2026 CJS (appL8Sn87xUotm4jF)
**Table:** Attendees

**Fields:**
- uid, Email, Name, Organization, Role, Photo URL, Website
- Instagram, LinkedIn, Bluesky, Badges, Attended Summits, Custom Badges
- Registration Status, Notify When Tickets Available, Created At, Updated At

---

## Personal schedule builder (added 2025-12-15)

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

### Routes

| Route | Component | Auth |
|-------|-----------|------|
| `/schedule` | Schedule.jsx | No |
| `/my-schedule` | MySchedulePage.jsx | Yes |
| `/schedule/user/:uid` | SharedSchedule.jsx | Depends on visibility |

---

## Updates (2025-12-17)

### Organizations CMS integration for sponsors

- `scripts/generate-organizations.cjs` - Pulls organizations from Airtable, filters by "Sponsor" checkbox
- `src/content/organizationsData.js` - Auto-generated sponsor data
- Sponsors grouped by tier with tier labels

### Navbar consistency fix

All nav links show on all pages, using `/#history` and `/#partners` format

### User-facing ticket reset

Users see "Not correct? Reset status" link under "Tickets purchased" confirmation

---

## Updates (2025-12-18)

### Admin panel enhancements

**Edit/delete users from admin dashboard:**
- Edit modal allows updating: name, email, organization, job title, registration status, system role, social links
- Delete confirmation modal with warning
- Super admins can change system roles; regular admins cannot

**Admin badges in attendees table:**
- Shield icon badges next to user names identify admins
- Amber badge with "Super" label for super_admins
- Teal badge with "Admin" label for admins

### Firestore security rules updates

```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  allow read: if isAdmin() || isSuperAdmin();
  allow update: if isAdmin() && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']);
  allow update: if isSuperAdmin();
  allow delete: if isAdmin() || isSuperAdmin();
}
```

### Access control for unpaid users

- **Full access:** Admins, super_admins, users with `registrationStatus: 'registered'` or `'confirmed'`
- **Gated view:** Pending users see compact banner + can still edit profile

### Authentication improvements

**Cross-browser Google OAuth with redirect fallback:**
- Mobile and Safari browsers now use redirect-based auth
- Desktop browsers try popup first, automatically fall back to redirect if blocked

---

## Updates (2025-12-18 evening)

### Bug fixes

1. **Firestore document not created on Google sign-in** - Now always creates document with full 20+ field schema
2. **Partial documents created by updateUserProfile** - Added `ensureUserDocumentExists()` helper
3. **Dashboard crash for unknown registration status** - Added fallback handling
4. **Admin panel access denied for ADMIN_EMAILS users** - Added email list to Cloud Functions
5. **Airtable API 401 error** - Updated token via `firebase functions:secrets:set AIRTABLE_API_KEY`

### UX improvements

**Softened pending approval wall:**
- Compact banner at top + full dashboard access for pending users
- MySchedule widget shows "Locked" badge

---

## Updates (2025-12-19)

### Session bookmark counter badges

- Counter badge appears next to bookmark button on Schedule page
- Badge tiers: Normal (1-4), Popular (5-9), Hot (10+)
- Real-time updates via Firestore subscription
- Counts stored in `sessionBookmarks/{sessionId}` collection

**Firestore rules:**
```javascript
match /sessionBookmarks/{sessionId} {
  allow read: if true;
  allow create, update: if request.auth != null;
  allow delete: if isAdmin() || isSuperAdmin();
}
```

### Admin panel: Sessions tab

- Summary cards: Total bookmarks, Hot sessions, Popular, Need attention
- Ranked list sorted by popularity
- Color-coded tier badges

---

## Testing checklist (reference)

- [ ] New user can sign in with Google (Workspace account)
- [ ] Firestore document created with all 20+ fields
- [ ] Profile wizard appears for users without displayName
- [ ] Pending users see banner + can edit profile
- [ ] Pending users see "Locked" on MySchedule widget
- [ ] Approved users have full dashboard access
- [ ] Admin panel accessible to ADMIN_EMAILS users
- [ ] Admin can approve pending users
- [ ] Admin can grant/revoke admin roles
