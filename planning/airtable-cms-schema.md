# Airtable CMS schema for CJS 2026 website

This document defines the Airtable tables and fields needed to make the CJS 2026 website content fully editable via Airtable.

## How it works

1. Stefanie edits content in Airtable (text, dates, etc.)
2. The website automatically pulls the latest content when pages load
3. Changes appear on the site within minutes (cached for performance)

---

## Table 1: Site content

**Table name:** `Site Content`

This table stores all the text content for the site, organized by section and field name.

| Field name | Field type | Description | Example value |
|------------|------------|-------------|---------------|
| Section | Single select | Which part of the site | `hero`, `details`, `history`, `footer` |
| Field | Single line text | Identifier for this content | `headline`, `tagline`, `description` |
| Content | Long text | The actual text content | "Collaborative Journalism Summit" |
| Notes | Long text | Internal notes (not displayed) | "Updated per Stef's request 12/9" |
| Last updated | Last modified time | Auto-tracked | (automatic) |

**Rows to create:**

| Section | Field | Content |
|---------|-------|---------|
| hero | year | 2026 |
| hero | headline | Collaborative Journalism Summit |
| hero | tagline | Prepare to partner. |
| hero | date_display | June 8–9, 2026 |
| hero | location | Pittsburgh, Pennsylvania |
| hero | badge_text | 10th anniversary edition |
| hero | registration_note | Registration opens soon |
| details | section_headline | Save the date |
| details | section_description | The premier gathering for journalists exploring how to work together in the public interest. |
| details | when_day1 | Monday, June 8 |
| details | when_day1_note | Full day of sessions + dinner |
| details | when_day2 | Tuesday, June 9 |
| details | when_day2_note | Morning workshops |
| details | venue_name | Pittsburgh venue TBA |
| details | venue_location | Pittsburgh, Pennsylvania |
| details | venue_note | Co-located with INN Days |
| details | attendees | 130–150 attendees |
| details | attendees_note | Journalists, media leaders, funders, and academics |
| history | section_headline | 10 years of working together |
| history | section_description | Since 2017, the Collaborative Journalism Summit has brought together practitioners, funders, and innovators. This year, we celebrate a decade of proving that journalism is stronger when we collaborate. |
| history | stat_summits | 10 |
| history | stat_cities | 8 |
| history | stat_attendees | 1500+ |
| footer | signup_headline | Stay connected |
| footer | signup_description | Get updates on programming, registration, and more. |
| footer | contact_email | summit@collaborativejournalism.org |
| schedule | page_headline | Schedule |
| schedule | page_description | Two days of sessions, workshops, and networking. Programming details will be announced in spring 2026. |
| schedule | preliminary_notice | Session topics and speakers will be announced in spring 2026. Sign up for updates to be the first to know. |
| schedule | inn_days_title | Co-located with INN Days |
| schedule | inn_days_description | INN Days runs June 9–11 at the same venue. Attend both events in one trip. |
| sponsors | page_headline | Sponsors |
| sponsors | page_description | Support the 10th anniversary Collaborative Journalism Summit and connect with 130+ leaders in collaborative journalism. |
| sponsors | open_notice | Sponsorships now open |
| sponsors | open_description | Be among the first to support the 10th anniversary summit. Sponsors will be recognized here as they are confirmed. |
| sponsors | cta_headline | Ready to sponsor? |
| sponsors | cta_description | Contact us to discuss sponsorship opportunities and receive a full prospectus. |

---

## Table 2: Event details

**Table name:** `Event Details`

Core event information that appears in multiple places.

| Field name | Field type | Description | Example value |
|------------|------------|-------------|---------------|
| Field | Single line text | Which detail | `summit_date`, `venue_name` |
| Value | Single line text | The value | "2026-06-08" |
| Display value | Single line text | Human-readable | "June 8–9, 2026" |
| Notes | Long text | Internal notes | |

**Rows to create:**

| Field | Value | Display value |
|-------|-------|---------------|
| summit_start_date | 2026-06-08 | June 8, 2026 |
| summit_end_date | 2026-06-09 | June 9, 2026 |
| summit_date_range | 2026-06-08/2026-06-09 | June 8–9, 2026 |
| venue_name | Pittsburgh venue TBA | Pittsburgh venue TBA |
| venue_city | Pittsburgh | Pittsburgh |
| venue_state | PA | Pennsylvania |
| venue_full | Pittsburgh, PA | Pittsburgh, Pennsylvania |
| expected_attendees | 150 | 130–150 attendees |
| registration_status | coming_soon | Registration opens soon |

---

## Table 3: Schedule items

**Table name:** `Schedule`

Each row is one item on the schedule.

| Field name | Field type | Description | Example value |
|------------|------------|-------------|---------------|
| Day | Single select | Which day | `Monday`, `Tuesday` |
| Time | Single line text | Start time | "9:00 AM" |
| Title | Single line text | Session title | "Welcome & opening remarks" |
| Description | Long text | Session description | "Setting the stage for..." |
| Type | Single select | Item type | `session`, `break`, `workshop`, `special` |
| Speaker(s) | Single line text | Speaker names | "Jane Smith, John Doe" |
| Order | Number | Sort order | 1, 2, 3... |
| Visible | Checkbox | Show on site? | ✓ |

**Example rows:**

| Day | Time | Title | Type | Order |
|-----|------|-------|------|-------|
| Monday | 8:00 AM | Registration & breakfast | break | 1 |
| Monday | 9:00 AM | Welcome & opening remarks | session | 2 |
| Monday | 9:30 AM | Keynote: A decade of collaboration | session | 3 |
| Tuesday | 9:00 AM | Workshop Track 1: Collaborating 101 | workshop | 1 |

---

## Table 4: Summit history

**Table name:** `Summit History`

Timeline of past summits (for the history section).

| Field name | Field type | Description | Example value |
|------------|------------|-------------|---------------|
| Year | Single line text | Summit year | "2017" |
| Location | Single line text | City, State | "Montclair, NJ" |
| Theme | Single line text | Summit theme | "The Beginning" |
| Link | URL | Link to archive | https://collaborativejournalism.org/cjs2019/ |
| Order | Number | Display order | 1, 2, 3... |
| Visible | Checkbox | Show on site? | ✓ |

---

## Table 5: Sponsorship tiers

**Table name:** `Sponsorship Tiers`

Sponsorship packages and pricing.

| Field name | Field type | Description | Example value |
|------------|------------|-------------|---------------|
| Name | Single line text | Tier name | "Presenting sponsor" |
| Price | Single line text | Display price | "$15,000" |
| Price (number) | Currency | Actual price | 15000 |
| Benefits | Long text | Benefits list (one per line) | "Logo on all materials\nSpeaking opportunity\n..." |
| Available | Single line text | Spots available | "1" or "Unlimited" |
| Color | Single select | Display color | `cardinal`, `teal`, `green`, `ink` |
| Order | Number | Display order | 1, 2, 3, 4 |
| Visible | Checkbox | Show on site? | ✓ |

---

## Table 6: Sponsors

**Table name:** `Sponsors`

Current confirmed sponsors.

| Field name | Field type | Description | Example value |
|------------|------------|-------------|---------------|
| Name | Single line text | Organization name | "Knight Foundation" |
| Tier | Link to Sponsorship Tiers | Sponsorship level | (linked record) |
| Logo | Attachment | Logo image | (uploaded file) |
| Website | URL | Sponsor website | https://knightfoundation.org |
| Visible | Checkbox | Show on site? | ✓ |

---

## Table 7: Custom sponsorships

**Table name:** `Custom Sponsorships`

Special sponsorship opportunities.

| Field name | Field type | Description | Example value |
|------------|------------|-------------|---------------|
| Name | Single line text | Sponsorship name | "Reception sponsor" |
| Description | Single line text | Short description | "Monday networking event" |
| Order | Number | Display order | 1, 2, 3 |
| Visible | Checkbox | Show on site? | ✓ |

---

## Table 8: "What to expect" items

**Table name:** `What To Expect`

Items shown in the "What to expect" section on the homepage.

| Field name | Field type | Description | Example value |
|------------|------------|-------------|---------------|
| Day | Single select | Which day | `Monday`, `Tuesday` |
| Day label | Single line text | Display label | "Monday: Main summit" |
| Items | Long text | Bullet points (one per line) | "8 curated sessions\n8 lightning talks\n..." |
| Order | Number | Display order | 1, 2 |

---

## Table 9: Stats

**Table name:** `Stats`

Statistics displayed on the site (history section).

| Field name | Field type | Description | Example value |
|------------|------------|-------------|---------------|
| Label | Single line text | Stat label | "Summits" |
| Value | Number | Numeric value | 10 |
| Suffix | Single line text | Text after number | "+" |
| Order | Number | Display order | 1, 2, 3, 4 |

---

## Setup instructions

1. **Create the tables** in the "2026 CJS" Airtable base
2. **Add the fields** as specified above
3. **Populate with initial data** using the example values
4. **Share the base** with Joe so he can connect the API

Once the tables are set up, Joe will:
1. Create a Cloud Function to fetch data from Airtable
2. Update the React components to pull content from the API
3. Test that changes in Airtable appear on the site

---

## Editing tips for Stefanie

- **Text changes:** Just edit the "Content" field and save. Changes appear within minutes.
- **Schedule changes:** Edit existing rows or add new ones. Set "Visible" checkbox to show/hide items.
- **Sponsor logos:** Upload logo images directly to the Attachments field.
- **Order:** Use the "Order" field to control display sequence (lower numbers appear first).
- **Hide items:** Uncheck "Visible" to temporarily hide something without deleting it.
- **Notes:** Use the "Notes" field to leave comments for Joe or future reference (not shown on site).
