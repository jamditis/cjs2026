# CMS data pitfalls: When dynamic becomes dangerous

**Date:** 2026-01-05
**Issue:** Stats animation showing correct values during animation, then snapping to wrong values
**Root cause:** Multiple conflicting data sources + CMS data structure mismatch

## The bug

The homepage stats section had a CountUp animation that would:
1. Animate from 0 to the correct value (e.g., 2,569 registrations)
2. Snap back to wrong values when animation completed (e.g., 1,500)

## Investigation reveals multiple problems

### Problem 1: Data structure mismatch
Code expected:
```javascript
stats.filter(s => s.field?.endsWith('_value'))
```

But CMS data had:
```javascript
{ id: 'summits', value: '10', label: 'Summits' }
```

### Problem 2: Legacy code with conflicting data
Found a 675-line `App.jsx` with completely separate hardcoded stats:
```javascript
// In legacy App.jsx (now deleted)
{ value: '8', label: 'Cities' }      // WRONG - actual is 6
{ value: '1,500+', label: 'Attendees' } // WRONG - actual is 2,569
```

This legacy file was never imported anywhere but may have been causing confusion during debugging or could have been accidentally imported.

### Problem 3: Too many indirections
The data flow was:
```
Airtable → generate-content.cjs → siteContent.js → Home.jsx parsing → CountUp
```

Each step could introduce bugs, and the parsing in Home.jsx was fragile.

## The solution: Hardcode historical data

For data that:
- Is **historical fact** that won't change
- Has been **verified from authoritative sources** (Eventbrite CSVs)
- Is **simple and small** (4 stats)

**Just hardcode it:**

```jsx
<CountUp end={10} duration={1.5} />
<p>Summits</p>

<CountUp end={6} duration={1.5} />
<p>Cities</p>

<CountUp end={2569} duration={2} />
<p>Registrations</p>

<CountUp end={1} duration={0.8} />
<p>Mission</p>
```

## Decision framework: When to hardcode vs use CMS

### Use CMS when:
- Content needs to be edited by non-developers
- Content changes frequently (dates, descriptions, speaker names)
- Content is promotional (headlines, CTAs)
- Multiple people need to update it

### Hardcode when:
- Data is historical fact that won't change
- Data has been verified and finalized
- The CMS adds complexity without benefit
- Animation or rendering depends on exact values
- Data structure is simple (a few values, not lists)

## Cleanup actions taken

1. **Deleted legacy App.jsx** (675 lines) - contained wrong stats, never imported
2. **Deleted other legacy files** - Register.jsx, ForgotPassword.jsx (replaced by magic links)
3. **Removed `stats` from siteContent import** - no longer needed
4. **Hardcoded verified values** - from Eventbrite CSV analysis

## Lessons for future

1. **Audit for duplicate data sources** before assuming the CMS is the problem
2. **Grep for competing implementations** when data appears in unexpected places
3. **Historical data doesn't need a CMS** - it's not going to be edited
4. **Verify stats from authoritative sources** before hardcoding (we used Eventbrite CSVs)
5. **Simple is better** - 4 hardcoded lines beat a parsing pipeline that can break

## Related files

- `src/pages/Home.jsx` - Stats section with hardcoded values
- `src/content/siteContent.js` - CMS data (stats still exported but unused by Home.jsx)
- `.claude/lessons/content-accuracy.md` - How we verified the 2,569 number

## Tags

`cms` `data-structure` `legacy-code` `hardcoding` `animation` `countup`
