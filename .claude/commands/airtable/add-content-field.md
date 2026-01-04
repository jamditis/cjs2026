---
allowed-tools: Read, Edit, Grep, Glob
argument-hint: <section> <field> <component-file>
description: Add a new CMS-controlled content field - updates component to use getContent() and documents Airtable field needed
---

# Add CMS Content Field

You're adding a new field that will be controlled via Airtable CMS.

**Arguments:** $1 = section name, $2 = field name, $3 = component file path

## Domain Knowledge

Content flows: Airtable "Site Content" table -> generate-content.cjs -> siteContent.js -> getContent(section, field)

The getContent helper signature:
```javascript
import { getContent, getContentMeta, getColorClass } from '../content/siteContent'

// Basic usage with fallback
getContent('details', 'headline', 'Default Text')

// With metadata (color, order, component type)
const meta = getContentMeta('details', 'year')
const colorClass = getColorClass(meta?.color, 'text')
```

## What to Do

1. Read the target component file
2. Find the hardcoded text that should become CMS-controlled
3. Replace with `getContent('$1', '$2', 'original text as fallback')`
4. Add import if not present
5. Update CLAUDE.md "Pending Airtable updates" table with the new field

## Airtable Field Requirements

Document in CLAUDE.md that this field needs to be added:
- Field name: `$2`
- Section: `$1`
- Current value in code (becomes default)
- The Content value in Airtable

Always preserve the original text as the fallback parameter.
