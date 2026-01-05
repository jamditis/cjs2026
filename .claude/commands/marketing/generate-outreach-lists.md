# Generate outreach lists

Generate segmented email lists from historical Eventbrite registration data.

## Prerequisites

CSV files must exist in `planning/previous_summits/`:
- 2017-2025 Eventbrite order exports
- Format: `YYYY Orders-XXXXXXXXX.csv`

## Usage

```bash
node scripts/generate-outreach-lists.cjs
```

## Output

Creates CSVs in `planning/outreach-lists/`:

| Segment | File | Description |
|---------|------|-------------|
| Super Fans | `super-fans.csv` | 5+ summits attended |
| Loyal | `loyal-attendees.csv` | 3-4 summits |
| Class of 2020 | `class-of-2020.csv` | Pandemic first-timers, never returned |
| OG | `og-attendees-2017.csv` | Inaugural 2017 attendees |
| Lapsed | `lapsed-attendees.csv` | 2+ summits, not since 2023 |
| Recent | `recent-first-timers.csv` | 2024-2025 first-timers |

## CSV columns

Each output file contains:
- Email
- First Name, Last Name, Full Name
- Organization, Title
- Years Attended (comma-separated)
- Total Summits
- First Year, Last Year

## Email templates

See `planning/email-campaign-templates.md` for:
- Subject line variants for A/B testing
- Email body templates with personalization fields
- Discount codes by segment
- Campaign timeline

## Related

- `scripts/analyze-historical-attendees.cjs` - Full statistical analysis
- `planning/attendee-analysis-summary.json` - Analysis output
