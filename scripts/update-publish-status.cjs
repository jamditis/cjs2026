/**
 * Update CMS Publish Queue Status
 *
 * Called by GitHub Actions after deployment completes to update the queue status.
 *
 * Usage: node scripts/update-publish-status.cjs <queueId> <status> [commitSha]
 *
 * Status: success | failed
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
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } else {
    throw new Error('No Firebase credentials found');
  }
}

async function updateStatus(queueId, status, commitSha) {
  const db = admin.firestore();

  const updateData = {
    status,
    completedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  if (commitSha) {
    updateData.gitCommitSha = commitSha;
  }

  if (status === 'failed') {
    updateData.error = 'Deployment failed - check GitHub Actions logs';
  }

  await db.collection('cmsPublishQueue').doc(queueId).update(updateData);

  console.log(`Updated queue ${queueId} status to: ${status}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node update-publish-status.cjs <queueId> <status> [commitSha]');
    console.error('Status must be: success | failed');
    process.exit(1);
  }

  const [queueId, status, commitSha] = args;

  if (!['success', 'failed'].includes(status)) {
    console.error('Status must be: success | failed');
    process.exit(1);
  }

  try {
    initFirebase();
    await updateStatus(queueId, status, commitSha);
    process.exit(0);
  } catch (error) {
    console.error('Failed to update status:', error.message);
    process.exit(1);
  }
}

main();
