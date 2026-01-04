/**
 * Test Airtable CMS Integration (End-to-End)
 *
 * This script:
 * 1. Gets the current tagline value from Airtable
 * 2. Changes it to a test value
 * 3. Regenerates content from Airtable
 * 4. Verifies the change appears in siteContent.js
 * 5. Reverts the change in Airtable
 * 6. Regenerates again to restore original
 *
 * Usage: node scripts/test-airtable-change.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AIRTABLE_BASE_ID = 'appL8Sn87xUotm4jF';
const SITE_CONTENT_TABLE = 'tblTZ0F89UMTO8PO0';
const SITE_CONTENT_FILE = path.join(__dirname, '..', 'src', 'content', 'siteContent.js');

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

async function findRecord(fieldName, section) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SITE_CONTENT_TABLE}?filterByFormula=AND({Field}="${fieldName}",{Section}="${section}")`;

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status}`);
  }

  const data = await response.json();
  return data.records[0] || null;
}

async function updateRecord(recordId, newContent) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${SITE_CONTENT_TABLE}/${recordId}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: { Content: newContent }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Update failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

function regenerateContent() {
  console.log('   Running npm run generate-content...');
  execSync('npm run generate-content', {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe'
  });
}

function checkSiteContentFor(searchText) {
  const content = fs.readFileSync(SITE_CONTENT_FILE, 'utf-8');
  return content.includes(searchText);
}

async function main() {
  const TEST_VALUE = 'CMS_TEST_VALUE_12345_PIPELINE_WORKS';
  let originalValue = null;
  let recordId = null;

  console.log('='.repeat(60));
  console.log('  AIRTABLE CMS END-TO-END TEST');
  console.log('='.repeat(60));

  try {
    // Step 1: Find the tagline record
    console.log('\n1. Finding tagline record in Airtable...');
    const record = await findRecord('tagline', 'details');

    if (!record) {
      throw new Error('Tagline record not found in Site Content table');
    }

    originalValue = record.fields.Content;
    recordId = record.id;
    console.log(`   ✓ Found: "${originalValue}"`);
    console.log(`   Record ID: ${recordId}`);

    // Step 2: Update to test value
    console.log('\n2. Updating tagline to test value in Airtable...');
    await updateRecord(recordId, TEST_VALUE);
    console.log(`   ✓ Updated to: "${TEST_VALUE}"`);

    // Step 3: Regenerate content
    console.log('\n3. Regenerating content from Airtable...');
    regenerateContent();
    console.log('   ✓ Content regenerated');

    // Step 4: Verify the change appears in siteContent.js
    console.log('\n4. Verifying test value appears in siteContent.js...');
    const testPassed = checkSiteContentFor(TEST_VALUE);
    if (testPassed) {
      console.log('   ✓ TEST PASSED: Test value found in generated content!');
    } else {
      console.log('   ✗ TEST FAILED: Test value NOT found in generated content');
    }

    // Step 5: Revert the change
    console.log('\n5. Reverting tagline to original value...');
    await updateRecord(recordId, originalValue);
    console.log(`   ✓ Reverted to: "${originalValue}"`);

    // Step 6: Regenerate to restore original
    console.log('\n6. Regenerating content to restore original...');
    regenerateContent();
    console.log('   ✓ Content restored');

    // Step 7: Verify original is back
    console.log('\n7. Verifying original value restored...');
    const originalRestored = checkSiteContentFor(originalValue);
    const testGone = !checkSiteContentFor(TEST_VALUE);
    if (originalRestored && testGone) {
      console.log('   ✓ Original value restored successfully');
    } else {
      console.log('   ⚠ Warning: Original may not be fully restored');
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    if (testPassed) {
      console.log('  ✅ CMS PIPELINE TEST: PASSED');
      console.log('  The Airtable -> Generate -> Site pipeline works correctly!');
    } else {
      console.log('  ❌ CMS PIPELINE TEST: FAILED');
      console.log('  There may be an issue with content generation.');
    }
    console.log('='.repeat(60));

    process.exit(testPassed ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    // Try to revert if we have the original value
    if (originalValue && recordId) {
      console.log('\n⚠️ Attempting to revert change...');
      try {
        await updateRecord(recordId, originalValue);
        regenerateContent();
        console.log('   ✓ Reverted successfully');
      } catch (revertError) {
        console.error('   ✗ Could not revert:', revertError.message);
      }
    }

    process.exit(1);
  }
}

main();
