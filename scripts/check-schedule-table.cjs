/**
 * Check Airtable Schedule table structure
 */

const fs = require('fs');
const path = require('path');

const BASE_ID = 'appL8Sn87xUotm4jF';

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

async function listTables() {
  console.log('Fetching tables in base...\n');

  const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });

  if (!response.ok) {
    console.log('Error fetching tables:', response.status);
    console.log('Note: Meta API requires different permissions. Trying direct table access...\n');
    return null;
  }

  const data = await response.json();
  return data.tables;
}

async function fetchTableRecords(tableId, maxRecords = 5) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${tableId}?maxRecords=${maxRecords}`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function main() {
  console.log('='.repeat(60));
  console.log('Checking Airtable Schedule Table Structure');
  console.log('='.repeat(60));

  // Try common table names for schedule
  const possibleTableNames = ['Schedule', 'Sessions', 'schedule', 'sessions'];

  for (const tableName of possibleTableNames) {
    console.log(`\nTrying table: "${tableName}"...`);

    try {
      const data = await fetchTableRecords(tableName, 100);

      console.log(`\n✓ Found table "${tableName}" with ${data.records.length} records\n`);

      if (data.records.length > 0) {
        // Get all unique field names from records
        const allFields = new Set();
        data.records.forEach(record => {
          Object.keys(record.fields).forEach(field => allFields.add(field));
        });

        console.log('Fields found:');
        console.log('-'.repeat(40));
        Array.from(allFields).sort().forEach(field => {
          console.log(`  - ${field}`);
        });

        console.log('\nSample record:');
        console.log('-'.repeat(40));
        console.log(JSON.stringify(data.records[0].fields, null, 2));
      } else {
        console.log('Table exists but has no records yet.');
      }

      return; // Found the table, exit
    } catch (err) {
      console.log(`  Not found or error: ${err.message}`);
    }
  }

  console.log('\nNo Schedule table found. You may need to create one.');
  console.log('\nTrying to list all tables via Meta API...');

  const tables = await listTables();
  if (tables) {
    console.log('\nTables in base:');
    tables.forEach(t => console.log(`  - ${t.name} (${t.id})`));
  }
}

main().catch(console.error);
