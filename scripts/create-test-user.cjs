/**
 * Create a test user with ALL fields populated
 *
 * Usage: node scripts/create-test-user.cjs
 *
 * This creates a fully populated test user document in Firestore
 * to verify all fields are working correctly.
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You need to download the service account key from Firebase Console:
// Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Test user UID - using a predictable ID for testing
const TEST_USER_UID = 'test-user-all-fields-001';

const testUserProfile = {
  // Core identity
  email: 'testuser@example.com',
  displayName: 'Test McTestface',
  photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',

  // Professional info
  organization: 'Test News Organization',
  jobTitle: 'Senior Test Engineer',

  // Social links
  website: 'testuser.com',
  instagram: 'testuser',
  linkedin: 'testuser',
  bluesky: 'testuser.bsky.social',

  // Registration & status
  registrationStatus: 'registered', // pending, registered, confirmed
  role: null, // null, 'admin', 'super_admin' (system permissions only)
  notifyWhenTicketsAvailable: true,

  // Eventbrite integration
  eventbriteAttendeeId: '1234567890',
  eventbriteOrderId: '9876543210',

  // Schedule features
  savedSessions: ['mon-keynote', 'mon-session-1', 'tue-workshop-1'],
  scheduleVisibility: 'public', // private, attendees_only, public

  // Summit history & badges
  attendedSummits: [2017, 2019, 2022, 2023, 2024, 2025], // 6 summits = super fan
  badges: [
    'collab-veteran',        // Experience
    'role-technologist',     // Role
    'value-open-source',     // Philosophy
    'misc-data-hound',       // Misc
  ],
  customBadges: {
    philosophy: [
      { id: 'custom-phil-1', label: 'coffee powered', emoji: '☕' },
    ],
    misc: [
      { id: 'custom-misc-1', label: 'keyboard warrior', emoji: '⌨️' },
      { id: 'custom-misc-2', label: 'bug hunter', emoji: '🐛' },
    ],
  },

  // Timestamps
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
};

async function createTestUser() {
  try {
    console.log('Creating test user with all fields...');
    console.log('UID:', TEST_USER_UID);

    await db.collection('users').doc(TEST_USER_UID).set(testUserProfile);

    console.log('\n✅ Test user created successfully!\n');
    console.log('--- Test User Profile ---');
    console.log(JSON.stringify(testUserProfile, null, 2));

    // Read it back to verify
    const doc = await db.collection('users').doc(TEST_USER_UID).get();
    console.log('\n--- Verified in Firestore ---');
    console.log('Document exists:', doc.exists);
    console.log('Field count:', Object.keys(doc.data()).length);

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();
