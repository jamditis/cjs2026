# Airtable CMS updates for Pittsburgh

**Date:** January 2, 2026
**Purpose:** Prevent Chapel Hill references from reappearing on the website

## Background

The website content is auto-generated from Airtable via `npm run generate-content`. When GitHub Actions deploys the site, it pulls fresh content from Airtable and overwrites `src/content/siteContent.js`.

We've manually fixed `siteContent.js` to show Pittsburgh, but these changes will be **overwritten on the next deploy** unless the Airtable CMS is also updated.

## Omni's new CMS structure

Omni (Airtable AI) has set up additional tables for the CMS:

| Table | Purpose | Records |
|-------|---------|---------|
| Site Content | Main editable content | 173 |
| Summit History | Timeline data (10 years) | 10 (needs populating) |
| Stats | Statistics for history section | 4 (needs populating) |
| Event Details | Structured event data | 10 (needs populating) |
| What To Expect | Day-by-day expectations | 2 (needs populating) |
| Schedule | Session data | 18 |
| Sponsorship Tiers | Sponsor packages | 4 |
| Organizations | Sponsors | TBD |
| Custom Sponsorships | Special opportunities | 3 |

The generate-content.cjs script now pulls from all these tables automatically.

## Required Airtable updates

**Base:** 2026 CJS (appL8Sn87xUotm4jF)

### 1. Site Content table (tblTZ0F89UMTO8PO0)

Search for records containing "Chapel Hill" or "North Carolina" and update:

| Section | Field | Current value | New value |
|---------|-------|---------------|-----------|
| `footer` | `signup_headline` | Join us in Chapel Hill | Join us in Pittsburgh |
| `details` | `location` | Chapel Hill, North Carolina | Pittsburgh, Pennsylvania |
| `details` | `venue_name` | UNC Friday Center | Pittsburgh venue TBA |
| `details` | `venue_location` | Chapel Hill, North Carolina | Pittsburgh, Pennsylvania |
| `timeline` | `2026_location` | Chapel Hill, NC | Pittsburgh, PA |

### 2. Summit History table

If using Omni's new Summit History table, update the 2026 entry:

| Field | Current value | New value |
|-------|---------------|-----------|
| Location | Chapel Hill, NC | Pittsburgh, PA |

### 3. Event Details table

If using Omni's Event Details table, update these keys:

| Key | Field | New value |
|-----|-------|-----------|
| venue_name | Value | Pittsburgh venue TBA |
| venue_city | Value | Pittsburgh |
| venue_state | Value | Pennsylvania |
| venue_location | Display Value | Pittsburgh, Pennsylvania |

### How to find records in Airtable

1. Open the **Site Content** table
2. Use Ctrl+F or the search bar
3. Search for "Chapel Hill" or "North Carolina"
4. Update the `Content` field with Pittsburgh equivalent
5. Repeat for other tables

## Verification

After updating Airtable, verify the changes by running:

```bash
# Generate fresh content
npm run generate-content

# Check for remaining Chapel Hill references
findstr "Chapel Hill" src\content\siteContent.js
findstr "North Carolina" src\content\siteContent.js
```

If no results, the CMS is correctly configured.

## Note on code fallbacks

The React components (Home.jsx, etc.) have Pittsburgh as fallback values:
- If Airtable is empty → shows Pittsburgh (fallback)
- If Airtable has Chapel Hill → shows Chapel Hill (CMS overrides fallback)

**The CMS values always win**, so these updates are required.

---

*Document updated after Omni CMS restructuring (January 2026)*
