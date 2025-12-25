---
allowed-tools: Bash(npm run generate-all:*), Bash(npm run generate-content:*), Bash(npm run generate-schedule:*), Bash(npm run generate-organizations:*), Read
description: Regenerate all content from Airtable (site content, schedule, sponsors)
---

# Generate All Content

Pull fresh data from all Airtable tables.

## What Runs

`npm run generate-all` executes:
1. `npm run generate-content` - Site Content table -> siteContent.js
2. `npm run generate-schedule` - Schedule table -> scheduleData.js
3. `npm run generate-organizations` - Organizations table -> organizationsData.js

## Expected Results

After running, verify these files were updated:

### siteContent.js
- `metadata.generatedAt` has recent timestamp
- `timeline` array has 10 items (2017-2026)
- `stats` array has 4 items
- Sections: footer, details, expect, history, stats

### scheduleData.js
- `metadata.generatedAt` has recent timestamp
- `sessions` array (may be empty if no sessions in Airtable yet)
- `sessionsByDay` has monday and tuesday keys
- `sessionTypes` and `sessionTracks` arrays

### organizationsData.js
- `metadata.generatedAt` has recent timestamp
- `sponsors` array
- `sponsorsByTier` object
- `hasSponsors()` function

## Troubleshooting

If scripts fail:
1. Check AIRTABLE_API_KEY is set (in .env or environment)
2. Check network connectivity to Airtable
3. For sponsors: Firebase credentials needed for logo upload

Report what was generated and any errors encountered.
