# CLAUDE.md

Guidance for Claude Code when working with this repository.

**Current context:** January 2026. Building CJS2026 website (June 8-9, 2026, Pittsburgh, PA).

## Quick reference

| Item | Value |
|------|-------|
| Stack | React 18, Vite, Tailwind, Firebase |
| Production | https://summit.collaborativejournalism.org |
| GitHub | https://github.com/jamditis/cjs2026 |
| Entry point | `src/main.jsx` → `src/App.jsx` |

**Style rule:** Always write "CJS2026" (one word, no space).

---

## Custom CMS (Firestore-based)

Content is managed through the admin panel at `/admin` → CMS tab. **Airtable is deprecated.**

### Content flow

```
Admin Panel → Firestore → GitHub Actions → Static JS → Firebase Hosting
```

### CMS collections

| Collection | Admin tab | What it controls |
|------------|-----------|------------------|
| `cmsContent` | Site content | Headlines, stats, info cards, footer |
| `cmsSchedule` | Schedule | Session data |
| `cmsOrganizations` | Organizations | Sponsors & partners |
| `cmsTimeline` | Timeline | Summit history (2017-2026) |

### Role-based access

| Role | Can edit | Can access |
|------|----------|------------|
| `admin` | Content text, colors, links | Public-facing fields only |
| `super_admin` | All fields | Metadata (section, order, visibility, field IDs) |

### Content helpers

```javascript
import { getContent, getContentMeta, timeline, stats } from '../content/siteContent'

getContent('hero', 'headline', 'Fallback')  // Get text with fallback
getContentMeta('hero', 'headline')?.color   // Get metadata
```

**Auto-generated files (DO NOT EDIT):**
- `src/content/siteContent.js`
- `src/content/scheduleData.js`
- `src/content/organizationsData.js`

---

## Key files

| File | Purpose |
|------|---------|
| `src/pages/Admin.jsx` | Admin command center |
| `src/components/CMSManager.jsx` | CMS editing interface (with undo support) |
| `src/contexts/AuthContext.jsx` | Auth + user profiles |
| `src/contexts/ToastContext.jsx` | Toast notifications |
| `src/contexts/ContentContext.jsx` | CMS content provider |
| `src/pages/Home.jsx` | Homepage (uses CMS content) |
| `src/pages/FAQ.jsx` | Frequently asked questions |
| `src/utils/generateSchedulePDF.js` | PDF schedule export |
| `src/utils/validation.js` | Input validation |
| `functions/index.js` | Cloud Functions |
| `firestore.rules` | Security rules |

---

## Commands

```bash
npm run dev      # Dev server
npm run build    # Production build
npm run deploy   # Build + deploy to Firebase

firebase deploy --only functions        # Functions only
firebase deploy --only firestore:rules  # Rules only
```

---

## Authentication

**Methods:** Magic links + Google OAuth (auto-fallback to redirect)

| Route | Auth | Role |
|-------|------|------|
| `/dashboard` | Required | Any |
| `/admin` | Required | admin/super_admin |
| `/my-schedule` | Required | Any |
| `/schedule/user/:uid` | Depends | Based on visibility setting |
| `/attendee/:uid` | Public | Any |
| `/faq` | Public | Any |

**User statuses:** `pending` → `approved`/`registered` → `confirmed`

---

## Admin access

**Bootstrap admins (hardcoded):** `jamditis@gmail.com`, `murrayst@montclair.edu`, `etiennec@montclair.edu`

**To add admins:** Admin Panel → Attendees → Edit user → Set role

---

## Design

| Element | Value |
|---------|-------|
| Headings | Playfair Display (`font-heading`) |
| Body | Source Sans 3 (`font-body`) |
| Primary color | Teal `#2A9D8F` |
| Style guide | `CJS_WEB_STYLE_GUIDE.md` |

---

## Firestore collections

| Collection | Purpose |
|------------|---------|
| `users/{uid}` | User profiles (see `docs/USER_PROFILE_SCHEMA.md`) |
| `sessionBookmarks/{sessionId}` | Bookmark counts |
| `cmsContent`, `cmsSchedule`, etc. | CMS data |
| `cmsVersionHistory` | Audit trail |

---

## Session bookmarks

Users can save sessions and share schedules. Popularity badges:
- **1-4:** Gray
- **5-9:** Amber (Popular)
- **10+:** Red pulsing (Hot)

---

## Summit history

2017 Montclair (inaugural) → 2018 Montclair → 2019 Philadelphia → 2020-21 Virtual → 2022 Chicago → 2023 DC → 2024 Detroit → 2025 Denver → **2026 Pittsburgh (10th anniversary)**

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sign-in fails | Auto-fallback to redirect should work |
| Magic link blank | Link expired; request new one |
| Permission denied | Check Firestore rules deployed; verify user role |
| Content stale | Publish from admin panel |

---

## Documentation

- `docs/CMS_EDITOR_GUIDE.md` - Editor instructions
- `docs/USER_PROFILE_SCHEMA.md` - User data schema
- `docs/CHANGELOG.md` - Historical updates
