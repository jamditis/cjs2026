/**
 * Populate Sponsorship Tiers table with CJS2026 tier definitions
 * Run: node scripts/populate-sponsorship-tiers.cjs
 */

require('dotenv').config();

const AIRTABLE_PAT = process.env.VITE_AIRTABLE_KEY;
const BASE_ID = 'appL8Sn87xUotm4jF';
const TABLE_NAME = 'Sponsorship Tiers';

const sponsorshipTiers = [
  {
    Name: 'Presenting sponsor',
    Description: 'The premier sponsorship level for the 10th anniversary Collaborative Journalism Summit.',
    Benefits: `- Premier logo placement on all event materials
- Speaking opportunity at opening or closing session
- 10 complimentary tickets
- Dedicated email to all attendees
- Full-page ad in program
- Logo on registration page
- VIP reception access
- Recognition in all press releases`,
    Price: 25000,
    Available: true
  },
  {
    Name: 'Champion',
    Description: 'Major sponsorship with prominent visibility and attendee engagement opportunities.',
    Benefits: `- Large logo placement on website and materials
- 6 complimentary tickets
- Half-page ad in program
- Email mention to attendees
- Logo on registration page
- Recognition during sessions`,
    Price: 15000,
    Available: true
  },
  {
    Name: 'Advocate',
    Description: 'Strong sponsorship presence with recognition across multiple channels.',
    Benefits: `- Logo on website and program
- 4 complimentary tickets
- Quarter-page ad in program
- Social media recognition
- Logo on signage`,
    Price: 7500,
    Available: true
  },
  {
    Name: 'Supporter',
    Description: 'Meaningful sponsorship with core visibility benefits.',
    Benefits: `- Logo on website
- 2 complimentary tickets
- Recognition in program
- Social media mention`,
    Price: 3500,
    Available: true
  },
  {
    Name: 'Friend',
    Description: 'Entry-level sponsorship for organizations showing support.',
    Benefits: `- Logo on website (sponsors section)
- 1 complimentary ticket
- Recognition in program`,
    Price: 1500,
    Available: true
  }
];

async function createRecord(fields) {
  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create record: ${error}`);
  }

  return response.json();
}

async function getExistingRecords() {
  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
    {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch existing records');
  }

  const data = await response.json();
  return data.records;
}

async function main() {
  console.log('📊 Populating Sponsorship Tiers table...\n');

  // Check existing records
  const existing = await getExistingRecords();
  const existingNames = existing.map(r => r.fields.Name);
  console.log(`Found ${existing.length} existing tier(s): ${existingNames.join(', ') || '(none)'}\n`);

  for (const tier of sponsorshipTiers) {
    if (existingNames.includes(tier.Name)) {
      console.log(`⏭️  Skipping "${tier.Name}" (already exists)`);
      continue;
    }

    console.log(`Creating tier: ${tier.Name} ($${tier.Price.toLocaleString()})`);
    try {
      await createRecord(tier);
      console.log(`   ✅ Created successfully`);
    } catch (err) {
      console.error(`   ❌ Error:`, err.message);
    }
  }

  console.log('\n✅ Sponsorship Tiers population complete!');
}

main().catch(console.error);
