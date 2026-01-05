/**
 * Fix sponsors page headline in Firestore CMS
 *
 * This script corrects the sponsors page_headline from "Dashboard" to "Sponsors"
 * Run: node scripts/fix-sponsors-headline.cjs
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'planning', 'cjs2026-firebase-adminsdk-fbsvc-f9f29f3c23.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (err) {
  console.error('Could not load service account. Make sure the file exists at:');
  console.error(serviceAccountPath);
  console.error('\nAlternatively, you can fix this in the admin panel:');
  console.error('1. Go to https://summit.collaborativejournalism.org/admin');
  console.error('2. Click CMS tab → Site content');
  console.error('3. Find sponsors → page_headline');
  console.error('4. Change "Dashboard" to "Sponsors"');
  console.error('5. Click Publish');
  process.exit(1);
}

const db = admin.firestore();

async function fixSponsorsHeadline() {
  console.log('Searching for sponsors page_headline in cmsContent...\n');

  // Find the document with section=sponsors and field=page_headline
  const snapshot = await db.collection('cmsContent')
    .where('section', '==', 'sponsors')
    .where('field', '==', 'page_headline')
    .get();

  if (snapshot.empty) {
    console.log('No matching document found. Trying alternate query...');

    // Try finding by just section
    const altSnapshot = await db.collection('cmsContent')
      .where('section', '==', 'sponsors')
      .get();

    if (altSnapshot.empty) {
      console.log('No sponsors section found in cmsContent.');
      return;
    }

    console.log(`Found ${altSnapshot.size} sponsors documents:`);
    altSnapshot.forEach(doc => {
      console.log(`  - ${doc.id}: ${JSON.stringify(doc.data())}`);
    });
    return;
  }

  const doc = snapshot.docs[0];
  const currentData = doc.data();

  console.log('Found document:', doc.id);
  console.log('Current content:', currentData.content);

  if (currentData.content === 'Sponsors') {
    console.log('\n✅ Already fixed! Content is already "Sponsors".');
    return;
  }

  if (currentData.content !== 'Dashboard') {
    console.log(`\n⚠️  Unexpected content: "${currentData.content}"`);
    console.log('Expected "Dashboard". Skipping to avoid overwriting.');
    return;
  }

  // Update the document
  console.log('\nUpdating "Dashboard" → "Sponsors"...');

  await db.collection('cmsContent').doc(doc.id).update({
    content: 'Sponsors',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: 'script-fix'
  });

  console.log('✅ Fixed! Sponsors page headline updated to "Sponsors".');
  console.log('\n⚠️  IMPORTANT: You still need to publish to make this live:');
  console.log('   1. Go to https://summit.collaborativejournalism.org/admin');
  console.log('   2. Click "Publish to production" in the CMS tab');
}

fixSponsorsHeadline()
  .then(() => {
    console.log('\nDone.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
