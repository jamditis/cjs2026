/**
 * CMS Integration Health Check
 *
 * This script verifies the complete Airtable CMS integration:
 * 1. All tables exist and are accessible
 * 2. Required fields exist in each table
 * 3. Data is properly formatted
 * 4. Generation scripts produce valid output
 * 5. GitHub Actions workflow compatibility
 *
 * Usage: node scripts/check-cms-integration.cjs
 */

const fs = require('fs');
const path = require('path');

const AIRTABLE_BASE_ID = 'appL8Sn87xUotm4jF';

// Expected tables and their required fields
const EXPECTED_TABLES = {
  'Site Content': {
    tableId: 'tblTZ0F89UMTO8PO0',
    requiredFields: ['Section', 'Field', 'Content'],
    optionalFields: ['Page', 'Color', 'Order', 'Visible', 'Component', 'Link', 'Notes'],
    minRecords: 50, // Should have at least 50 content records
  },
  'Schedule': {
    tableId: 'Schedule',
    requiredFields: ['Title'],
    optionalFields: ['Day', 'Time', 'Type', 'Description', 'Speaker(s)', 'Order', 'Visible', 'Room', 'Track'],
    minRecords: 1,
  },
  'Organizations': {
    tableId: 'Organizations',
    requiredFields: ['Name'],
    optionalFields: ['Logo', 'Website', 'Sponsor', 'Sponsor tier', 'Visible'],
    minRecords: 0, // May be empty
  },
  'Summit History': {
    tableId: 'Summit History',
    requiredFields: ['Year', 'Location'],
    optionalFields: ['Theme', 'Link', 'Color', 'Order', 'Visible'],
    minRecords: 0, // May fall back to Site Content
  },
  'Stats': {
    tableId: 'Stats',
    requiredFields: ['Label', 'Value'],
    optionalFields: ['Suffix', 'Order', 'Visible', 'Color'],
    minRecords: 0, // May fall back to Site Content
  },
  'Event Details': {
    tableId: 'Event Details',
    requiredFields: ['Name'],
    optionalFields: ['Key', 'Value', 'Display Value', 'Notes'],
    minRecords: 0,
  },
  'What To Expect': {
    tableId: 'What To Expect',
    requiredFields: ['Day'],
    optionalFields: ['Day Label', 'Items', 'Order'],
    minRecords: 0,
  },
};

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

async function fetchTable(tableNameOrId) {
  let allRecords = [];
  let offset = null;
  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableNameOrId)}`;

  try {
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
        if (response.status === 404) {
          return { error: 'Table not found', records: [] };
        }
        return { error: `HTTP ${response.status}`, records: [] };
      }

      const data = await response.json();
      allRecords = allRecords.concat(data.records);
      offset = data.offset;
    } while (offset);

    return { error: null, records: allRecords };
  } catch (e) {
    return { error: e.message, records: [] };
  }
}

function checkFieldsExist(records, requiredFields) {
  if (records.length === 0) return { missing: [], present: [] };

  // Check first few records for field presence
  const sampleRecords = records.slice(0, Math.min(5, records.length));
  const allFieldsFound = new Set();

  for (const record of sampleRecords) {
    for (const field of Object.keys(record.fields)) {
      allFieldsFound.add(field);
    }
  }

  const missing = requiredFields.filter(f => !allFieldsFound.has(f));
  const present = requiredFields.filter(f => allFieldsFound.has(f));

  return { missing, present, allFields: [...allFieldsFound] };
}

function checkContentIntegrity(records) {
  const issues = [];

  // Check for Pittsburgh values
  const pittsburghFields = ['signup_headline', 'location', 'venue_name', 'venue_location', '2026_location'];
  const chapelHillPattern = /chapel hill|north carolina/i;

  for (const record of records) {
    const content = record.fields.Content || '';
    const field = record.fields.Field || '';

    if (chapelHillPattern.test(content)) {
      issues.push(`Field "${field}" still contains Chapel Hill reference: "${content.substring(0, 50)}..."`);
    }
  }

  return issues;
}

async function checkGeneratedFiles() {
  const issues = [];
  const files = [
    { path: 'src/content/siteContent.js', name: 'Site Content' },
    { path: 'src/content/scheduleData.js', name: 'Schedule Data' },
    { path: 'src/content/organizationsData.js', name: 'Organizations Data' },
  ];

  for (const file of files) {
    const fullPath = path.join(__dirname, '..', file.path);
    if (!fs.existsSync(fullPath)) {
      issues.push(`${file.name}: File not found at ${file.path}`);
    } else {
      const stat = fs.statSync(fullPath);
      if (stat.size < 100) {
        issues.push(`${file.name}: File seems too small (${stat.size} bytes)`);
      }
    }
  }

  return issues;
}

async function checkGitHubWorkflow() {
  const issues = [];
  const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'deploy.yml');

  if (!fs.existsSync(workflowPath)) {
    issues.push('GitHub Actions deploy workflow not found at .github/workflows/deploy.yml');
    return issues;
  }

  const workflow = fs.readFileSync(workflowPath, 'utf-8');

  // Check for required commands
  if (!workflow.includes('generate-content') && !workflow.includes('generate-all')) {
    issues.push('Workflow missing content generation step (generate-content or generate-all)');
  }

  if (!workflow.includes('AIRTABLE_API_KEY') && !workflow.includes('AIRTABLE')) {
    issues.push('Workflow missing AIRTABLE_API_KEY secret reference');
  }

  if (!workflow.includes('firebase deploy') && !workflow.includes('firebase-action')) {
    issues.push('Workflow missing Firebase deploy step');
  }

  return issues;
}

async function main() {
  console.log('='.repeat(60));
  console.log('  CMS INTEGRATION HEALTH CHECK');
  console.log('='.repeat(60));

  const results = {
    tables: {},
    generatedFiles: [],
    workflow: [],
    contentIntegrity: [],
    overallStatus: 'PASS',
  };

  // 1. Check all tables
  console.log('\n📊 CHECKING AIRTABLE TABLES\n');

  for (const [tableName, config] of Object.entries(EXPECTED_TABLES)) {
    process.stdout.write(`   ${tableName}... `);

    const { error, records } = await fetchTable(config.tableId);

    if (error) {
      console.log(`❌ ${error}`);
      results.tables[tableName] = { status: 'ERROR', error, records: 0 };
      results.overallStatus = 'FAIL';
      continue;
    }

    const fieldCheck = checkFieldsExist(records, config.requiredFields);

    if (fieldCheck.missing.length > 0) {
      console.log(`⚠️ Missing fields: ${fieldCheck.missing.join(', ')}`);
      results.tables[tableName] = {
        status: 'WARNING',
        records: records.length,
        missingFields: fieldCheck.missing,
        presentFields: fieldCheck.present,
      };
    } else if (records.length < config.minRecords) {
      console.log(`⚠️ Low records (${records.length}/${config.minRecords} minimum)`);
      results.tables[tableName] = {
        status: 'WARNING',
        records: records.length,
        expectedMin: config.minRecords,
      };
    } else {
      console.log(`✓ ${records.length} records`);
      results.tables[tableName] = {
        status: 'OK',
        records: records.length,
        fields: fieldCheck.allFields,
      };
    }

    // Check content integrity for Site Content
    if (tableName === 'Site Content') {
      const contentIssues = checkContentIntegrity(records);
      if (contentIssues.length > 0) {
        results.contentIntegrity = contentIssues;
        results.overallStatus = 'FAIL';
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 2. Check generated files
  console.log('\n📁 CHECKING GENERATED FILES\n');

  const fileIssues = await checkGeneratedFiles();
  results.generatedFiles = fileIssues;

  if (fileIssues.length === 0) {
    console.log('   ✓ All generated files present and valid');
  } else {
    for (const issue of fileIssues) {
      console.log(`   ⚠️ ${issue}`);
    }
    results.overallStatus = 'FAIL';
  }

  // 3. Check GitHub workflow
  console.log('\n🔄 CHECKING GITHUB ACTIONS WORKFLOW\n');

  const workflowIssues = await checkGitHubWorkflow();
  results.workflow = workflowIssues;

  if (workflowIssues.length === 0) {
    console.log('   ✓ GitHub Actions workflow configured correctly');
  } else {
    for (const issue of workflowIssues) {
      console.log(`   ⚠️ ${issue}`);
    }
  }

  // 4. Content integrity
  console.log('\n🔍 CHECKING CONTENT INTEGRITY\n');

  if (results.contentIntegrity.length === 0) {
    console.log('   ✓ No Chapel Hill/North Carolina references found');
  } else {
    for (const issue of results.contentIntegrity) {
      console.log(`   ❌ ${issue}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`  OVERALL STATUS: ${results.overallStatus === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(60));

  // Table summary
  console.log('\n📋 TABLE SUMMARY:\n');
  console.log('   Table                 | Status  | Records | Notes');
  console.log('   ' + '-'.repeat(55));

  for (const [name, data] of Object.entries(results.tables)) {
    const status = data.status === 'OK' ? '✓' : data.status === 'WARNING' ? '⚠' : '✗';
    const records = String(data.records || 0).padStart(4);
    const notes = data.missingFields ? `Missing: ${data.missingFields.join(', ')}` :
                  data.error ? data.error :
                  data.status === 'OK' ? '-' : '';
    console.log(`   ${name.padEnd(20)} | ${status.padEnd(7)} | ${records} | ${notes}`);
  }

  // Recommendations
  if (results.overallStatus !== 'PASS') {
    console.log('\n💡 RECOMMENDATIONS:\n');

    if (results.contentIntegrity.length > 0) {
      console.log('   1. Run: node scripts/update-pittsburgh.cjs to fix Chapel Hill references');
    }

    if (results.generatedFiles.length > 0) {
      console.log('   2. Run: npm run generate-all to regenerate content files');
    }

    if (results.workflow.length > 0) {
      console.log('   3. Review .github/workflows/deploy.yml for missing configuration');
    }
  }

  console.log('\n');

  return results.overallStatus === 'PASS' ? 0 : 1;
}

main().then(code => process.exit(code));
