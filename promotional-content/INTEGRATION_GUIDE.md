# Promotional Content Integration Guide

How to connect the promotional content to the CJS2026 website and external platforms.

---

## Website pages and routes

### Existing pages ready for use

| Page | Route | Use in promotional content |
|------|-------|---------------------------|
| **Home** | `/` | Main landing page, countdown, email signup |
| **Schedule** | `/schedule` | Session listings, personal schedule builder |
| **Sponsors** | `/sponsors` | Sponsor logos and information |
| **Contact** | `/contact` | Venue info, email, social links |
| **Login** | `/login` | User authentication |
| **Dashboard** | `/dashboard` | Registered attendee hub |
| **My Schedule** | `/my-schedule` | Personal schedule (logged-in users) |
| **Code of Conduct** | `/code-of-conduct` | Community guidelines |
| **Privacy** | `/privacy` | Privacy policy |

### Website URLs for promotional content

Use these URLs in place of placeholders:

```
Homepage:     https://summit.collaborativejournalism.org/
              (or https://cjs2026.web.app/)

Schedule:     https://summit.collaborativejournalism.org/schedule
Sponsors:     https://summit.collaborativejournalism.org/sponsors
Contact:      https://summit.collaborativejournalism.org/contact
Login:        https://summit.collaborativejournalism.org/login
Dashboard:    https://summit.collaborativejournalism.org/dashboard
```

---

## External resources to set up

These promotional content placeholders link to external platforms:

### 1. Session pitch form `[PITCH_FORM_LINK]`

**Recommended:** Create an Airtable form or Google Form for session pitches.

**Fields to include:**
- Presenter name(s)
- Organization(s)
- Session title
- Session format (panel, workshop, lightning talk, etc.)
- Session description (300 words max)
- Learning outcomes
- Target audience (newcomers, practitioners, all)
- Email address
- Any technology/equipment needs

**When ready:** Replace `[PITCH_FORM_LINK]` in all promotional content files.

### 2. Registration/tickets `[REGISTRATION_LINK]`

**Recommended:** Use Eventbrite (consistent with past summits).

**Ticket types to configure:**
- Early bird (first 50 registrants)
- Standard registration
- Student/freelancer rate (if applicable)
- Scholarship/complimentary

**When ready:** Replace `[REGISTRATION_LINK]` in all promotional content files.

### 3. Logistics page `[LOGISTICS_LINK]`

**Options:**
- Create a dedicated `/logistics` or `/travel` page on the website
- Add a "Getting here" section to the existing Contact page
- Create a standalone Notion/Google Doc page

**Content to include:**
- Airport information (RDU - Raleigh-Durham International)
- Ground transportation options
- Hotel blocks with booking codes
- Parking at UNC Friday Center
- Local dining recommendations
- Accessibility information
- What to pack

### 4. Hotel booking `[HOTEL_NAME_1]`, `[BOOKING_LINK]`

**Action:** Negotiate hotel block rates with Chapel Hill area hotels.

**Suggested hotels near UNC Friday Center:**
- The Siena Hotel
- Hampton Inn Chapel Hill
- Sheraton Chapel Hill Hotel
- AC Hotel by Marriott Chapel Hill Downtown

**When secured:** Update promotional content with hotel names and booking links/codes.

### 5. Slack workspace `[SLACK_LINK]`

**Recommended:** Set up a dedicated CJS2026 Slack workspace or channel.

**Options:**
- New workspace: cjs2026.slack.com
- Channel in existing Collaborative Journalism Network Slack

**When ready:** Replace `[SLACK_LINK]` with the invite link.

---

## Placeholder replacement checklist

Before publishing each piece of promotional content:

**Essential (replace before any publication):**
- [ ] `[PITCH_FORM_LINK]` → Airtable/Google Form URL
- [ ] `[REGISTRATION_LINK]` → Eventbrite URL
- [ ] `[SCHEDULE_LINK]` → `https://summit.collaborativejournalism.org/schedule`

**For logistics content (email #6, late-campaign social):**
- [ ] `[LOGISTICS_LINK]` → Travel/logistics page URL
- [ ] `[HOTEL_NAME_1]` → Hotel name
- [ ] `[BOOKING_LINK]` → Hotel booking URL or code
- [ ] `[PARKING_INFO]` → UNC Friday Center parking details

**For speaker announcements (April onwards):**
- [ ] `[KEYNOTE_SPEAKER]` → Actual speaker name
- [ ] `[SESSION_TITLE]` → Actual session title
- [ ] `[SPEAKER_NAME]` → Featured speaker names
- [ ] `[SPEAKER_ORG]` → Speaker organization

**For pricing content:**
- [ ] `[EARLY_BIRD_PRICE]` → Early bird ticket price
- [ ] `[STANDARD_PRICE]` → Standard ticket price
- [ ] `[EARLY_BIRD_DEADLINE]` → Cutoff date for early bird

---

## Airtable CMS integration

The website uses Airtable as a headless CMS. Content in these tables syncs to the site:

| Airtable Table | What it controls | Script |
|----------------|-----------------|--------|
| Site Content | Homepage text, stats, timeline | `npm run generate-content` |
| Schedule | Session data | `npm run generate-schedule` |
| Organizations | Sponsors | `npm run generate-organizations` |

**To update website content from Airtable:**
```bash
npm run generate-all    # Pull all content
npm run build           # Build site
npm run deploy          # Deploy to Firebase
```

Or trigger the GitHub Actions workflow via the "Update website" button in Airtable.

---

## Campaign tracking

### UTM parameters

Add UTM tracking to links in emails and social posts:

```
?utm_source=mailchimp&utm_medium=email&utm_campaign=cjs2026_kickoff
?utm_source=twitter&utm_medium=social&utm_campaign=cjs2026_registration
?utm_source=linkedin&utm_medium=social&utm_campaign=cjs2026_speakers
```

### Suggested campaign names:
- `cjs2026_kickoff` - January launch
- `cjs2026_pitches` - Session pitch deadline
- `cjs2026_registration` - Registration open
- `cjs2026_earlybird` - Early bird push
- `cjs2026_speakers` - Speaker announcements
- `cjs2026_logistics` - Travel/hotel info
- `cjs2026_countdown` - Final countdown

---

## Email signup flow

The website has an email signup component that saves to Airtable via Cloud Function:

1. User enters email on homepage or footer
2. Saved to Airtable "Email signups" table
3. Use Airtable → Mailchimp sync to add to mailing list

**Mailchimp list setup:**
- Create CJS2026 list/audience
- Set up Airtable automation to sync new signups
- Configure welcome email sequence

---

## Social media accounts

| Platform | Handle | Notes |
|----------|--------|-------|
| Twitter/X | @CenterCoopMedia | Primary account |
| Bluesky | @centercoopmedia.bsky.social | Growing audience |
| LinkedIn | Center for Cooperative Media | Company page |
| Instagram | TBD | Create or use existing |

---

## Content calendar tools

Recommended scheduling tools for executing the release calendar:

- **Mailchimp**: Schedule emails directly
- **Buffer/Hootsuite**: Schedule social posts across platforms
- **Later**: Instagram scheduling with visual planning
- **Typefully**: Twitter/X thread scheduling
- **Medium**: Schedule publication times

---

## Next steps

1. **Set up external resources** (pitch form, Eventbrite, hotels)
2. **Replace placeholders** in promotional content files
3. **Configure Mailchimp** list and automation
4. **Schedule first wave** of content (January kickoff)
5. **Monitor and adjust** based on engagement
