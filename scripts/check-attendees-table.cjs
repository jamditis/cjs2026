/**
 * Check the Attendees table structure in Airtable
 * Run: node scripts/check-attendees-table.cjs
 */

const path = require('path');
const os = require('os');

// Try multiple locations for the API key
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: path.join(os.homedir(), '.claude', '.env') });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = "appL8Sn87xUotm4jF";
const AIRTABLE_ATTENDEES_TABLE = "Attendees";

async function checkTable() {
  console.log("==================================================");
  console.log("Checking Attendees table structure");
  console.log("==================================================\n");

  if (!AIRTABLE_API_KEY) {
    console.error("ERROR: VITE_AIRTABLE_API_KEY not found in .env.local");
    console.log("Make sure you have a .env.local file with your Airtable API key");
    process.exit(1);
  }

  try {
    // Fetch one record to see the field structure
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_ATTENDEES_TABLE)}?maxRecords=1`;

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${AIRTABLE_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Airtable API error (${response.status}):`, errorText);

      if (response.status === 404) {
        console.log("\n>> Table 'Attendees' not found. You may need to create it.");
      }
      process.exit(1);
    }

    const data = await response.json();

    console.log(`Found ${data.records.length} record(s) in Attendees table\n`);

    if (data.records.length > 0) {
      const record = data.records[0];
      console.log("Existing fields in the table:");
      console.log("-----------------------------");

      const fields = Object.keys(record.fields).sort();
      fields.forEach(field => {
        const value = record.fields[field];
        const type = typeof value;
        const preview = type === 'string' && value.length > 50
          ? value.substring(0, 50) + '...'
          : value;
        console.log(`  - ${field} (${type}): ${JSON.stringify(preview)}`);
      });

      console.log("\n-----------------------------");
      console.log(`Total fields: ${fields.length}`);
    } else {
      console.log("Table exists but has no records.");
      console.log("The field structure will be created when the first record is added.");
    }

    // Now compare with required fields
    const requiredFields = [
      "uid",
      "Email",
      "Name",
      "Organization",
      "Role",
      "Photo URL",
      "Website",
      "Instagram",
      "LinkedIn",
      "Bluesky",
      "Badges",
      "Attended Summits",
      "Custom Badges",
      "Registration Status",
      "Notify When Tickets Available",
      "Created At",
      "Updated At"
    ];

    console.log("\n==================================================");
    console.log("Required fields for sync:");
    console.log("==================================================\n");

    const existingFields = data.records.length > 0 ? Object.keys(data.records[0].fields) : [];
    requiredFields.forEach(field => {
      const exists = existingFields.includes(field);
      const status = exists ? "✓" : "✗ (needs to be added)";
      console.log(`  ${status} ${field}`);
    });

    console.log("\n==================================================");
    console.log("Setup instructions:");
    console.log("==================================================\n");
    console.log("1. Go to your Airtable base: https://airtable.com/" + AIRTABLE_BASE_ID);
    console.log("2. Open the 'Attendees' table");
    console.log("3. Add any missing fields with these types:");
    console.log("   - uid: Single line text");
    console.log("   - Email: Email");
    console.log("   - Name: Single line text");
    console.log("   - Organization: Single line text");
    console.log("   - Role: Single line text");
    console.log("   - Photo URL: URL");
    console.log("   - Website: URL");
    console.log("   - Instagram: Single line text");
    console.log("   - LinkedIn: Single line text");
    console.log("   - Bluesky: Single line text");
    console.log("   - Badges: Long text");
    console.log("   - Attended Summits: Long text");
    console.log("   - Custom Badges: Long text");
    console.log("   - Registration Status: Single select (pending, registered, confirmed)");
    console.log("   - Notify When Tickets Available: Checkbox");
    console.log("   - Created At: Date");
    console.log("   - Updated At: Date");
    console.log("\n4. After adding fields, deploy the Cloud Functions:");
    console.log("   firebase deploy --only functions");

  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkTable();
