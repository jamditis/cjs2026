/**
 * Inspect Airtable field names for all CMS tables
 *
 * Usage: node scripts/inspect-airtable-fields.cjs
 */

const fs = require('fs');
const path = require('path');

const AIRTABLE_BASE_ID = 'appL8Sn87xUotm4jF';

const TABLES = [
  { name: 'Site Content', id: 'tblTZ0F89UMTO8PO0' },
  { name: 'Schedule', id: 'Schedule' },
  { name: 'Organizations', id: 'Organizations' },
  { name: 'Summit History', id: 'Summit History' },
  { name: 'Stats', id: 'Stats' },
  { name: 'Event Details', id: 'Event Details' },
  { name: 'What To Expect', id: 'What To Expect' },
];

function loadApiKey() {
  if (process.env.AIRTABLE_API_KEY) {
    return process.env.AIRTABLE_API_KEY;
  }
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    let match = content.match(/AIRTABLE_API_KEY=(.+)/);
    if (!match) match = content.match(/VITE_AIRTABLE_KEY=(.+)/);
    if (match) return match[1].trim();
  }
  throw new Error('AIRTABLE_API_KEY not found');
}

const API_KEY = loadApiKey();

async function fetchSampleRecords(tableId, limit = 3) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableId)}?maxRecords=${limit}`;

  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    if (!response.ok) {
      if (response.status === 404) return { error: 'Table not found' };
      return { error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { records: data.records };
  } catch (e) {
    return { error: e.message };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('  AIRTABLE FIELD INSPECTION');
  console.log('='.repeat(60));

  for (const table of TABLES) {
    console.log(`\n📋 ${table.name.toUpperCase()}`);
    console.log('-'.repeat(40));

    const result = await fetchSampleRecords(table.id);

    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
      continue;
    }

    if (result.records.length === 0) {
      console.log('   (empty table)');
      continue;
    }

    // Collect all unique field names from sample records
    const allFields = new Set();
    for (const record of result.records) {
      for (const field of Object.keys(record.fields)) {
        allFields.add(field);
      }
    }

    console.log(`   Fields found: ${[...allFields].sort().join(', ')}`);
    console.log(`   Records: ${result.records.length} (sample)`);

    // Show first record as example
    const firstRecord = result.records[0];
    console.log('\n   Sample record:');
    for (const [key, value] of Object.entries(firstRecord.fields)) {
      const displayValue = typeof value === 'string' && value.length > 50
        ? value.substring(0, 50) + '...'
        : JSON.stringify(value);
      console.log(`     • ${key}: ${displayValue}`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(60));
}

main();
