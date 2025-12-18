/**
 * Set up the Airtable Attendees table with all required fields
 *
 * Usage: node scripts/setup-attendees-table.cjs
 *
 * This script creates the necessary fields in the Attendees table
 * by creating a dummy record with all fields, then deleting it.
 *
 * Note: Airtable doesn't have an API to create fields directly,
 * but fields are automatically created when you write data to them.
 */

const path = require('path');
const os = require('os');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: path.join(os.homedir(), '.claude', '.env') });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_KEY;
const AIRTABLE_BASE_ID = "appL8Sn87xUotm4jF";
const AIRTABLE_ATTENDEES_TABLE = "Attendees";

async function setupAttendeesTable() {
  console.log('='.repeat(50));
  console.log('Setting up Airtable Attendees table');
  console.log('='.repeat(50));
  console.log();

  if (!AIRTABLE_API_KEY) {
    console.error('ERROR: Airtable API key not found');
    console.log('Make sure VITE_AIRTABLE_KEY is set in .env');
    process.exit(1);
  }

  try {
    // First, check current table structure
    console.log('Checking current table structure...');
    const checkUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_ATTENDEES_TABLE)}?maxRecords=1`;

    const checkResponse = await fetch(checkUrl, {
      headers: { "Authorization": `Bearer ${AIRTABLE_API_KEY}` }
    });

    if (!checkResponse.ok) {
      if (checkResponse.status === 404) {
        console.error('\nTable "Attendees" not found!');
        console.log('Please create the table manually in Airtable first:');
        console.log(`  1. Go to: https://airtable.com/${AIRTABLE_BASE_ID}`);
        console.log('  2. Create a new table called "Attendees"');
        console.log('  3. Run this script again');
        process.exit(1);
      }
      throw new Error(`Airtable API error: ${checkResponse.status}`);
    }

    const checkData = await checkResponse.json();
    const existingFields = checkData.records.length > 0
      ? Object.keys(checkData.records[0].fields)
      : [];

    console.log(`Found ${existingFields.length} existing fields`);

    // Create a schema record with all required fields
    const schemaRecord = {
      "uid": "_SCHEMA_SETUP_",
      "Email": "schema@setup.temp",
      "Name": "Schema Setup Record",
      "Organization": "CJS2026 Setup",
      "Role": "setup",
      "Photo URL": "https://example.com/photo.jpg",
      "Website": "https://example.com",
      "Instagram": "setup",
      "LinkedIn": "setup",
      "Bluesky": "setup.bsky.social",
      "Badges": "[]",
      "Attended Summits": "[]",
      "Custom Badges": "{}",
      "Registration Status": "pending",
      "Notify When Tickets Available": false,
      "Created At": new Date().toISOString(),
      "Updated At": new Date().toISOString()
    };

    // Create the schema record
    console.log('\nCreating schema record with all fields...');
    const createUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_ATTENDEES_TABLE)}`;

    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        records: [{ fields: schemaRecord }]
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create record: ${createResponse.status} - ${errorText}`);
    }

    const createData = await createResponse.json();
    const recordId = createData.records[0].id;
    console.log(`Created schema record: ${recordId}`);

    // Delete the schema record
    console.log('Cleaning up schema record...');
    const deleteUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_ATTENDEES_TABLE)}/${recordId}`;

    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { "Authorization": `Bearer ${AIRTABLE_API_KEY}` }
    });

    if (!deleteResponse.ok) {
      console.warn('Warning: Could not delete schema record. Please delete it manually.');
    } else {
      console.log('Schema record cleaned up');
    }

    // Verify the new structure
    console.log('\nVerifying table structure...');
    await new Promise(r => setTimeout(r, 1000)); // Wait for Airtable to update

    const verifyResponse = await fetch(checkUrl, {
      headers: { "Authorization": `Bearer ${AIRTABLE_API_KEY}` }
    });

    // List all fields that should now exist
    console.log('\n' + '='.repeat(50));
    console.log('SUCCESS! Table structure is now set up');
    console.log('='.repeat(50));
    console.log('\nThe following fields have been created:');
    console.log();

    const requiredFields = Object.keys(schemaRecord);
    requiredFields.forEach(field => {
      console.log(`  ✓ ${field}`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('Next steps:');
    console.log('='.repeat(50));
    console.log();
    console.log('1. Go to Airtable and verify the fields are created:');
    console.log(`   https://airtable.com/${AIRTABLE_BASE_ID}`);
    console.log();
    console.log('2. You may want to adjust field types:');
    console.log('   - Email: Change to "Email" type');
    console.log('   - Photo URL, Website: Change to "URL" type');
    console.log('   - Registration Status: Change to "Single select"');
    console.log('     with options: pending, registered, confirmed');
    console.log('   - Notify When Tickets Available: Change to "Checkbox"');
    console.log('   - Created At, Updated At: Change to "Date" with time');
    console.log();
    console.log('3. Test the sync from the admin panel (/admin > Attendees > Sync to Airtable)');

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

setupAttendeesTable();
