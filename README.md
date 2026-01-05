# 2026 Collaborative Journalism Summit

**June 8–9, 2026 • Pittsburgh, PA**

The 10th anniversary edition of the Collaborative Journalism Summit.

🌐 **Live site**: [summit.collaborativejournalism.org](https://summit.collaborativejournalism.org)

---

## About the summit

The Collaborative Journalism Summit is the premier annual gathering for journalists exploring how to work together in the public interest. Since 2017, we've brought together practitioners, funders, and innovators to share knowledge, build connections, and advance the field.

CJS2026 marks a milestone: **10 years** of collaborative journalism.

### Event details

- **When**: Monday, June 8 – Tuesday, June 9, 2026
- **Where**: Pittsburgh, Pennsylvania
- **Co-located with**: [INN Days](https://inn.org) (June 9–11)

### Format

**Monday (Main summit)**
- 8 curated sessions with invited speakers
- 8 lightning talks from community pitches
- Structured networking throughout
- Evening dinner and celebration

**Tuesday (Workshops)**
- Track 1: Collaborating 101 — introduction to the field
- Track 2: Advanced collaboration — invite-only intensive

---

## 10 years of working together

| Stat | Value |
|------|-------|
| Summits held | 10 |
| Cities visited | 6 (Pittsburgh will be #7!) |
| Total registrations | 2,569 |
| Unique attendees | 1,981 |
| Mission | Working together in the public interest |

### Past locations

| Year | Location | Notes |
|------|----------|-------|
| 2017 | Montclair, NJ | Inaugural summit 🎓 |
| 2018 | Montclair, NJ | |
| 2019 | Philadelphia, PA | |
| 2020 | Virtual | Pandemic year 🏠 |
| 2021 | Virtual | Pandemic year 💻 |
| 2022 | Chicago, IL | |
| 2023 | Washington, D.C. | |
| 2024 | Detroit, MI | |
| 2025 | Denver, CO | |
| 2026 | Pittsburgh, PA | **10th anniversary** ← You are here |

---

## Registration

Registration opens soon. [Sign up for updates](https://summit.collaborativejournalism.org).

**Scholarship tickets** are available to ensure cost is not a barrier to participation. Email summit@collaborativejournalism.org to request one.

---

## Contact

- **General inquiries**: summit@collaborativejournalism.org
- **Sponsorship**: murrayst@montclair.edu
- **Twitter**: [@CenterCoopMedia](https://twitter.com/CenterCoopMedia)

---

## Hosted by

- [Center for Cooperative Media](https://centerforcooperativemedia.org) at Montclair State University
- [Institute for Nonprofit News](https://inn.org)

---

## Development

This is the official website for CJS2026.

### Tech stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Firebase Hosting | Static hosting |
| Firebase Auth | User authentication (magic links + Google OAuth) |
| Firebase Firestore | User profiles, CMS content, and data |
| Firebase Cloud Functions | Secure API endpoints |
| Firebase Storage | Profile photos |
| GitHub Actions | Automated deploys |

### Quick start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Firebase
npm run deploy
```

### Content management

The site uses a custom Firestore-based CMS managed through the admin panel at `/admin`. Content editors can update the website directly from the CMS interface.

**CMS features:**
- Real-time content editing with role-based access
- Undo support for reordering (Ctrl+Z)
- Version history and audit trail
- One-click publish to trigger GitHub Actions deployment

```bash
# Generate static content from Firestore (for builds)
npm run generate-from-firestore

# Legacy Airtable scripts (deprecated)
npm run generate-content       # Site content
npm run generate-schedule      # Schedule sessions
npm run generate-organizations # Sponsors

# Deploy
npm run deploy
```

### Project structure

```
cjs2026/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # Auth context
│   ├── content/        # Auto-generated content (DO NOT EDIT)
│   ├── pages/          # Page components
│   └── utils/          # Utility functions
├── functions/          # Firebase Cloud Functions
├── scripts/            # Content generators and utilities
├── public/             # Static assets
├── branding/           # Design source files
├── planning/           # Meeting notes and context
├── docs/               # Project documentation
└── history/            # Archives of past summits
```

### Key features

- **Attendee dashboard** - Profile wizard, badge system, personal schedule builder
- **Admin panel** - User management, system monitoring, announcement banners, CMS editor
- **Cross-browser auth** - Works on all browsers with popup/redirect fallback
- **Custom CMS** - Firestore-based content management with role-based access
- **PDF export** - Download personal schedule as PDF
- **Schedule sharing** - Share your schedule with visibility controls (private/attendees/public)

---

## Environment variables

Copy `.env.example` to `.env` and fill in values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Legacy (deprecated - CMS now uses Firestore)
# AIRTABLE_API_KEY=
```

---

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Development reference for Claude Code
- **[docs/CMS_EDITOR_GUIDE.md](./docs/CMS_EDITOR_GUIDE.md)** - CMS editor instructions
- **[docs/USER_PROFILE_SCHEMA.md](./docs/USER_PROFILE_SCHEMA.md)** - User data schema
- **[docs/CHANGELOG.md](./docs/CHANGELOG.md)** - Development history
- **[CJS_WEB_STYLE_GUIDE.md](./CJS_WEB_STYLE_GUIDE.md)** - Design system reference
- **[GEMINI.md](./GEMINI.md)** - Notes for Gemini (frontend polish)

---

*A decade of bringing journalists together to work in the public interest.*
