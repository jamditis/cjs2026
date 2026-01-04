/**
 * Update Chapel Hill references to Pittsburgh in Airtable
 *
 * Usage: node scripts/update-pittsburgh.cjs
 */

const fs = require('fs');
const path = require('path');

const AIRTABLE_BASE_ID = 'appL8Sn87xUotm4jF';
const SITE_CONTENT_TABLE = 'tblTZ0F89UMTO8PO0';

// Load API key
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

// Replacements to make
const REPLACEMENTS = [
  { from: 'Join us in Chapel Hill', to: 'Join us in Pittsburgh' },
  { from: 'Chapel Hill, North Carolina', to: 'Pittsburgh, Pennsylvania' },
  { from: 'UNC Friday Center', to: 'Pittsburgh venue TBA' },
  { from: 'Chapel Hill, NC', to: 'Pittsburgh, PA' },
];

async function fetchAllRecords(tableId) {
  let allRecords = [];
  let offset = null;
  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`;

  do {
    const url = new URL(baseUrl);
    url.searchParams.append('pageSize', '100');
    if (offset) {
      url.searchParams.append('offset', offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable fetch error: ${response.status}`);
    }

    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

async function updateRecord(tableId, recordId, fields) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Airtable update error: ${response.status} ${errorText}`);
  }

  return await response.json();
}

async function main() {
  console.log('='.repeat(50));
  console.log('Updating Chapel Hill → Pittsburgh in Airtable');
  console.log('='.repeat(50));

  try {
    // Fetch all Site Content records
    console.log('\n📥 Fetching Site Content records...');
    const records = await fetchAllRecords(SITE_CONTENT_TABLE);
    console.log(`   Found ${records.length} records`);

    // Find records that need updating
    const toUpdate = [];

    for (const record of records) {
      const content = record.fields.Content || '';

      for (const replacement of REPLACEMENTS) {
        if (content.includes(replacement.from)) {
          toUpdate.push({
            record,
            from: replacement.from,
            to: replacement.to,
            newContent: content.replace(replacement.from, replacement.to)
          });
          break; // Only one replacement per record
        }
      }
    }

    console.log(`\n🔍 Found ${toUpdate.length} records to update:\n`);

    if (toUpdate.length === 0) {
      console.log('   No Chapel Hill references found! Already updated.');
      return;
    }

    // Show what will be updated
    for (const item of toUpdate) {
      const section = item.record.fields.Section || 'unknown';
      const field = item.record.fields.Field || 'unknown';
      console.log(`   • ${section}.${field}`);
      console.log(`     "${item.from}" → "${item.to}"`);
    }

    console.log('\n📝 Updating records...\n');

    // Update each record
    let successCount = 0;
    for (const item of toUpdate) {
      try {
        await updateRecord(SITE_CONTENT_TABLE, item.record.id, {
          Content: item.newContent
        });
        console.log(`   ✓ Updated: ${item.record.fields.Section}.${item.record.fields.Field}`);
        successCount++;
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`   ✗ Failed: ${item.record.fields.Section}.${item.record.fields.Field} - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Updated ${successCount}/${toUpdate.length} records`);
    console.log('='.repeat(50));

    console.log('\nNext steps:');
    console.log('1. Run: npm run generate-content');
    console.log('2. Verify: findstr "Chapel Hill" src\\content\\siteContent.js');
    console.log('3. Build and deploy if needed');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
