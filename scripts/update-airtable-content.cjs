/**
 * Update Airtable Site Content records
 *
 * Usage: node scripts/update-airtable-content.cjs
 */

const fs = require('fs');
const path = require('path');

const BASE_ID = 'appL8Sn87xUotm4jF';
const TABLE_ID = 'tblTZ0F89UMTO8PO0';

// Load API key from .env
function loadApiKey() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    // Try both possible key names
    let match = content.match(/AIRTABLE_API_KEY=(.+)/);
    if (!match) match = content.match(/VITE_AIRTABLE_KEY=(.+)/);
    if (match) return match[1].trim();
  }
  throw new Error('Airtable API key not found in .env');
}

const API_KEY = loadApiKey();
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

// Updates to make: { field: newValue }
const UPDATES = {
  'registration_note': 'Tickets now available',
  'signup_headline': 'Join us in Chapel Hill',
  'signup_description': 'Secure your spot at the 10th anniversary summit.'
};

async function fetchAllRecords() {
  let allRecords = [];
  let offset = null;

  do {
    const url = new URL(BASE_URL);
    url.searchParams.append('pageSize', '100');
    if (offset) url.searchParams.append('offset', offset);

    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

async function updateRecord(recordId, fields) {
  const response = await fetch(`${BASE_URL}/${recordId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });

  if (!response.ok) {
    throw new Error(`Failed to update record: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function main() {
  console.log('='.repeat(50));
  console.log('Updating Airtable Site Content');
  console.log('='.repeat(50));

  try {
    // Fetch all records
    console.log('\nFetching records from Airtable...');
    const records = await fetchAllRecords();
    console.log(`Found ${records.length} records`);

    // Find and update each field
    for (const [fieldName, newValue] of Object.entries(UPDATES)) {
      const record = records.find(r => r.fields.Field === fieldName);

      if (!record) {
        console.log(`\n⚠️  Field "${fieldName}" not found in Airtable`);
        continue;
      }

      const currentValue = record.fields.Content;
      if (currentValue === newValue) {
        console.log(`\n✓ "${fieldName}" already up to date`);
        continue;
      }

      console.log(`\n→ Updating "${fieldName}"`);
      console.log(`  From: "${currentValue}"`);
      console.log(`  To:   "${newValue}"`);

      await updateRecord(record.id, { Content: newValue });
      console.log(`  ✓ Updated successfully`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('Airtable updates complete!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
