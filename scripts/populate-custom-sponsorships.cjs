/**
 * Populate Custom Sponsorships table with CJS2026 options
 * Run: node scripts/populate-custom-sponsorships.cjs
 */

require('dotenv').config();

const AIRTABLE_PAT = process.env.VITE_AIRTABLE_KEY;
const BASE_ID = 'appL8Sn87xUotm4jF';
const TABLE_NAME = 'Custom Sponsorships';

const customSponsorship = [
  {
    Name: 'Evening reception',
    Description: 'Exclusive sponsorship of the Monday evening networking reception. Includes signage, speaking opportunity, and branding throughout the event.',
    Price: 10000
  },
  {
    Name: 'Breakfast or lunch',
    Description: 'Sponsor a meal during the summit. Includes signage at meal location, logo on menu cards, and announcement recognition.',
    Price: 5000
  },
  {
    Name: 'Coffee break',
    Description: 'Sponsor a coffee and snack break. Includes signage at refreshment station and branded napkins/cups.',
    Price: 2500
  },
  {
    Name: 'Lanyard or badge',
    Description: 'Your logo on every attendee badge or lanyard. Maximum visibility throughout the entire event.',
    Price: 3000
  },
  {
    Name: 'Notebook or tote bag',
    Description: 'Provide branded notebooks or tote bags for all attendees. Items distributed at registration.',
    Price: 2000
  },
  {
    Name: 'Lightning talks',
    Description: 'Sponsor the lightning talk session. Introduction mention and signage during the session.',
    Price: 2500
  },
  {
    Name: 'Live stream',
    Description: 'Sponsor the live stream for remote attendees. Logo watermark and verbal recognition during broadcast.',
    Price: 3500
  },
  {
    Name: 'Scholarship fund',
    Description: 'Support journalists who need financial assistance to attend. Recognition in program and during opening remarks.',
    Price: 5000
  }
];

async function deleteRecord(recordId) {
  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}/${recordId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`
      }
    }
  );
  return response.ok;
}

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
  console.log('📦 Populating Custom Sponsorships table...\n');

  // Check existing records and clean up empty ones
  const existing = await getExistingRecords();
  console.log(`Found ${existing.length} existing record(s)`);

  // Delete empty records
  for (const record of existing) {
    if (!record.fields.Name) {
      console.log(`Deleting empty record: ${record.id}`);
      await deleteRecord(record.id);
    }
  }

  const existingNames = existing.filter(r => r.fields.Name).map(r => r.fields.Name);
  console.log(`Existing sponsorships: ${existingNames.join(', ') || '(none)'}\n`);

  for (const item of customSponsorship) {
    if (existingNames.includes(item.Name)) {
      console.log(`⏭️  Skipping "${item.Name}" (already exists)`);
      continue;
    }

    console.log(`Creating: ${item.Name} ($${item.Price.toLocaleString()})`);
    try {
      await createRecord(item);
      console.log(`   ✅ Created successfully`);
    } catch (err) {
      console.error(`   ❌ Error:`, err.message);
    }
  }

  console.log('\n✅ Custom Sponsorships population complete!');
}

main().catch(console.error);
