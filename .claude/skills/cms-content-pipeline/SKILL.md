---
name: cms-content-pipeline
description: Master the Airtable CMS integration - content generation scripts, field mapping, and safe content modification patterns
---

# CMS Content Pipeline

## When to Activate

Use this skill when the agent needs to:
- Add new CMS-controlled content fields
- Understand why content isn't appearing correctly
- Debug generate script failures
- Modify how Airtable data maps to components
- Add new Airtable tables to the pipeline

## The Content Pipeline

Content flows through a **static generation pipeline**:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Airtable Table  │ ──► │ generate-*.cjs   │ ──► │ src/content/*.js│
│ (Source of      │     │ (Build-time      │     │ (Static JS      │
│  truth)         │     │  transform)      │     │  module)        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                                 ┌─────────────────┐
                                                 │ React Component │
                                                 │ (Direct import) │
                                                 └─────────────────┘
```

**Critical insight**: Content is NOT fetched at runtime. It's generated at build time and imported as static JavaScript modules.

## Three Content Tables

| Table | Script | Output | Primary Consumer |
|-------|--------|--------|------------------|
| Site Content | `generate-content.cjs` | `siteContent.js` | Home.jsx |
| Schedule | `generate-schedule.cjs` | `scheduleData.js` | Schedule.jsx |
| Organizations | `generate-organizations.cjs` | `organizationsData.js` | Sponsors.jsx |

## Content Access Patterns

### Pattern 1: getContent() for text values

```javascript
import { getContent } from '../content/siteContent';

// getContent(section, field, fallback)
const headline = getContent('details', 'headline', 'Default Text');
```

### Pattern 2: getContentMeta() for styled content

```javascript
import { getContentMeta, getColorClass } from '../content/siteContent';

const meta = getContentMeta('details', 'year');
const colorClass = getColorClass(meta?.color, 'text');
// Returns: 'text-brand-teal', 'text-brand-cardinal', etc.
```

### Pattern 3: Pre-built arrays

```javascript
import { timeline, stats } from '../content/siteContent';

// timeline: Array of 10 summit years with location, theme, link
// stats: Array of 4 stats (summits, cities, attendees, mission)
```

## Field Naming Conventions

### Site Content Table
- `Field`: Unique identifier used in `getContent(section, 'field')`
- `Section`: Groups content (details, footer, expect, history, stats)
- `Content`: The actual text value
- `Color`: Brand color name (teal, cardinal, ink, green-dark)
- `Order`: Sort order within section

### Schedule Table (flexible field names)
The script handles variations:
```javascript
title: fields['Session title'] || fields.title || fields.Title
day: fields.day || fields.Day
start_time: fields.start_time || fields['Start time']
```

## Adding New CMS Content

### Step 1: Identify if content should be CMS-controlled

Ask: "Will editors need to change this text without deploying code?"

### Step 2: Update component to use getContent()

```javascript
// Before (hardcoded)
<h1>Welcome to CJS2026</h1>

// After (CMS-controlled)
<h1>{getContent('hero', 'welcome_text', 'Welcome to CJS2026')}</h1>
```

### Step 3: Document in CLAUDE.md

Add to "Pending Airtable updates" table:
```markdown
| welcome_text | hero | "Welcome to CJS2026" | (editor sets) | Pending |
```

### Step 4: Editor adds field in Airtable

Field must match exactly: section + field name.

## Troubleshooting

### Content not appearing
1. Check Airtable has field with correct Section and Field name
2. Run `npm run generate-content` to pull fresh data
3. Verify `src/content/siteContent.js` was updated (check timestamp)
4. Confirm component uses correct `getContent('section', 'field')`

### Generate script fails
1. Check `AIRTABLE_API_KEY` is set (env or .env file)
2. Verify network connectivity to Airtable
3. Check Airtable table hasn't been renamed/deleted

### Sponsors not showing
1. Verify "Sponsor" checkbox is checked in Organizations table
2. Check "Sponsor tier" field has valid value
3. Run `npm run generate-organizations`
4. For logo issues: Firebase credentials needed for upload

## Integration Points

- **cjs-architecture** - For understanding where content flows
- **firebase-patterns** - For CloudFunction-based content (getSiteContent)

## Guidelines

1. Never edit `src/content/*.js` files directly - they're auto-generated
2. Always provide meaningful fallback values in `getContent()`
3. Document new CMS fields in CLAUDE.md before implementation
4. Use `npm run generate-all` before deployment to ensure fresh content
5. The ContentContext exists but is NOT used - ignore it (dead code)
