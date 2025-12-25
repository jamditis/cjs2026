# Airtable Tables Reference

Base ID: `appL8Sn87xUotm4jF`

## Site Content Table

**Purpose**: Homepage text, stats, timeline, footer content

### Fields

| Field | Type | Purpose |
|-------|------|---------|
| `Field` | Text | Unique identifier for getContent() |
| `Name` | Text | Human-readable description |
| `Content` | Text | The actual content value |
| `Section` | Select | hero, details, footer, expect, timeline, stats |
| `Page` | Select | Home, Schedule, Contact |
| `Color` | Select | teal, cardinal, ink, green-dark, cream, gold |
| `Order` | Number | Sort order within section |
| `Visible` | Checkbox | Show/hide content |
| `Link` | URL | Optional link |

### Sections

| Section | Purpose | Fields Example |
|---------|---------|----------------|
| `details` | Hero content | headline, tagline, year, dates |
| `footer` | Footer content | signup_headline, contact_email |
| `expect` | What to expect | monday_label, tuesday_label |
| `history` | Summit history | 2017_location, 2017_theme |
| `stats` | Statistics | summits_value, attendees_value |

## Schedule Table

**Purpose**: Session data for schedule builder

### Fields

| Field | Type | Required |
|-------|------|----------|
| `Session title` | Text | Yes |
| `Type` | Select | Yes (session, workshop, break, special) |
| `day` / `Day` | Select | Yes (Monday, Tuesday) |
| `start_time` / `Start time` | Text | Yes |
| `end_time` / `End time` | Text | No |
| `description` / `Description` | Long text | No |
| `room` / `Room` | Text | No |
| `speakers` / `Speakers` | Text | No |
| `speaker_orgs` / `Speaker orgs` | Text | No |
| `track` / `Track` | Select | No |
| `order` / `Order` | Number | No |
| `visible` / `Visible` | Checkbox | No (default: true) |
| `is_bookmarkable` | Checkbox | No (default: true) |
| `session_id` | Text | No (auto-generated) |

**Note**: Script handles field name variations (day/Day, etc.)

## Organizations Table

**Purpose**: Sponsors and partner organizations

### Fields

| Field | Type | Required |
|-------|------|----------|
| `Name` | Text | Yes |
| `Logo` | Attachment | Yes (for sponsors) |
| `Website` | URL | No |
| `Sponsor` | Checkbox | Yes (filters sponsor display) |
| `Sponsor tier` | Select | No (presenting, lead, supporting, etc.) |
| `Sponsor order` | Number | No |
| `Description` | Long text | No |
| `Type` | Select | No |
| `Visible` | Checkbox | No (default: true) |

### Sponsor Tiers (Priority Order)

1. presenting
2. lead
3. supporting
4. partner
5. media
6. community

## Email Signups Table

**Purpose**: Newsletter signups (written by Cloud Function)

| Field | Type |
|-------|------|
| `Email` | Email |
| `Source` | Text |
| `Created At` | Date |

## Attendees Table

**Purpose**: User profiles synced from Firestore

| Field | Type |
|-------|------|
| `uid` | Text |
| `Email` | Email |
| `Name` | Text |
| `Organization` | Text |
| `Role` | Text |
| `Photo URL` | URL |
| `Registration Status` | Select |
| (and more...) | |
