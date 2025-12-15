/**
 * Find TRUE duplicates in Airtable (same Field + Section + Page)
 */

const fs = require('fs');
const path = require('path');

const BASE_ID = 'appL8Sn87xUotm4jF';
const TABLE_ID = 'tblTZ0F89UMTO8PO0';

function loadApiKey() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    let match = content.match(/AIRTABLE_API_KEY=(.+)/);
    if (!match) match = content.match(/VITE_AIRTABLE_KEY=(.+)/);
    if (match) return match[1].trim();
  }
  throw new Error('Airtable API key not found in .env');
}

const API_KEY = loadApiKey();
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

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

async function main() {
  console.log('Fetching all records from Airtable...\n');
  const records = await fetchAllRecords();
  console.log(`Total records: ${records.length}\n`);

  // Group by Field + Section + Page (true duplicates have all three the same)
  const byKey = {};
  records.forEach((record, index) => {
    const field = record.fields.Field || '';
    const section = record.fields.Section || '';
    const page = record.fields.Page || '';
    const key = `${section}|${page}|${field}`;

    if (!byKey[key]) byKey[key] = [];
    byKey[key].push({
      index: index + 1,
      id: record.id,
      field,
      section,
      page,
      content: record.fields.Content
    });
  });

  // Find TRUE duplicates (same Field + Section + Page)
  console.log('='.repeat(60));
  console.log('TRUE DUPLICATES (same Field + Section + Page):');
  console.log('='.repeat(60));

  const trueDuplicates = [];
  for (const [key, instances] of Object.entries(byKey)) {
    if (instances.length > 1) {
      const [section, page, field] = key.split('|');
      console.log(`\n"${field}" in Section="${section}", Page="${page}" appears ${instances.length} times:`);
      instances.forEach(inst => {
        console.log(`  Row ${inst.index}: ID=${inst.id}`);
        console.log(`    Content: "${inst.content?.substring(0, 60)}${inst.content?.length > 60 ? '...' : ''}"`);
      });
      trueDuplicates.push({ key, field, section, page, instances });
    }
  }

  if (trueDuplicates.length === 0) {
    console.log('\nNo true duplicates found!');
  } else {
    console.log('\n' + '='.repeat(60));
    console.log(`SUMMARY: ${trueDuplicates.length} true duplicate groups found`);
    console.log('='.repeat(60));

    // Build list of IDs to delete (keep first, delete rest)
    const toDelete = [];
    trueDuplicates.forEach(dup => {
      dup.instances.slice(1).forEach(inst => {
        toDelete.push({ id: inst.id, field: dup.field, section: dup.section, page: dup.page, row: inst.index });
      });
    });

    console.log('\nRecords to DELETE (keeping first instance of each):');
    toDelete.forEach(item => {
      console.log(`  ${item.id} - "${item.field}" (${item.section}/${item.page}, row ${item.row})`);
    });

    console.log(`\nTotal records to delete: ${toDelete.length}`);
    console.log('\nRun with --delete flag to remove duplicates');

    // If --delete flag passed, delete them
    if (process.argv.includes('--delete')) {
      console.log('\n' + '='.repeat(60));
      console.log('DELETING TRUE DUPLICATES...');
      console.log('='.repeat(60));

      for (const item of toDelete) {
        try {
          const response = await fetch(`${BASE_URL}/${item.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${API_KEY}` }
          });
          if (response.ok) {
            console.log(`  ✓ Deleted ${item.id} ("${item.field}")`);
          } else {
            console.log(`  ✗ Failed to delete ${item.id}: ${response.status}`);
          }
          // Rate limit: max 5 requests per second
          await new Promise(r => setTimeout(r, 250));
        } catch (err) {
          console.log(`  ✗ Error deleting ${item.id}: ${err.message}`);
        }
      }
      console.log('\nDone!');
    }
  }
}

main().catch(console.error);
