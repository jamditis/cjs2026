/**
 * Check for duplicate rows in Airtable Site Content
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

  // Group by Field name
  const byField = {};
  records.forEach((record, index) => {
    const field = record.fields.Field || '(no field)';
    if (!byField[field]) byField[field] = [];
    byField[field].push({
      index: index + 1,
      id: record.id,
      section: record.fields.Section,
      content: record.fields.Content,
      page: record.fields.Page
    });
  });

  // Find duplicates
  console.log('='.repeat(60));
  console.log('DUPLICATE FIELDS FOUND:');
  console.log('='.repeat(60));

  const duplicates = [];
  for (const [field, instances] of Object.entries(byField)) {
    if (instances.length > 1) {
      console.log(`\n"${field}" appears ${instances.length} times:`);
      instances.forEach(inst => {
        console.log(`  Row ${inst.index}: Section="${inst.section}", Page="${inst.page}"`);
        console.log(`    ID: ${inst.id}`);
        console.log(`    Content: "${inst.content?.substring(0, 50)}${inst.content?.length > 50 ? '...' : ''}"`);
      });
      duplicates.push({ field, instances });
    }
  }

  if (duplicates.length === 0) {
    console.log('\nNo duplicates found!');
  } else {
    console.log('\n' + '='.repeat(60));
    console.log(`SUMMARY: ${duplicates.length} fields have duplicates`);
    console.log('='.repeat(60));

    // Output record IDs to delete (keep first, delete rest)
    console.log('\nRecord IDs to DELETE (keeping first instance of each):');
    const toDelete = [];
    duplicates.forEach(dup => {
      // Keep the first one, mark others for deletion
      dup.instances.slice(1).forEach(inst => {
        toDelete.push(inst.id);
        console.log(`  ${inst.id} (${dup.field}, row ${inst.index})`);
      });
    });

    console.log(`\nTotal records to delete: ${toDelete.length}`);
    console.log('\nRun with --delete flag to remove duplicates');

    // If --delete flag passed, delete them
    if (process.argv.includes('--delete')) {
      console.log('\n' + '='.repeat(60));
      console.log('DELETING DUPLICATES...');
      console.log('='.repeat(60));

      for (const id of toDelete) {
        try {
          const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${API_KEY}` }
          });
          if (response.ok) {
            console.log(`  ✓ Deleted ${id}`);
          } else {
            console.log(`  ✗ Failed to delete ${id}: ${response.status}`);
          }
          // Rate limit: max 5 requests per second
          await new Promise(r => setTimeout(r, 250));
        } catch (err) {
          console.log(`  ✗ Error deleting ${id}: ${err.message}`);
        }
      }
      console.log('\nDone!');
    }
  }
}

main().catch(console.error);
