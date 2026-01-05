# CJS2026 Development Changelog

This file contains detailed historical updates from the CJS2026 website development. Moved from CLAUDE.md to reduce file size while preserving context.

---

## 2026-01-04

### UX improvements and audit fixes

Comprehensive UI/UX audit and fixes across admin and attendee interfaces:

**CMS improvements:**
- Added undo functionality for content reordering (Ctrl+Z / Cmd+Z)
- Up to 10 recent actions can be undone
- Undo button added to CMS header
- Increased reorder button touch targets to 40px (WCAG compliant)
- Added aria-labels to reorder buttons for screen readers
- Simplified CMS tour from 8 steps to 5 steps (only visible elements)

**Attendee UX:**
- Bookmark removal now shows undo option in toast (5-second window)
- Schedule visibility changes require confirmation when making more public
- PDF schedule export with proper time formatting
- Added aria-labels to Download and Share buttons
- Profile cancel/skip button always visible during editing

**Admin UX:**
- Announcement toggle (active/inactive) requires confirmation dialog
- Fixed lanyard dismiss button text ("Dismiss lanyard" instead of "Close")
- CMS tour tooltip positioning fixed for viewport boundaries

**Files modified:**
- `src/components/CMSManager.jsx` - Undo stack, larger touch targets, aria-labels
- `src/components/SessionCard.jsx` - Bookmark undo toast
- `src/components/ShareScheduleModal.jsx` - Visibility confirmation, error feedback
- `src/pages/Admin.jsx` - Announcement toggle confirmation
- `src/pages/Dashboard.jsx` - Always-visible cancel button
- `src/pages/MySchedulePage.jsx` - Aria-labels
- `src/components/Lanyard.jsx` - Dismiss button text
- `src/components/CMSTour.jsx` - Simplified tour, viewport-aware positioning

---

## 2026-01-02

### Custom CMS implementation

Replaced Airtable-based CMS with a fully custom Firestore-based CMS:

**New Firestore collections:**
- `cmsContent` — Site text, stats, info cards
- `cmsSchedule` — Session data
- `cmsOrganizations` — Sponsors & partners
- `cmsTimeline` — Summit history
- `cmsVersionHistory` — Audit trail for all changes
- `cmsPublishQueue` — Deploy status tracking

**CMSManager component (`src/components/CMSManager.jsx`):**
- Full CRUD interface for all CMS collections
- Real-time Firestore subscriptions
- Drag-and-drop reordering with up/down arrows
- Section-aware content insertion
- Version history viewer
- Publish workflow with GitHub Actions integration

### Role-based CMS access

Implemented field-level access control in all CMS editors:

**Regular admins (`role: 'admin'`) can edit:**
- Content text (headlines, descriptions, body copy)
- Colors
- Links
- Speaker/room information

**Super admins (`role: 'super_admin'`) can also edit:**
- Field IDs / content names
- Section assignments
- Block types
- Order numbers
- Visibility toggles
- Page context

This prevents regular admins from accidentally breaking the site by changing metadata.

### CMS guided tour

Added interactive walkthrough for first-time CMS users:

- 5-step tour covering visible CMS features (simplified from 8 steps in 2026-01-04)
- Spotlight effect on target elements
- localStorage persistence ("Don't show again" option)
- "Take tour" button to restart anytime
- Viewport-aware tooltip positioning

**Files:**
- `src/components/CMSTour.jsx` — Tour component with CMSTour, TourTrigger, CMSTooltip exports
- `data-tour` attributes on key CMSManager elements

### CMS architecture file

Created `src/cms/cmsArchitecture.js` with:
- 14 block types (headline, subheadline, body_text, bullet_list, stat_card, info_card, timeline_item, cta_button, contact_item, sponsor_package, day_header, notice_banner, divider, custom)
- 7 page configurations (home, schedule, sponsors, conduct, contact, auth, global)
- Section definitions with allowed block types
- Color options and helper functions

### Documentation updates

- Condensed `CLAUDE.md` from ~300 lines to ~160 lines
- Removed outdated Airtable references
- Added role-based access documentation
- Created `docs/CMS_EDITOR_GUIDE.md` for editors

---

## 2025-12-19

### Session bookmark counter badges

Added real-time bookmark counters showing how many attendees have saved each session:

- Counter badge appears next to bookmark button on Schedule page
- Badge tiers: Normal (1-4), Popular (5-9), Hot (10+)
- Real-time updates via Firestore subscription
- Bookmark counts stored in `sessionBookmarks/{sessionId}` collection
- `useBookmarkCounts` hook subscribes to counts collection

### Admin panel: Sessions tab

Added new "Sessions" tab to the admin dashboard showing session popularity analytics:

- Summary cards: Total bookmarks, Hot sessions (10+), Popular (5-9), Need attention (0)
- Ranked list of all bookmarkable sessions sorted by popularity
- Color-coded tier badges (Hot/Popular/Normal/Cold)
- Alert section highlighting sessions with zero bookmarks

---

## 2025-12-18 evening session

### Bug fixes

1. **Firestore document not created on Google sign-in** — `createUserProfile()` returned early without creating document when Google account lacked a `displayName`. Now always creates document with full 20+ field schema.

2. **Partial documents created by updateUserProfile** — Using `merge: true` on non-existent documents creates partial documents. Added `ensureUserDocumentExists()` helper.

3. **Dashboard crash for unknown registration status** — Added fallback `|| statusConfig.pending` and 'approved' alias.

4. **Admin panel access denied for ADMIN_EMAILS users** — Cloud Function `isAdmin()` now checks both email list and role field.

5. **Airtable API 401 error** — Updated expired `AIRTABLE_API_KEY` Firebase secret.

### UX improvements

- Softened pending approval wall — Compact banner at top + full dashboard access
- Pending users can complete profile wizard and edit profile
- MySchedule widget shows "Locked" badge for pending users

---

## 2025-12-18

### Admin panel enhancements

- Edit/delete users from admin dashboard
- Admin badges in attendees table (shield icons)
- Super admins can change system roles; regular admins cannot

### Authentication improvements

- Cross-browser Google OAuth with redirect fallback
- Mobile and Safari browsers use redirect-based auth
- Desktop browsers try popup first, fall back to redirect

### Access control for unpaid users

Dashboard gates full access based on registration status. Full access for admins, super_admins, users with `registrationStatus: 'registered'` or `'confirmed'`.

---

## 2025-12-17

### Organizations CMS integration for sponsors

- `scripts/generate-organizations.cjs` — Pulls organizations from Airtable, filters by "Sponsor" checkbox
- Homepage "Supported by" section uses dynamic data
- Sponsors page uses dynamic data
- Sponsors grouped by tier with tier labels

### Navbar consistency fix

All nav links show on all pages, using `/#history` and `/#partners` format.

### User-facing ticket reset

Users see "Not correct? Reset status" link under ticket confirmation.

---

## 2025-12-15

### Personal schedule builder

- Save sessions: Logged-in users can bookmark sessions
- My Schedule view: Dashboard widget + dedicated /my-schedule page
- Sharing: Three visibility levels (private, attendees-only, public)
- Shared schedule page at /schedule/user/:uid

---

## 2025-12-10

### Custom domain setup

Set up `summit.collaborativejournalism.org` as custom domain via Cloudflare CNAME.

### Airtable CMS color fix

`InfoCard` component accepts `color` prop and uses `getColorClass()` dynamically.

### Attendee profile sync to Airtable

Cloud Functions for syncing user profiles:
- `syncProfileToAirtable` — Syncs single user profile
- `exportAttendees` — Returns all profiles as JSON (admin only)
- `syncAllProfilesToAirtable` — Batch sync all users (admin only)

---

## 2025-12-09 evening

### Stepper UX improvements

- Modal widened to `max-w-lg`, padding increased, scrollable on small screens
- Animation direction reversed: Forward = slide from right, Back = slide from left
- Progress indicators moved to bottom

### Profile photo upload

- Max 2MB, JPG/PNG/WebP only
- Auto-resizes to 800x800px max
- Uploads to Firebase Storage: `profile-photos/{uid}/{timestamp}.jpg`

### Slur filter (hate speech only)

`src/utils/profanityFilter.js` — ~170 slurs (racial, ethnic, religious, disability, anti-LGBTQ). Does NOT block general profanity.

### Social links update

Replaced Twitter/X with Instagram in profile social links.

---

## 2025-12-09

### Passwordless authentication

Changed auth flow from email/password to passwordless magic links:
- `/login` — Email input sends magic link, or use Google OAuth
- `/auth/callback` — Handles magic link verification
- `/privacy` — Privacy policy page
- Removed `/register` and `/forgot-password`

### Dashboard enhancements

- Tutorial animation with pulsing teal glow on profile card
- Input validation with forced prefixes (https://, @, linkedin.com/in/)
- Badge system (experience, role, attendance, philosophy, misc)

### shadcn MCP integration

Initialized shadcn MCP server for Claude Code integration.

### Airtable CMS integration

Full headless CMS implemented using Airtable + GitHub Actions:
1. Editor updates content in Airtable
2. Clicks "Update website" button
3. GitHub Actions workflow triggers
4. Workflow pulls content, generates static JS, builds, deploys
5. Live site updates in ~60 seconds

### User authentication system

Full auth system with Firebase Auth:
- User profiles in Firestore `users/{uid}` collection
- Registration statuses: pending, registered, confirmed
- Google OAuth + magic links

---

## Notes from Gemini (2025-12-09)

- Updated `CJS_WEB_STYLE_GUIDE.md` to reflect latest project structure
- Updated `src/components/EmailSignup.jsx` to use Cloud Function instead of direct Airtable API
- Cleaned up `.env.example` to remove unused Airtable keys

---

## Project status (as of 2025-12-18)

### Completed

**Infrastructure:**
- Firebase Hosting at https://cjs2026.web.app and https://summit.collaborativejournalism.org
- Firebase Firestore with comprehensive security rules
- Firebase Cloud Functions (saveEmailSignup, health, syncProfileToAirtable, exportAttendees, etc.)
- Firebase Analytics and Storage
- GitHub Actions workflow for automated deploys

**Frontend:**
- Save-the-date landing page
- Countdown timer to June 8, 2026
- 10th anniversary timeline
- Sticky navbar with scroll effect
- Mobile responsive
- Dynamic sponsor display
- User authentication with magic links + Google OAuth
- Attendee dashboard with profile wizard
- Personal schedule builder with sharing

**Admin panel:**
- Full admin command center at `/admin`
- Attendee management with search, filter, sort
- Edit/delete user profiles
- Session popularity analytics
- Announcement banner management
- CSV export and Airtable sync

**Content:**
- Announcement materials in `planning/announcement-materials.md`
