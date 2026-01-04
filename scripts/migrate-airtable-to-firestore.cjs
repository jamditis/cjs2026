/**
 * Migrate Airtable data to Firestore CMS collections
 *
 * This is a ONE-TIME migration script. Run after Firestore rules are deployed.
 *
 * Usage: node scripts/migrate-airtable-to-firestore.cjs
 *
 * Prerequisites:
 * - AIRTABLE_API_KEY in .env or environment
 * - service-account.json in project root
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Airtable config
const AIRTABLE_BASE_ID = 'appL8Sn87xUotm4jF';
const AIRTABLE_SITE_CONTENT_TABLE = 'tblTZ0F89UMTO8PO0';
const AIRTABLE_SCHEDULE_TABLE = 'Schedule';
const AIRTABLE_ORGANIZATIONS_TABLE = 'Organizations';

// Load environment
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

// Initialize Firebase Admin
function initFirebase() {
  const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } else {
    // Try to use the default Firebase project from gcloud/firebase CLI
    admin.initializeApp({
      projectId: 'cjs2026'
    });
  }
}

async function fetchAirtable(tableId, options = {}) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`);
  if (options.filterByFormula) {
    url.searchParams.append('filterByFormula', options.filterByFormula);
  }

  const response = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${API_KEY}` }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Airtable error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Handle pagination
  let allRecords = data.records;
  let offset = data.offset;

  while (offset) {
    const nextUrl = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`);
    nextUrl.searchParams.append('offset', offset);
    if (options.filterByFormula) {
      nextUrl.searchParams.append('filterByFormula', options.filterByFormula);
    }

    const nextResponse = await fetch(nextUrl.toString(), {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const nextData = await nextResponse.json();
    allRecords = allRecords.concat(nextData.records);
    offset = nextData.offset;
  }

  return allRecords;
}

async function migrateSiteContent() {
  console.log('\n1. Migrating Site Content...');
  const db = admin.firestore();

  const records = await fetchAirtable(AIRTABLE_SITE_CONTENT_TABLE);
  console.log(`   Found ${records.length} records in Airtable`);

  let migrated = 0;
  let skipped = 0;

  for (const record of records) {
    const fields = record.fields;

    // Skip if no field identifier
    if (!fields.Field) {
      skipped++;
      continue;
    }

    // Determine if this is timeline data
    const section = (fields.Section || 'general').toLowerCase();

    const docData = {
      field: fields.Field,
      section,
      content: fields.Content || '',
      page: fields.Page || null,
      component: fields.Component || null,
      color: (fields.Color || 'ink').toLowerCase(),
      order: fields.Order || 0,
      visible: fields.Visible !== false,
      link: fields.Link || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'migration',
      version: 1,
      airtableId: record.id  // Keep reference for debugging
    };

    await db.collection('cmsContent').add(docData);
    migrated++;
  }

  console.log(`   ✓ Migrated ${migrated} content items (${skipped} skipped)`);
}

async function migrateTimeline() {
  console.log('\n2. Migrating Timeline (from Site Content timeline section)...');
  const db = admin.firestore();

  // Timeline data is embedded in Site Content with Section='timeline'
  const records = await fetchAirtable(AIRTABLE_SITE_CONTENT_TABLE, {
    filterByFormula: '{Section}="timeline"'
  });

  console.log(`   Found ${records.length} timeline records`);

  // Group by year (Field contains year like "2017")
  const yearData = {};
  for (const record of records) {
    const fields = record.fields;
    const year = fields.Field;

    if (!year || !year.match(/^\d{4}$/)) continue;

    yearData[year] = {
      location: fields.Content || '',
      link: fields.Link || null,
      order: fields.Order || 0
    };
  }

  let migrated = 0;
  for (const [year, data] of Object.entries(yearData)) {
    const docData = {
      year,
      location: data.location,
      theme: '',  // Will need to be filled in manually
      link: data.link,
      emoji: '',
      order: data.order || parseInt(year) - 2017 + 1,
      visible: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'migration',
      version: 1
    };

    await db.collection('cmsTimeline').doc(year).set(docData);
    migrated++;
  }

  console.log(`   ✓ Migrated ${migrated} timeline entries`);
}

async function migrateSchedule() {
  console.log('\n3. Migrating Schedule...');
  const db = admin.firestore();

  const records = await fetchAirtable(AIRTABLE_SCHEDULE_TABLE);
  console.log(`   Found ${records.length} sessions`);

  let migrated = 0;
  let order = 1;

  for (const record of records) {
    const fields = record.fields;

    // Skip if no title
    if (!fields['Session title']) continue;

    // Generate session ID
    const sessionId = fields.session_id ||
      `session-${(fields.Day || 'mon').toLowerCase().substring(0, 3)}-${order}`;

    const docData = {
      sessionId,
      title: fields['Session title'] || '',
      type: (fields.Type || 'session').toLowerCase(),
      day: fields.Day || fields.day || 'Monday',
      startTime: fields['Start time'] || fields.start_time || '',
      endTime: fields['End time'] || fields.end_time || null,
      description: fields.Description || fields.description || '',
      room: fields.Room || fields.room || null,
      speakers: fields.Speakers || fields.speakers || null,
      speakerOrgs: fields['Speaker orgs'] || fields.speaker_orgs || null,
      track: fields.Track || fields.track || null,
      order: fields.Order || fields.order || order,
      visible: fields.Visible !== false && fields.visible !== false,
      isBookmarkable: fields.is_bookmarkable !== false,
      color: fields.color || 'teal',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'migration',
      version: 1,
      airtableId: record.id
    };

    await db.collection('cmsSchedule').doc(sessionId).set(docData);
    migrated++;
    order++;
  }

  console.log(`   ✓ Migrated ${migrated} sessions`);
}

async function migrateOrganizations() {
  console.log('\n4. Migrating Organizations...');
  const db = admin.firestore();

  const records = await fetchAirtable(AIRTABLE_ORGANIZATIONS_TABLE);
  console.log(`   Found ${records.length} organizations`);

  let migrated = 0;

  for (const record of records) {
    const fields = record.fields;

    // Skip if no name
    if (!fields.Name) continue;

    // Handle logo attachment
    let logoUrl = null;
    if (fields.Logo && fields.Logo[0]) {
      logoUrl = fields.Logo[0].url;
      // Note: Airtable attachment URLs expire. For production, download and re-upload to Firebase Storage.
    }

    // Handle sponsor tier - could be string, array, or object
    let sponsorTier = fields['Sponsor tier'];
    if (Array.isArray(sponsorTier)) sponsorTier = sponsorTier[0];
    if (typeof sponsorTier === 'object' && sponsorTier !== null) sponsorTier = sponsorTier.name || '';
    if (typeof sponsorTier === 'string') sponsorTier = sponsorTier.toLowerCase();
    else sponsorTier = null;

    const docData = {
      name: fields.Name,
      logoUrl,
      logoPath: null,  // Will be set when uploaded to Firebase Storage
      website: fields.Website || null,
      isSponsor: fields.Sponsor === true,
      sponsorTier: sponsorTier || null,
      sponsorOrder: fields['Sponsor order'] || 99,
      description: fields.Description || '',
      type: fields.Type || null,
      visible: fields.Visible !== false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'migration',
      version: 1,
      airtableId: record.id
    };

    await db.collection('cmsOrganizations').add(docData);
    migrated++;
  }

  console.log(`   ✓ Migrated ${migrated} organizations`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('  AIRTABLE TO FIRESTORE MIGRATION');
  console.log('='.repeat(60));
  console.log('\n⚠️  This is a ONE-TIME migration. Run only once!\n');

  try {
    initFirebase();

    await migrateSiteContent();
    await migrateTimeline();
    await migrateSchedule();
    await migrateOrganizations();

    console.log('\n' + '='.repeat(60));
    console.log('  ✅ MIGRATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`
Next steps:
1. Verify data in Firebase Console: https://console.firebase.google.com
2. Run test generation: node scripts/generate-from-firestore.cjs
3. Deploy Cloud Functions: firebase deploy --only functions
4. Update GitHub Actions workflow to use Firestore
5. Test publish flow end-to-end
6. For sponsor logos, download from Airtable and upload to Firebase Storage
`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
