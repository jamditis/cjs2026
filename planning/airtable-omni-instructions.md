# Airtable table creation instructions for Omni

Use these instructions to create the tables needed for the CJS 2026 website CMS. Each section describes one table with its fields, field types, and initial data.

---

## Table 1: Site Content

**Purpose:** Stores all editable text content for the website, organized by section and field name. This is the main table for managing copy across the site.

**Fields to create:**

1. **Section** (Single select)
   - Options: `hero`, `details`, `history`, `footer`, `schedule`, `sponsors`, `contact`, `code_of_conduct`
   - Purpose: Groups content by which part of the website it appears on

2. **Field** (Single line text)
   - Purpose: Unique identifier for this piece of content (e.g., "headline", "tagline", "description")

3. **Content** (Long text)
   - Purpose: The actual text that will appear on the website

4. **Notes** (Long text)
   - Purpose: Internal notes for the team (not displayed on website)

**Initial data to populate:**

| Section | Field | Content |
|---------|-------|---------|
| hero | year | 2026 |
| hero | headline | Collaborative Journalism Summit |
| hero | tagline | Prepare to partner. |
| hero | date_display | June 8–9, 2026 |
| hero | location | Chapel Hill, North Carolina |
| hero | badge_text | 10th anniversary edition |
| hero | registration_note | Registration opens soon |
| details | section_headline | Save the date |
| details | section_description | The premier gathering for journalists exploring how to work together in the public interest. |
| details | when_day1_title | Monday, June 8 |
| details | when_day1_description | Full day of sessions + dinner |
| details | when_day2_title | Tuesday, June 9 |
| details | when_day2_description | Morning workshops |
| details | venue_name | UNC Friday Center |
| details | venue_location | Chapel Hill, North Carolina |
| details | venue_note | Co-located with INN Days |
| details | who_count | 130–150 attendees |
| details | who_description | Journalists, media leaders, funders, and academics |
| history | section_headline | 10 years of working together |
| history | section_description | Since 2017, the Collaborative Journalism Summit has brought together practitioners, funders, and innovators. This year, we celebrate a decade of proving that journalism is stronger when we collaborate. |
| footer | signup_headline | Stay connected |
| footer | signup_description | Get updates on programming, registration, and more. |
| footer | contact_email | summit@collaborativejournalism.org |
| footer | website_url | collaborativejournalism.org |
| footer | twitter_handle | @CenterCoopMedia |
| footer | copyright | © 2026 Center for Cooperative Media at Montclair State University |
| schedule | page_headline | Schedule |
| schedule | page_description | Two days of sessions, workshops, and networking. Programming details will be announced in spring 2026. |
| schedule | preliminary_label | Preliminary schedule |
| schedule | preliminary_notice | Session topics and speakers will be announced in spring 2026. Sign up for updates to be the first to know. |
| schedule | monday_label | Monday, June 8 |
| schedule | monday_subtitle | Main summit day |
| schedule | tuesday_label | Tuesday, June 9 |
| schedule | tuesday_subtitle | Workshop day |
| schedule | inn_days_title | Co-located with INN Days |
| schedule | inn_days_description | INN Days runs June 9–11 at the same venue. Attend both events in one trip. |
| sponsors | page_headline | Sponsors |
| sponsors | page_description | Support the 10th anniversary Collaborative Journalism Summit and connect with 130+ leaders in collaborative journalism. |
| sponsors | open_label | Sponsorships now open |
| sponsors | open_description | Be among the first to support the 10th anniversary summit. Sponsors will be recognized here as they are confirmed. |
| sponsors | why_sponsor_headline | Why sponsor the summit? |
| sponsors | milestone_title | Milestone event |
| sponsors | milestone_description | Be part of our 10th anniversary celebration — a landmark moment in the collaborative journalism movement. |
| sponsors | audience_title | Engaged audience |
| sponsors | audience_description | Connect with journalists, editors, funders, and media leaders actively working on collaborative projects. |
| sponsors | exposure_title | Dual-event exposure |
| sponsors | exposure_description | Co-located with INN Days means additional visibility to the nonprofit news community. |
| sponsors | cta_headline | Ready to sponsor? |
| sponsors | cta_description | Contact us to discuss sponsorship opportunities and receive a full prospectus. |
| sponsors | custom_headline | Custom sponsorship opportunities |
| sponsors | custom_description | Interested in sponsoring a specific element of the summit? We offer custom packages for: |

---

## Table 2: Event Details

**Purpose:** Stores core event information (dates, venue, etc.) that appears in multiple places across the site. Having these in one place ensures consistency.

**Fields to create:**

1. **Name** (Single line text)
   - Purpose: Human-readable name for this detail

2. **Key** (Single line text)
   - Purpose: Unique identifier used by the website code

3. **Value** (Single line text)
   - Purpose: The raw value (for dates, use YYYY-MM-DD format)

4. **Display Value** (Single line text)
   - Purpose: Human-readable version shown on website

5. **Notes** (Long text)
   - Purpose: Internal notes

**Initial data to populate:**

| Name | Key | Value | Display Value |
|------|-----|-------|---------------|
| Summit start date | summit_start_date | 2026-06-08 | Monday, June 8, 2026 |
| Summit end date | summit_end_date | 2026-06-09 | Tuesday, June 9, 2026 |
| Date range | summit_date_range | 2026-06-08/2026-06-09 | June 8–9, 2026 |
| Venue name | venue_name | UNC Friday Center | UNC Friday Center |
| Venue city | venue_city | Chapel Hill | Chapel Hill |
| Venue state | venue_state | NC | North Carolina |
| Full venue | venue_full | UNC Friday Center, Chapel Hill, NC | UNC Friday Center, Chapel Hill, North Carolina |
| Expected attendees | expected_attendees | 150 | 130–150 |
| Registration status | registration_status | coming_soon | Registration opens soon |
| Contact email | contact_email | summit@collaborativejournalism.org | summit@collaborativejournalism.org |

---

## Table 3: Schedule

**Purpose:** Each row represents one item on the summit schedule (sessions, breaks, workshops). The website will display these in order by day and time.

**Fields to create:**

1. **Title** (Single line text)
   - Purpose: Name of the session or event

2. **Day** (Single select)
   - Options: `Monday`, `Tuesday`
   - Purpose: Which day this item occurs

3. **Time** (Single line text)
   - Purpose: Start time displayed on schedule (e.g., "9:00 AM")

4. **Type** (Single select)
   - Options: `session`, `workshop`, `break`, `special`
   - Purpose: Determines styling and icon on the schedule
   - `session` = regular session (teal)
   - `workshop` = workshop track (cardinal/red)
   - `break` = meals, coffee, registration (neutral)
   - `special` = highlighted items like dinner (green)

5. **Description** (Long text)
   - Purpose: Additional details shown below the title

6. **Speaker(s)** (Single line text)
   - Purpose: Names of speakers (if applicable)

7. **Order** (Number)
   - Purpose: Sort order within the day (1, 2, 3...)

8. **Visible** (Checkbox)
   - Purpose: Whether to show this item on the website

**Initial data to populate:**

| Title | Day | Time | Type | Description | Order | Visible |
|-------|-----|------|------|-------------|-------|---------|
| Registration & breakfast | Monday | 8:00 AM | break | | 1 | ✓ |
| Welcome & opening remarks | Monday | 9:00 AM | session | Setting the stage for our 10th anniversary summit | 2 | ✓ |
| Keynote: A decade of collaboration | Monday | 9:30 AM | session | Reflecting on 10 years of collaborative journalism | 3 | ✓ |
| Coffee break | Monday | 10:30 AM | break | | 4 | ✓ |
| Session 1: TBD | Monday | 11:00 AM | session | | 5 | ✓ |
| Lunch | Monday | 12:00 PM | break | | 6 | ✓ |
| Lightning talks (Round 1) | Monday | 1:30 PM | session | 4 community-pitched talks, 10 minutes each | 7 | ✓ |
| Session 2: TBD | Monday | 2:30 PM | session | | 8 | ✓ |
| Coffee break | Monday | 3:30 PM | break | | 9 | ✓ |
| Lightning talks (Round 2) | Monday | 4:00 PM | session | 4 community-pitched talks, 10 minutes each | 10 | ✓ |
| Session 3: TBD | Monday | 5:00 PM | session | | 11 | ✓ |
| Reception & networking | Monday | 6:00 PM | break | | 12 | ✓ |
| 10th anniversary dinner | Monday | 7:00 PM | special | Celebrating a decade of working together | 13 | ✓ |
| Breakfast | Tuesday | 8:00 AM | break | | 1 | ✓ |
| Workshop Track 1: Collaborating 101 | Tuesday | 9:00 AM | workshop | For newcomers to collaborative journalism | 2 | ✓ |
| Workshop Track 2: Advanced collaboration | Tuesday | 9:00 AM | workshop | For experienced collaborators | 3 | ✓ |
| Closing remarks & lunch | Tuesday | 12:00 PM | session | | 4 | ✓ |
| Summit concludes — INN Days begins | Tuesday | 1:00 PM | special | Attendees welcome to stay for INN Days (separate registration) | 5 | ✓ |

---

## Table 4: Summit History

**Purpose:** Timeline of past summits displayed in the "10 years of working together" section. Each row is one year.

**Fields to create:**

1. **Year** (Single line text)
   - Purpose: The year of the summit

2. **Location** (Single line text)
   - Purpose: City and state (e.g., "Montclair, NJ")

3. **Theme** (Single line text)
   - Purpose: The theme or tagline for that year

4. **Link** (URL)
   - Purpose: Link to the archived summit page (leave empty for 2026)

5. **Order** (Number)
   - Purpose: Display order (1 = oldest, 10 = newest)

6. **Visible** (Checkbox)
   - Purpose: Whether to show on the timeline

**Initial data to populate:**

| Year | Location | Theme | Link | Order | Visible |
|------|----------|-------|------|-------|---------|
| 2017 | Montclair, NJ | The Beginning | https://www.montclair.edu/college-of-communication-and-media/2017/06/07/18156_collaborative-journalism-summit-highlights-new-ideas-for-impactful-reporting/ | 1 | ✓ |
| 2018 | Montclair, NJ | Building Bridges | https://collaborativejournalism.org/2018summit/ | 2 | ✓ |
| 2019 | Philadelphia, PA | People Over Projects | https://collaborativejournalism.org/cjs2019/ | 3 | ✓ |
| 2020 | Virtual | Adapting Together | https://collaborativejournalism.org/cjs2020/ | 4 | ✓ |
| 2021 | Virtual | Removing Barriers | https://collaborativejournalism.org/cjs2021/ | 5 | ✓ |
| 2022 | Chicago, IL | Building to Last | https://collaborativejournalism.org/cjs2022/ | 6 | ✓ |
| 2023 | Washington, D.C. | Building Frameworks | https://collaborativejournalism.org/cjs2023/ | 7 | ✓ |
| 2024 | Detroit, MI | Global Impact | https://collaborativejournalism.org/cjs2024/ | 8 | ✓ |
| 2025 | Denver, CO | Partnerships with Purpose | https://collaborativejournalism.org/cjs2025/ | 9 | ✓ |
| 2026 | North Carolina | 10th Anniversary | | 10 | ✓ |

---

## Table 5: Stats

**Purpose:** The statistics displayed in the history section (10 summits, 8 cities, etc.). Each row is one stat.

**Fields to create:**

1. **Label** (Single line text)
   - Purpose: Text shown below the number (e.g., "Summits", "Cities")

2. **Value** (Number)
   - Purpose: The numeric value to display

3. **Suffix** (Single line text)
   - Purpose: Text shown after the number (e.g., "+" for "1500+"). Leave empty if none.

4. **Order** (Number)
   - Purpose: Display order left to right

5. **Visible** (Checkbox)
   - Purpose: Whether to show this stat

**Initial data to populate:**

| Label | Value | Suffix | Order | Visible |
|-------|-------|--------|-------|---------|
| Summits | 10 | | 1 | ✓ |
| Cities | 8 | | 2 | ✓ |
| Attendees | 1500 | + | 3 | ✓ |
| Mission | 1 | | 4 | ✓ |

---

## Table 6: Sponsorship Tiers

**Purpose:** Defines the sponsorship packages, pricing, and benefits. Each row is one tier.

**Fields to create:**

1. **Name** (Single line text)
   - Purpose: Tier name (e.g., "Presenting sponsor")

2. **Price** (Single line text)
   - Purpose: Display price with formatting (e.g., "$15,000")

3. **Price Amount** (Currency)
   - Purpose: Numeric price for sorting

4. **Benefits** (Long text)
   - Purpose: List of benefits, one per line

5. **Spots Available** (Single line text)
   - Purpose: How many available (e.g., "1", "3", "Unlimited")

6. **Color** (Single select)
   - Options: `cardinal`, `teal`, `green`, `ink`
   - Purpose: Accent color for the tier card on the website

7. **Order** (Number)
   - Purpose: Display order (1 = top/most expensive)

8. **Visible** (Checkbox)
   - Purpose: Whether to show this tier

**Initial data to populate:**

| Name | Price | Price Amount | Benefits | Spots Available | Color | Order | Visible |
|------|-------|--------------|----------|-----------------|-------|-------|---------|
| Presenting sponsor | $15,000 | 15000 | Logo on all event materials and website\nSpeaking opportunity during opening session\nPremium booth placement\nFull-page ad in program\n10 complimentary registrations\nSocial media recognition\nFirst right of refusal for 2027 | 1 | cardinal | 1 | ✓ |
| Gold sponsor | $7,500 | 7500 | Logo on event materials and website\nBooth at networking reception\nHalf-page ad in program\n5 complimentary registrations\nSocial media recognition | 3 | teal | 2 | ✓ |
| Silver sponsor | $3,500 | 3500 | Logo on event materials and website\nQuarter-page ad in program\n3 complimentary registrations\nSocial media recognition | 5 | green | 3 | ✓ |
| Community supporter | $1,000 | 1000 | Logo on website\nListing in program\n1 complimentary registration | Unlimited | ink | 4 | ✓ |

---

## Table 7: Sponsors

**Purpose:** Current confirmed sponsors. Each row is one sponsor organization.

**Fields to create:**

1. **Name** (Single line text)
   - Purpose: Organization name

2. **Tier** (Link to another record)
   - Link to: Sponsorship Tiers table
   - Purpose: Which tier this sponsor is at

3. **Logo** (Attachment)
   - Purpose: Upload the sponsor's logo image

4. **Website** (URL)
   - Purpose: Link to sponsor's website

5. **Visible** (Checkbox)
   - Purpose: Whether to show on website (use to prepare sponsors before announcing)

**Initial data:** Leave empty for now. Add sponsors as they are confirmed.

---

## Table 8: Custom Sponsorships

**Purpose:** Special sponsorship opportunities (reception, dinner, etc.) shown at the bottom of the sponsors page.

**Fields to create:**

1. **Name** (Single line text)
   - Purpose: Sponsorship name

2. **Description** (Single line text)
   - Purpose: Short description of what's included

3. **Order** (Number)
   - Purpose: Display order

4. **Visible** (Checkbox)
   - Purpose: Whether to show this option

**Initial data to populate:**

| Name | Description | Order | Visible |
|------|-------------|-------|---------|
| Reception sponsor | Monday networking event | 1 | ✓ |
| Workshop sponsor | Tuesday training sessions | 2 | ✓ |
| Anniversary dinner | 10th anniversary celebration | 3 | ✓ |

---

## Table 9: What To Expect

**Purpose:** The bullet points shown in the "What to expect" section on the homepage, organized by day.

**Fields to create:**

1. **Day** (Single select)
   - Options: `Monday`, `Tuesday`
   - Purpose: Which day this relates to

2. **Day Label** (Single line text)
   - Purpose: Header text (e.g., "Monday: Main summit")

3. **Items** (Long text)
   - Purpose: Bullet points, one per line

4. **Order** (Number)
   - Purpose: Display order

**Initial data to populate:**

| Day | Day Label | Items | Order |
|-----|-----------|-------|-------|
| Monday | Monday: Main summit | 8 curated sessions with invited speakers\n8 lightning talks from community pitches\nNetworking opportunities throughout\nEvening dinner and celebration | 1 |
| Tuesday | Tuesday: Workshops | Track 1: Collaborating 101\nTrack 2: Advanced collaboration\nHands-on learning and skill building | 2 |

---

## Summary

After creating all tables, you should have:

1. **Site Content** - 50+ rows of text content
2. **Event Details** - 10 rows of key event info
3. **Schedule** - 18 rows (schedule items)
4. **Summit History** - 10 rows (one per year)
5. **Stats** - 4 rows (the four statistics)
6. **Sponsorship Tiers** - 4 rows (the four tiers)
7. **Sponsors** - 0 rows (add as confirmed)
8. **Custom Sponsorships** - 3 rows
9. **What To Expect** - 2 rows

Let Joe know when the tables are created so he can connect the website to pull content from them.
