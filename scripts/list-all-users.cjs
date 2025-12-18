/**
 * List all users and their roles
 */

const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'cjs2026'
});

const db = admin.firestore();

async function listAllUsers() {
  const snapshot = await db.collection('users').get();

  console.log('All users and their roles:');
  console.log('='.repeat(60));

  snapshot.forEach(doc => {
    const data = doc.data();
    const role = data.role || '(none)';
    const isAdminRole = role === 'admin' || role === 'super_admin';
    console.log(`UID: ${doc.id}`);
    console.log(`  Email: ${data.email}`);
    console.log(`  Role: ${role} ${isAdminRole ? '✓ ADMIN' : ''}`);
    console.log('');
  });
}

listAllUsers().then(() => process.exit(0));
