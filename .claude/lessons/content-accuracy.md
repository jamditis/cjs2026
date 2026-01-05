# Content accuracy and fact verification

Lessons learned from verifying CJS2026 statistics and content accuracy.

## The problem

Marketing content often contains rounded or outdated figures that diverge from actual data over time. This session revealed several inaccuracies:

| Claim | Actual | Source |
|-------|--------|--------|
| "20 people in Montclair" (2017) | 161 registrations | Eventbrite CSV |
| "1,500+ attendees" | 2,569 registrations / 1,981 unique | Eventbrite CSVs |
| "7 cities" | 6 cities (Pittsburgh will be 7th) | Summit history |

## Never fabricate quotes

**Rule**: Do not write quotes and attribute them to real people unless you can link to an actual source showing exactly where and when they said it.

**Bad:**
```
@HeatherBryant - 8 summits
"CJS changed how I think about competition."  ← FABRICATED
```

**Good:**
```
@HeatherBryant - 8 summits
[ASK FOR QUOTE - do not fabricate]
```

This rule is now in:
- `~/.claude/CLAUDE.md` (user-level)
- `/Users/jamditis/Desktop/Sandbox/CLAUDE.md` (sandbox-level)
- `cjs2026/CLAUDE.md` (project-level)

## Verification workflow

When you encounter statistics or historical claims:

1. **Find the source data**
   ```bash
   ls planning/previous_summits/  # Eventbrite CSVs by year
   ```

2. **Run analysis script**
   ```bash
   node scripts/analyze-historical-attendees.cjs
   ```

3. **Compare claims vs actual**
   - Check `planning/attendee-analysis-summary.json`
   - Cross-reference with website stats in Airtable

4. **Update all locations**
   - Airtable CMS (Site Content table)
   - Static content files
   - README.md
   - Promotional materials

## Files to check for stats

| File | Contains |
|------|----------|
| `src/content/siteContent.js` | Homepage stats (auto-generated) |
| `src/content/updatesData.js` | News/updates content |
| `src/data/timeline-data.json` | Historical impact stats |
| `README.md` | Project overview stats |
| `promotional-content/README.md` | Marketing guidelines |

## Airtable stats location

Stats are controlled by the "Site Content" table:
- `attendees_value` - Total attendees figure
- `cities_value` - Number of cities
- `summits_value` - Number of summits

After updating Airtable, regenerate:
```bash
AIRTABLE_API_KEY='...' npm run generate-content
```

## Quick verification command

```bash
# Run full analysis and compare
node scripts/analyze-historical-attendees.cjs

# Check specific stat in Airtable-generated content
grep -i "attendees\|cities" src/content/siteContent.js
```
