 # CLAUDE.md

This file provides guidance to Claude Code when working with the CJS2026 website.

---

## 📋 Session handoff (last updated: 2026-01-05 evening)

### Current state
- Site is live at summit.collaborativejournalism.org
- All core features complete: auth, dashboard, profile wizard, personal schedule, admin panel
- CMS in admin dashboard with bidirectional Airtable sync
- Session bookmark counters with popularity badges (Hot/Popular/Normal)
- Admin panel streamlined: 6 tabs (Overview, Edit Content, Broadcast, Updates, Attendees, Sessions, Settings)

### Recent work (this session)
- **Firestore→Airtable sync:** Added `syncCMSToAirtable` Cloud Function for manual backup to Airtable
- **Admin cleanup:** Removed 6 unused monitoring Cloud Functions (getAdminLogs, getActivityLogs, getSystemErrors, resolveError, getBackgroundJobs, invalidateCache)
- **Admin cleanup:** Removed 4 UI tabs (Activity, Errors, Jobs, Audit) - use `firebase functions:log` instead
- **Logo sync:** Added logo URL syncing to Airtable for organizations
- **CMS UX:** Made "Edit Content" tab prominent (2nd position, pulsing indicator, teal accent)
- **Sidebar UX:** Made user profile section sticky at bottom of admin sidebar
- **Bug fix:** Fixed `doc.sponsor` → `doc.isSponsor` field name in Airtable sync

### Pending items
- Pittsburgh venue pivot: Airtable content updates pending (see table below)
- Firebase Storage rules for profile photos: config ready, needs deploy
- Organization logos: Need to re-upload in admin CMS (Airtable URLs expired)

### 🚀 NEXT MAJOR FEATURE: Attendee engagement & networking system

**Goal:** Build interaction features for registered attendees (confirmed tickets) to connect before, during, and after the summit.

**Timeline:** Pre-summit (weeks before) → During summit → Post-summit (1 month after)

**Core interaction types to design/build:**
1. **Finding collaborators** - Match attendees by interests, skills, project needs
2. **Session engagement** - Share interest, feedback, thoughts on sessions
3. **Jobs/hiring board** - Jobs, contracts, gigs, "looking for work" posts
4. **Showcase/hype** - Highlight colleagues, projects, favorite orgs
5. **Community engagement** - General networking, async discussions

**Real-time vs async:**
- Real-time: Live chat during sessions, "who's here now" presence
- Async: Discussion threads, posts, reactions, bookmarks

**Data/analytics requirements (for CCM):**
- Track all interactions as data points
- Identify trends in real-time (popular topics, pain points)
- Spot and fix issues during summit
- Generate comprehensive sponsor report post-summit
- Inform improvements for CJS2027

**Access control:**
- Only registered attendees with confirmed tickets
- Moderation tools for admins
- Content persists for ~1 month post-summit

**Technical considerations:**
- Firestore real-time listeners for live features
- Structured data for analytics/reporting
- Export capabilities for sponsor reports
- Privacy controls for attendees

**Questions to answer:**
- What's the MVP for pre-summit launch?
- Which interactions are highest priority?
- How does this integrate with existing profile/schedule features?
- What moderation tools are needed?
- What does the sponsor report look like?

### Known issues
- None currently blocking

---

## Quick facts

- **Event:** 2026 Collaborative Journalism Summit (10th anniversary), June 8-9, Pittsburgh, PA
- **Stack:** Vite + React 18, Tailwind CSS, Framer Motion, Firebase (Hosting, Auth, Firestore, Functions, Storage)
- **CMS:** Airtable (headless) → static JS files at build time
- **Live:** https://summit.collaborativejournalism.org and https://cjs2026.web.app
- **Repo:** https://github.com/jamditis/cjs2026

## Style rules

- **CJS2026 is one word** - Always write "CJS2026" without a space.
- **Colors:** Teal (#2A9D8F) primary, Cream (#F5F0E6), Ink (#2C3E50)
- **Fonts:** Playfair Display (headings), Source Sans 3 (body), Caveat (accents)
- **Design:** "Sketch & Parchment" aesthetic - use `bg-paper`, `bg-parchment` classes
- **Never fabricate quotes.** Do not write quotes and attribute them to real people unless you can link to an actual source. Use `[ASK FOR QUOTE]` placeholders instead.

---

## 🚨 CRITICAL: Airtable CMS protocol

**Before any content change:**
1. Check if text uses `getContent()` → if yes, update Airtable
2. Add pending Airtable changes to table below
3. Confirm with user before impacting CMS workflow

**CMS-controlled:** Hero text, timeline, stats, info cards, footer, sponsors, schedule
**NOT CMS-controlled:** React components, styling, auth system, component logic

### Pending Airtable updates (Pittsburgh pivot)

| Field | Section | Required value | Status |
|-------|---------|----------------|--------|
| `location` | hero | "Pittsburgh, Pennsylvania" | ⏳ PENDING |
| `venue_location` | details | "Pittsburgh, Pennsylvania" | ⏳ PENDING |
| `venue_name` | details | *TBD - new venue* | ⏳ PENDING |
| `2026_location` | timeline | "Pittsburgh, PA" | ⏳ PENDING |
| `signup_headline` | footer | "Join us in Pittsburgh" | ⏳ PENDING |

---

## Development

```bash
npm run dev                    # Dev server
npm run build                  # Production build
npm run deploy                 # Build + deploy to Firebase

# Content generation (pulls from Airtable)
npm run generate-content       # Site content (from 5 tables)
npm run generate-schedule      # Schedule sessions
npm run generate-organizations # Sponsors
npm run generate-updates       # News/updates
npm run generate-all           # All four

# Firebase
firebase deploy --only functions    # Cloud Functions
firebase deploy --only firestore:rules
```

---

## Key files

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.jsx` | Auth state, user profiles, schedule saving |
| `src/pages/Home.jsx` | Homepage with dynamic CMS content |
| `src/pages/Dashboard.jsx` | User dashboard with profile wizard |
| `src/pages/Admin.jsx` | Admin panel (6 tabs: Overview, Edit Content, Broadcast, Updates, Attendees, Sessions) |
| `src/pages/Schedule.jsx` | Schedule with personal bookmarking |
| `src/components/SessionCard.jsx` | Session display with save button |
| `functions/index.js` | Cloud Functions (27 functions) |
| `firestore.rules` | Firestore security rules (15 collections) |
| `CJS_WEB_STYLE_GUIDE.md` | Design system reference |

### Auto-generated (DO NOT EDIT)

| File | Source Airtable tables |
|------|------------------------|
| `src/content/siteContent.js` | Site Content, Summit History, Stats, Event Details, What To Expect |
| `src/content/scheduleData.js` | Schedule |
| `src/content/organizationsData.js` | Organizations (filtered by Sponsor checkbox) |
| `src/content/updatesData.js` | Updates table |

---

## Airtable base (appL8Sn87xUotm4jF)

**27 tables total.** Web-facing tables:

### Site Content
Fields: Field, Name, Content, Section, Page, Component, Color, Order, Visible, Link

```javascript
import { getContent, getContentMeta, getColorClass, timeline, stats } from '../content/siteContent'
getContent('details', 'headline', 'Default text')
getContentMeta('details', 'year')?.color
getColorClass('cardinal', 'text') // → 'text-brand-cardinal'
```

### Schedule
Fields: Session title, Public?, Description, Start time, Room location, Day, Speakers, Location, Type, Bookmarks, Length, Recorded session, Speaker(s), Organization (from Speakers)

### Organizations (Sponsors)
Check "Sponsor" checkbox + set "Sponsor tier"
Fields: Name, About this org, Website, Logo, Sponsor, Sponsor tier, Speaker(s), Eventbrite emails, Ad Attachment, Notes

### Summit History
Fields: Year, Event Details, Description, Archive Website, Location, Key Stats, Event Image

### Stats
Fields: Name, Stat Value, Stat Type, Year, Summit History

### Attendees (synced from Firestore)
Fields: uid, Email, Name, Organization, Role, Photo URL, Website, Instagram, LinkedIn, Bluesky, Badges, Attended Summits, Custom Badges, Registration Status, Notify When Tickets Available, Created At, Updated At

### Updates (News/Announcements)
Fields: Title, Slug, Summary, Content, Date, Category, Type, Color, Featured, Countdown, CTA Text, CTA URL, CTA External, Visible, Order

### Email signups
Fields: Email, Source, Signed up

### Other tables (internal planning)
Task tracker, Sponsorships, Budget, Locations, Session pitches, Schedule brainstorm, Speakers, Designs, Presentations, Lobby tables, Program Ads, Eventbrite emails, Sponsor targets, Post-event CJS, Lessons learned, Website Navigation, Event Details, Sponsorship Tiers, Custom Sponsorships, What To Expect

---

## Auth system

- **Magic links + Google OAuth** (popup-based, more reliable across browsers)
- User profiles in Firestore `users/{uid}` with 20+ fields
- Registration statuses: `pending` → `registered`/`approved` → `confirmed`
- Admin access: Via Firestore `role` field (`admin` or `super_admin`) + bootstrap emails

### Bootstrap admin emails
- `jamditis@gmail.com` (super admin)
- `murrayst@montclair.edu`
- `etiennec@montclair.edu`

---

## Firestore collections

| Collection | Purpose |
|------------|---------|
| `users/{uid}` | User profiles (see `docs/USER_PROFILE_SCHEMA.md`) |
| `sessionBookmarks/{sessionId}` | Bookmark counts per session |
| `system_errors/{id}` | Error tracking |
| `activity_logs/{id}` | User activity logging |
| `admin_logs/{id}` | Admin action audit |
| `email_signups/{id}` | Newsletter signups |
| `announcements/{id}` | Site-wide banners |
| `admin_settings/{id}` | Admin config |
| `background_jobs/{id}` | Job queue |
| `edit_requests/{id}` | Content edit requests |
| `updates/{id}` | News/announcements |
| `cmsVersionHistory/{id}` | Content version history |
| `cmsPublishQueue/{id}` | Publishing queue |
| `eventbrite_synced/{id}` | Matched Eventbrite tickets |
| `eventbrite_unmatched/{id}` | Unmatched tickets |

---

## Cloud Functions (27 total)

**Core:**
- `saveEmailSignup` - Save newsletter signups
- `health` - Health check endpoint
- `syncProfileToAirtable` - Sync single user to Airtable
- `exportAttendees` - Export attendees JSON
- `cmsUploadImage` - Upload images to Storage

**Admin:**
- `grantAdminRole`, `revokeAdminRole`, `getAdminUsers`
- `getSystemStats` - Dashboard metrics

**CMS:**
- `cmsCreateContent`, `cmsUpdateContent`, `cmsDeleteContent`
- `cmsGetVersionHistory`, `cmsPublish`, `cmsGetPublishQueue`, `cmsUpdatePublishStatus`
- `triggerCMSSync`, `getSiteContent`
- `syncCMSToAirtable` - Push CMS changes back to Airtable (manual sync)

**Eventbrite:**
- `eventbriteWebhook`, `syncEventbriteAttendees`
- `checkEventbriteTicket`, `getEventbriteSyncStatus`

**Other:**
- `syncAllProfilesToAirtable`, `syncBookmarkCountToAirtable`
- `saveEditRequest`, `getEditRequests`

**For error tracking:** Use `firebase functions:log --project cjs2026` instead of admin UI

---

## Features summary

**Public:** Homepage, schedule, sponsors, updates, timeline
**Authenticated:** Dashboard, profile wizard, personal schedule, bookmark sessions
**Admin:** Attendee management (edit/delete), sessions analytics, error tracking, CSV export, Airtable sync

---

## Quick reference

### Adding sponsors
1. Airtable → Organizations → Add row with Logo
2. Check "Sponsor" checkbox, set tier
3. Deploy (auto-generates organizationsData.js)

### Adding admins
1. User signs in
2. Admin Panel → Attendees → Edit user
3. Set "System role" to `admin` or `super_admin`

### Troubleshooting
- **Google sign-in fails:** Uses popup; should work on all browsers
- **Magic link blank page:** Link used/expired; request new one
- **Permission denied:** Deploy Firestore rules; check user role
