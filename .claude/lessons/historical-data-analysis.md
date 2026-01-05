# Historical attendee data analysis

How to analyze Eventbrite registration CSVs to generate marketing insights and outreach lists.

## Data location

```
planning/previous_summits/
├── 2017 Orders-31291355286.csv
├── 2018 Orders-42048839210.csv
├── 2019 Orders-52547754749.csv
├── 2020 Orders-85801292977.csv   ← Pandemic year (747 registrations)
├── 2021 Orders-138314332893.csv
├── 2022 Orders-243146767527.csv
├── 2023 Orders-489920614747.csv
├── 2024 Orders-760838216587.csv
└── 2025 Orders-1063325438009.csv
```

**Note**: These CSVs contain PII (names, emails). Do NOT commit to git.

## Key Eventbrite CSV columns

| Column | Description |
|--------|-------------|
| `Email Address` | Primary identifier for deduplication |
| `First Name`, `Last Name` | Attendee name |
| `Company` | Organization (often blank) |
| `Gross Revenue (USD)` | Ticket price paid |
| `Billing City`, `Billing State` | Location data |

## Analysis scripts

### Full analysis
```bash
node scripts/analyze-historical-attendees.cjs
```

Outputs:
- Console summary with key metrics
- `planning/attendee-analysis-summary.json` - Machine-readable stats

### Generate outreach lists
```bash
node scripts/generate-outreach-lists.cjs
```

Outputs to `planning/outreach-lists/`:
| File | Description | Count (as of 2026-01) |
|------|-------------|----------------------|
| `super-fans.csv` | 5+ summits attended | 13 |
| `loyal-attendees.csv` | 3-4 summits | 86 |
| `class-of-2020.csv` | Pandemic first-timers, never returned | 552 |
| `og-attendees-2017.csv` | Inaugural summit attendees | 161 |
| `lapsed-attendees.csv` | 2+ summits, not since 2023 | 247 |
| `recent-first-timers.csv` | 2024-2025 first-timers | 346 |

## Attendee segments explained

### Super Fans (5+ summits)
Core evangelists. Personalized VIP treatment, ambassador recruitment.

### Class of 2020
Pandemic brought 747 registrations (3-4x normal). 552 never returned. Re-engagement opportunity with "finally meet in person" messaging.

### OG Attendees
161 people from the inaugural 2017 summit. Nostalgia play for 10th anniversary reunion.

### Lapsed Attendees
Attended multiple times but dropped off. Survey to understand why + win-back offer.

## Email campaign templates

Located in `planning/email-campaign-templates.md`:
- Subject line A/B test variants
- Personalization fields: `[First Name]`, `[X]` (summit count), `[years]`
- Discount codes by segment
- Social media companion posts

## CSV parsing gotchas

1. **Quoted fields**: Eventbrite CSVs have commas inside quoted fields
   ```javascript
   // Handle with custom parser, not simple split(',')
   function parseCSVLine(line) {
     // Handle quotes properly
   }
   ```

2. **Email normalization**: Lowercase and trim for deduplication
   ```javascript
   const email = (row['Email Address'] || '').toLowerCase().trim();
   ```

3. **Name variations**: Same person may register with different name formats
   - Deduplication by email is more reliable than by name

## Privacy considerations

- Outreach lists contain emails - handle appropriately
- Don't commit CSVs with PII to git
- Discount codes should have limits to prevent abuse
