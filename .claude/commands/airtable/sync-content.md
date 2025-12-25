---
allowed-tools: Bash(npm run generate-content:*), Read, Grep, Glob
description: Pull fresh site content from Airtable CMS and regenerate siteContent.js
---

# Sync Airtable Content

Run `npm run generate-content` to pull the latest from Airtable "Site Content" table.

After running, verify:
1. `src/content/siteContent.js` was updated (check timestamp in metadata)
2. Timeline has 10 entries (2017-2026)
3. Stats array has 4 entries
4. All sections exist: footer, details, expect, history, stats

Report what changed and flag any missing required sections.
