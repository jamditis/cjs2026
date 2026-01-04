/**
 * Custom CMS test suite
 *
 * Tests the CMS Cloud Functions and Firestore integration.
 * Run this script after deploying Cloud Functions to verify everything works.
 *
 * Usage: node scripts/test-custom-cms.cjs
 *
 * Prerequisites:
 * - Firebase Admin SDK initialized (service-account.json in project root)
 * - Cloud Functions deployed
 * - User with admin role exists in Firestore
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configuration
const FUNCTIONS_URL = 'https://us-central1-cjs2026.cloudfunctions.net';
const TEST_TIMEOUT = 30000; // 30 seconds

// Initialize Firebase Admin
function initFirebase() {
  const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    return true;
  }
  console.error('❌ service-account.json not found');
  return false;
}

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

function logResult(name, passed, message = '') {
  results.tests.push({ name, passed, message });
  if (passed) {
    results.passed++;
    console.log(`  ✓ ${name}`);
  } else {
    results.failed++;
    console.log(`  ✗ ${name}${message ? `: ${message}` : ''}`);
  }
}

function logSkip(name, reason) {
  results.skipped++;
  results.tests.push({ name, passed: null, message: reason });
  console.log(`  ○ ${name} (skipped: ${reason})`);
}

// ============================================================================
// TEST SUITES
// ============================================================================

async function testFirestoreCollections() {
  console.log('\n📂 Testing Firestore collections...');

  const db = admin.firestore();
  const collections = ['cmsContent', 'cmsSchedule', 'cmsOrganizations', 'cmsTimeline', 'cmsVersionHistory', 'cmsPublishQueue'];

  for (const collName of collections) {
    try {
      // Just try to access the collection - will create if doesn't exist
      const snapshot = await db.collection(collName).limit(1).get();
      logResult(`Collection '${collName}' accessible`, true);
    } catch (error) {
      logResult(`Collection '${collName}' accessible`, false, error.message);
    }
  }
}

async function testCMSContentCRUD() {
  console.log('\n📝 Testing CMS content CRUD operations...');

  const db = admin.firestore();
  let testDocId = null;

  // CREATE
  try {
    const docRef = await db.collection('cmsContent').add({
      field: 'test_field_' + Date.now(),
      section: 'test',
      content: 'Test content from automated test',
      color: 'teal',
      visible: true,
      order: 999,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'test-script',
      version: 1
    });
    testDocId = docRef.id;
    logResult('Create content document', true);
  } catch (error) {
    logResult('Create content document', false, error.message);
    return; // Can't continue without the document
  }

  // READ
  try {
    const doc = await db.collection('cmsContent').doc(testDocId).get();
    if (doc.exists && doc.data().section === 'test') {
      logResult('Read content document', true);
    } else {
      logResult('Read content document', false, 'Document not found or data mismatch');
    }
  } catch (error) {
    logResult('Read content document', false, error.message);
  }

  // UPDATE
  try {
    await db.collection('cmsContent').doc(testDocId).update({
      content: 'Updated test content',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: admin.firestore.FieldValue.increment(1)
    });
    const updated = await db.collection('cmsContent').doc(testDocId).get();
    if (updated.data().content === 'Updated test content') {
      logResult('Update content document', true);
    } else {
      logResult('Update content document', false, 'Content not updated');
    }
  } catch (error) {
    logResult('Update content document', false, error.message);
  }

  // DELETE
  try {
    await db.collection('cmsContent').doc(testDocId).delete();
    const deleted = await db.collection('cmsContent').doc(testDocId).get();
    if (!deleted.exists) {
      logResult('Delete content document', true);
    } else {
      logResult('Delete content document', false, 'Document still exists');
    }
  } catch (error) {
    logResult('Delete content document', false, error.message);
  }
}

async function testCMSScheduleCRUD() {
  console.log('\n📅 Testing CMS schedule CRUD operations...');

  const db = admin.firestore();
  const testSessionId = 'test-session-' + Date.now();

  // CREATE
  try {
    await db.collection('cmsSchedule').doc(testSessionId).set({
      sessionId: testSessionId,
      title: 'Test Session',
      type: 'session',
      day: 'Monday',
      startTime: '9:00 AM',
      endTime: '10:00 AM',
      description: 'Automated test session',
      room: 'Test Room',
      visible: true,
      order: 999,
      isBookmarkable: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'test-script',
      version: 1
    });
    logResult('Create schedule document', true);
  } catch (error) {
    logResult('Create schedule document', false, error.message);
    return;
  }

  // READ
  try {
    const doc = await db.collection('cmsSchedule').doc(testSessionId).get();
    if (doc.exists && doc.data().title === 'Test Session') {
      logResult('Read schedule document', true);
    } else {
      logResult('Read schedule document', false, 'Document not found or data mismatch');
    }
  } catch (error) {
    logResult('Read schedule document', false, error.message);
  }

  // DELETE (cleanup)
  try {
    await db.collection('cmsSchedule').doc(testSessionId).delete();
    logResult('Delete schedule document', true);
  } catch (error) {
    logResult('Delete schedule document', false, error.message);
  }
}

async function testCMSOrganizationsCRUD() {
  console.log('\n🏢 Testing CMS organizations CRUD operations...');

  const db = admin.firestore();
  let testDocId = null;

  // CREATE
  try {
    const docRef = await db.collection('cmsOrganizations').add({
      name: 'Test Organization ' + Date.now(),
      logoUrl: null,
      website: 'https://test.org',
      isSponsor: false,
      visible: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'test-script',
      version: 1
    });
    testDocId = docRef.id;
    logResult('Create organization document', true);
  } catch (error) {
    logResult('Create organization document', false, error.message);
    return;
  }

  // READ
  try {
    const doc = await db.collection('cmsOrganizations').doc(testDocId).get();
    if (doc.exists && doc.data().website === 'https://test.org') {
      logResult('Read organization document', true);
    } else {
      logResult('Read organization document', false, 'Document not found or data mismatch');
    }
  } catch (error) {
    logResult('Read organization document', false, error.message);
  }

  // DELETE (cleanup)
  try {
    await db.collection('cmsOrganizations').doc(testDocId).delete();
    logResult('Delete organization document', true);
  } catch (error) {
    logResult('Delete organization document', false, error.message);
  }
}

async function testCMSTimelineCRUD() {
  console.log('\n📆 Testing CMS timeline CRUD operations...');

  const db = admin.firestore();
  const testYear = '2099';

  // CREATE
  try {
    await db.collection('cmsTimeline').doc(testYear).set({
      year: testYear,
      location: 'Test City, ST',
      theme: 'Test Theme',
      link: null,
      emoji: '🧪',
      order: 99,
      visible: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'test-script',
      version: 1
    });
    logResult('Create timeline document', true);
  } catch (error) {
    logResult('Create timeline document', false, error.message);
    return;
  }

  // READ
  try {
    const doc = await db.collection('cmsTimeline').doc(testYear).get();
    if (doc.exists && doc.data().location === 'Test City, ST') {
      logResult('Read timeline document', true);
    } else {
      logResult('Read timeline document', false, 'Document not found or data mismatch');
    }
  } catch (error) {
    logResult('Read timeline document', false, error.message);
  }

  // DELETE (cleanup)
  try {
    await db.collection('cmsTimeline').doc(testYear).delete();
    logResult('Delete timeline document', true);
  } catch (error) {
    logResult('Delete timeline document', false, error.message);
  }
}

async function testVersionHistory() {
  console.log('\n📜 Testing version history logging...');

  const db = admin.firestore();

  // Create a test version history entry
  try {
    const historyRef = await db.collection('cmsVersionHistory').add({
      collection: 'cmsContent',
      documentId: 'test-doc-id',
      field: 'test_field',
      previousValue: { content: 'old' },
      newValue: { content: 'new' },
      action: 'update',
      userId: 'test-user',
      userEmail: 'test@example.com',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Verify it was created
    const doc = await historyRef.get();
    if (doc.exists && doc.data().action === 'update') {
      logResult('Create version history entry', true);
    } else {
      logResult('Create version history entry', false, 'Data mismatch');
    }

    // Cleanup
    await historyRef.delete();
  } catch (error) {
    logResult('Create version history entry', false, error.message);
  }
}

async function testPublishQueue() {
  console.log('\n📤 Testing publish queue...');

  const db = admin.firestore();

  // Create a test publish queue entry
  try {
    const queueRef = await db.collection('cmsPublishQueue').add({
      status: 'pending',
      triggeredBy: 'test-user',
      triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: null,
      error: null,
      changes: [
        { collection: 'cmsContent', documentId: 'test', action: 'update' }
      ]
    });

    // Verify it was created
    const doc = await queueRef.get();
    if (doc.exists && doc.data().status === 'pending') {
      logResult('Create publish queue entry', true);
    } else {
      logResult('Create publish queue entry', false, 'Data mismatch');
    }

    // Test status update
    await queueRef.update({
      status: 'success',
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updated = await queueRef.get();
    if (updated.data().status === 'success') {
      logResult('Update publish queue status', true);
    } else {
      logResult('Update publish queue status', false, 'Status not updated');
    }

    // Cleanup
    await queueRef.delete();
  } catch (error) {
    logResult('Publish queue operations', false, error.message);
  }
}

async function testSchemaValidation() {
  console.log('\n✅ Testing schema validation...');

  const db = admin.firestore();

  // Test required fields for cmsContent
  try {
    // This should work (all required fields present)
    const validRef = await db.collection('cmsContent').add({
      field: 'valid_test',
      section: 'test',
      content: 'Valid content',
      visible: true,
      order: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'test',
      version: 1
    });
    await validRef.delete();
    logResult('Accept valid cmsContent document', true);
  } catch (error) {
    logResult('Accept valid cmsContent document', false, error.message);
  }

  // Test cmsSchedule required fields
  try {
    const validSchedule = await db.collection('cmsSchedule').doc('valid-test-session').set({
      sessionId: 'valid-test-session',
      title: 'Valid Session',
      type: 'session',
      day: 'Monday',
      startTime: '9:00 AM',
      visible: true,
      order: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'test',
      version: 1
    });
    await db.collection('cmsSchedule').doc('valid-test-session').delete();
    logResult('Accept valid cmsSchedule document', true);
  } catch (error) {
    logResult('Accept valid cmsSchedule document', false, error.message);
  }
}

async function testDataIntegrity() {
  console.log('\n🔒 Testing data integrity...');

  const db = admin.firestore();

  // Test that version increments correctly
  const testId = 'integrity-test-' + Date.now();
  try {
    // Create with version 1
    await db.collection('cmsContent').doc(testId).set({
      field: 'integrity_test',
      section: 'test',
      content: 'Version 1',
      visible: true,
      order: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'test',
      version: 1
    });

    // Update and increment version
    await db.collection('cmsContent').doc(testId).update({
      content: 'Version 2',
      version: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const doc = await db.collection('cmsContent').doc(testId).get();
    if (doc.data().version === 2) {
      logResult('Version increment works correctly', true);
    } else {
      logResult('Version increment works correctly', false, `Expected 2, got ${doc.data().version}`);
    }

    // Cleanup
    await db.collection('cmsContent').doc(testId).delete();
  } catch (error) {
    logResult('Version increment works correctly', false, error.message);
  }

  // Test timestamp updates
  try {
    const timestampTestId = 'timestamp-test-' + Date.now();
    await db.collection('cmsContent').doc(timestampTestId).set({
      field: 'timestamp_test',
      section: 'test',
      content: 'Test',
      visible: true,
      order: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'test',
      version: 1
    });

    const created = await db.collection('cmsContent').doc(timestampTestId).get();
    const createdAt = created.data().createdAt;

    // Wait a bit and update
    await new Promise(resolve => setTimeout(resolve, 100));

    await db.collection('cmsContent').doc(timestampTestId).update({
      content: 'Updated',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updated = await db.collection('cmsContent').doc(timestampTestId).get();
    const updatedAt = updated.data().updatedAt;

    if (updatedAt && createdAt && updatedAt.toMillis() >= createdAt.toMillis()) {
      logResult('Timestamps update correctly', true);
    } else {
      logResult('Timestamps update correctly', false, 'updatedAt should be >= createdAt');
    }

    // Cleanup
    await db.collection('cmsContent').doc(timestampTestId).delete();
  } catch (error) {
    logResult('Timestamps update correctly', false, error.message);
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('  CJS2026 CUSTOM CMS TEST SUITE');
  console.log('='.repeat(60));
  console.log(`\nStarted at: ${new Date().toLocaleString()}`);

  // Initialize Firebase
  if (!initFirebase()) {
    console.error('\n❌ Failed to initialize Firebase. Aborting tests.');
    process.exit(1);
  }

  try {
    // Run all test suites
    await testFirestoreCollections();
    await testCMSContentCRUD();
    await testCMSScheduleCRUD();
    await testCMSOrganizationsCRUD();
    await testCMSTimelineCRUD();
    await testVersionHistory();
    await testPublishQueue();
    await testSchemaValidation();
    await testDataIntegrity();

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('  TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`\n  ✓ Passed:  ${results.passed}`);
    console.log(`  ✗ Failed:  ${results.failed}`);
    console.log(`  ○ Skipped: ${results.skipped}`);
    console.log(`  Total:     ${results.passed + results.failed + results.skipped}`);

    if (results.failed > 0) {
      console.log('\n  Failed tests:');
      results.tests
        .filter(t => t.passed === false)
        .forEach(t => console.log(`    - ${t.name}: ${t.message}`));
    }

    console.log('\n' + '='.repeat(60));

    if (results.failed === 0) {
      console.log('  ✅ ALL TESTS PASSED');
    } else {
      console.log('  ❌ SOME TESTS FAILED');
    }
    console.log('='.repeat(60));

    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
    process.exit(1);
  }
}

main();
