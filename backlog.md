# CJS 2026 website backlog

Future changes, features, and requests for the CJS 2026 website.

---

## High priority

### Content/CMS
- [ ] Add remaining pages to Airtable CMS (Schedule, Sponsors, Contact, Code of Conduct)
- [ ] Update Schedule.jsx, Sponsors.jsx, Contact.jsx, CodeOfConduct.jsx to use `getContent()` helpers
- [ ] Add "What to expect" section content to Airtable (monday_items, tuesday_items as newline-separated lists)

### Functionality
- [ ] Enable Google OAuth in Firebase Console (Authentication > Sign-in method > Google)
- [ ] Test user registration flow end-to-end
- [ ] Add registration form for attendees (once registration opens)

---

## Medium priority

### Design/UI
- [ ] Consider bringing back connected particles animation (`ParticlesBackground.connected.jsx`)
- [ ] Add dark mode toggle (content already supports color field)
- [ ] Improve mobile navigation (hamburger menu)
- [ ] Add loading states for dynamic content

### Content
- [ ] Add speaker/session data structure to Airtable
- [ ] Create speaker cards component
- [ ] Add sponsor logo display with tiers

### Infrastructure
- [ ] Set up staging environment (Firebase preview channels)
- [ ] Add Airtable automation to auto-trigger deploy on any record change (not just button click)
- [ ] Consider adding content preview before deploy

---

## Low priority / nice to have

### Features
- [ ] Add search functionality for sessions/speakers
- [ ] Add calendar export (ICS) for sessions
- [ ] Add social sharing buttons for sessions
- [ ] Implement session favorites/bookmarking (requires auth)

### Analytics
- [ ] Set up Firebase Analytics events for key actions
- [ ] Add conversion tracking for email signups
- [ ] Track page views and scroll depth

### Accessibility
- [ ] Audit and improve keyboard navigation
- [ ] Add skip links
- [ ] Verify color contrast ratios
- [ ] Add ARIA labels where needed

### Performance
- [ ] Optimize images (WebP, lazy loading)
- [ ] Add service worker for offline support
- [ ] Implement code splitting for routes

---

## Completed

### 2025-12-09
- [x] Set up Airtable CMS with Site Content table (215 records)
- [x] Create static content generator script (`scripts/generate-content.cjs`)
- [x] Implement GitHub Actions deploy workflow
- [x] Add "Update website" button in Airtable to trigger deploys
- [x] Update Home.jsx to use dynamic content from Airtable
- [x] Move API keys to environment variables / GitHub secrets
- [x] Save connected particles animation for later use

---

## Notes

- All content changes should go through Airtable, not by editing code directly
- The `siteContent.js` file is auto-generated - do not edit manually
- To add new editable content: add record to Airtable, run generate-content, update component to use `getContent()`
