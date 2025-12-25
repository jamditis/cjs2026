---
allowed-tools: Bash(npm run generate-organizations:*), Read, Grep
description: Pull sponsor data from Airtable Organizations table (requires Firebase for logo upload)
---

# Sync Sponsors

Run `npm run generate-organizations` to pull organizations with "Sponsor" checkbox checked.

## What Happens

1. Fetches from Airtable "Organizations" table
2. Filters records where Sponsor = true
3. Downloads logos from Airtable
4. Uploads to Firebase Storage (`sponsor-logos/{slug}.{ext}`)
5. Generates `src/content/organizationsData.js`

## Sponsor Tiers (Priority Order)

1. presenting
2. lead
3. supporting
4. partner
5. media
6. community

Unknown tiers get priority 99 (appear last).

## Generated Exports

```javascript
export const sponsors = [...]
export const sponsorsByTier = { 'presenting sponsor': [...], ... }
export const tierDisplayNames = { 'presenting': 'Presenting sponsor', ... }
export const hasSponsors = () => sponsors.length > 0
```

## Firebase Requirement

This script needs Firebase Admin SDK initialized. Without credentials:
- Logos won't upload
- `localLogoPath` fallback used instead
- Sponsor still appears but may have broken image

Report sponsors found, tiers represented, and any logo upload failures.
