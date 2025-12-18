/**
 * Grant super_admin role to a user
 *
 * Usage: node scripts/grant-admin-access.cjs <email>
 *
 * Example: node scripts/grant-admin-access.cjs jamditis@gmail.com
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
function initFirebase() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  // Try service account file first
  const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  // Try environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  // Try application default credentials
  try {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: 'cjs2026'
    });
  } catch (e) {
    console.error('Could not initialize Firebase Admin.');
    console.error('Please ensure you have one of:');
    console.error('  1. service-account.json in the project root');
    console.error('  2. FIREBASE_SERVICE_ACCOUNT environment variable');
    console.error('  3. Run: gcloud auth application-default login');
    process.exit(1);
  }
}

async function grantAdminAccess(email) {
  console.log('='.repeat(50));
  console.log('Grant Super Admin Access');
  console.log('='.repeat(50));
  console.log();

  initFirebase();
  const db = admin.firestore();

  try {
    // Find ALL users with this email (there may be multiple due to different auth providers)
    console.log(`Looking for user(s) with email: ${email}`);
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .get();

    if (usersSnapshot.empty) {
      console.error(`\nNo user found with email: ${email}`);
      console.log('\nMake sure the user has signed in at least once.');
      process.exit(1);
    }

    console.log(`\nFound ${usersSnapshot.size} user document(s) with this email:`);

    // Update ALL matching users to super_admin
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const uid = userDoc.id;

      console.log(`\n  UID: ${uid}`);
      console.log(`    Name: ${userData.displayName || '(not set)'}`);
      console.log(`    Current role: ${userData.role || '(none)'}`);

      await db.collection('users').doc(uid).update({
        role: 'super_admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`    -> Updated to super_admin ✓`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('SUCCESS! User is now a super_admin');
    console.log('='.repeat(50));
    console.log('\nThey can now access:');
    console.log('  - /admin page');
    console.log('  - Grant/revoke admin roles for others');
    console.log('  - View all system stats and logs');
    console.log('  - Sync data to Airtable');
    console.log('  - Manage Eventbrite integration');

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/grant-admin-access.cjs <email>');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/grant-admin-access.cjs jamditis@gmail.com');
  process.exit(1);
}

grantAdminAccess(email);
