/**
 * Populate cmsTimeline collection from cmsContent timeline section
 *
 * The migration script couldn't properly parse the timeline data because
 * it's stored as individual fields (2017_year, 2017_location, etc.) rather
 * than grouped records.
 *
 * This script extracts the timeline data from cmsContent and creates
 * proper timeline documents in cmsTimeline collection.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
function initFirebase() {
  const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase initialized with service account');
  } else {
    throw new Error('service-account.json not found');
  }
}

async function populateTimeline() {
  const db = admin.firestore();

  // Fetch all timeline content from cmsContent
  const snapshot = await db.collection('cmsContent')
    .where('section', '==', 'timeline')
    .get();

  console.log(`Found ${snapshot.docs.length} timeline content items`);

  // Group by year
  const years = {};
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const field = data.field;

    // Parse field name like "2017_year", "2017_location", "2017_theme", "2017_link"
    const match = field.match(/^(\d{4})_(\w+)$/);
    if (!match) return;

    const [, year, prop] = match;
    if (!years[year]) {
      years[year] = { year };
    }

    // Map field names to properties
    if (prop === 'year') years[year].yearDisplay = data.content;
    else if (prop === 'location') years[year].location = data.content;
    else if (prop === 'theme') years[year].theme = data.content;
    else if (prop === 'link') years[year].link = data.content;

    // Capture color from any of the fields
    if (data.color && !years[year].color) {
      years[year].color = data.color;
    }
  });

  console.log(`Parsed ${Object.keys(years).length} years of timeline data`);

  // Create timeline documents
  let created = 0;
  for (const [year, data] of Object.entries(years).sort((a, b) => a[0].localeCompare(b[0]))) {
    const docData = {
      year,
      location: data.location || '',
      theme: data.theme || '',
      link: data.link || null,
      emoji: getEmojiForYear(year),
      order: parseInt(year) - 2017 + 1,
      visible: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'migration',
      version: 1
    };

    await db.collection('cmsTimeline').doc(year).set(docData);
    console.log(`  ✓ ${year}: ${data.location} - "${data.theme}"`);
    created++;
  }

  console.log(`\n✅ Created ${created} timeline entries in cmsTimeline collection`);
}

function getEmojiForYear(year) {
  const emojis = {
    '2017': '🎓',  // Inaugural
    '2018': '🎓',  // Montclair again
    '2019': '🔔',  // Philadelphia
    '2020': '🏠',  // Virtual (pandemic)
    '2021': '💻',  // Virtual (pandemic)
    '2022': '🌆',  // Chicago
    '2023': '🏛️',  // Washington, D.C.
    '2024': '🚗',  // Detroit
    '2025': '🏔️',  // Denver
    '2026': '🎉',  // Pittsburgh (10th anniversary)
  };
  return emojis[year] || '';
}

async function main() {
  console.log('='.repeat(60));
  console.log('  POPULATE CMS TIMELINE FROM CONTENT');
  console.log('='.repeat(60));

  try {
    initFirebase();
    await populateTimeline();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
