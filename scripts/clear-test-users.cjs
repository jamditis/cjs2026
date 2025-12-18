/**
 * Clear test user records from Firestore
 *
 * This script helps clean up test user records. It can:
 * 1. List all users in the users collection
 * 2. Delete specific users by UID
 * 3. Delete ALL non-admin users (use with caution!)
 * 4. Show manual cleanup instructions
 *
 * IMPORTANT: This only clears Firestore documents.
 * To delete Firebase Auth records, use the Firebase Console:
 * https://console.firebase.google.com/project/cjs2026/authentication/users
 *
 * Usage:
 *   node scripts/clear-test-users.cjs list           # List all users
 *   node scripts/clear-test-users.cjs delete <uid>   # Delete specific user
 *   node scripts/clear-test-users.cjs clear-all      # Delete all non-admin users
 *   node scripts/clear-test-users.cjs instructions   # Show manual cleanup instructions
 *
 * Setup:
 *   1. Download service account key from Firebase Console
 *   2. Save as google_credentials.json in project root
 *   3. Or set GOOGLE_APPLICATION_CREDENTIALS environment variable
 */

const path = require('path')
const fs = require('fs')

// Admin emails that should NOT be deleted
const ADMIN_EMAILS = [
  'amditisj@montclair.edu',
  'jamditis@gmail.com',
  'murrays@montclair.edu'
]

function showInstructions() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║           MANUAL CLEANUP INSTRUCTIONS FOR CJS2026                     ║
╚══════════════════════════════════════════════════════════════════════╝

To clear test user records, follow these steps:

STEP 1: Clear Firestore 'users' collection
──────────────────────────────────────────
1. Go to: https://console.firebase.google.com/project/cjs2026/firestore
2. Click on the 'users' collection in the left panel
3. For each test user document you want to delete:
   - Click on the document
   - Click the three-dot menu (⋮) in the top right
   - Select "Delete document"

   ⚠️  DO NOT delete these admin users:
   - amditisj@montclair.edu
   - jamditis@gmail.com
   - murrays@montclair.edu

STEP 2: Clear Firebase Authentication records
─────────────────────────────────────────────
1. Go to: https://console.firebase.google.com/project/cjs2026/authentication/users
2. For each test user you want to delete:
   - Hover over the row
   - Click the three-dot menu (⋮) on the right
   - Select "Delete account"

   ⚠️  DO NOT delete these admin users (same as above)

STEP 3: Verify cleanup
──────────────────────
After deleting, refresh both pages to confirm the records are gone.

NOTE: Admin users (listed above) should keep their records so they
can continue to access the admin panel.

══════════════════════════════════════════════════════════════════════
`)
}

// Check for credentials
const serviceAccountPath = path.join(__dirname, '..', 'google_credentials.json')
const command = process.argv[2]

// If no credentials and not asking for instructions, show setup help
if (!fs.existsSync(serviceAccountPath) && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  if (command === 'instructions') {
    showInstructions()
    process.exit(0)
  }

  console.log('\n⚠️  No Firebase credentials found.\n')
  console.log('To use the automated cleanup features, either:')
  console.log('  1. Download service account key from Firebase Console')
  console.log('     - Go to: https://console.firebase.google.com/project/cjs2026/settings/serviceaccounts/adminsdk')
  console.log('     - Click "Generate new private key"')
  console.log('     - Save as google_credentials.json in project root')
  console.log('  2. Or set GOOGLE_APPLICATION_CREDENTIALS environment variable')
  console.log('\nFor MANUAL cleanup, run:')
  console.log('  node scripts/clear-test-users.cjs instructions\n')
  process.exit(1)
}

// Initialize Firebase Admin only if credentials are available
const admin = require('firebase-admin')

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'cjs2026'
  })
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  admin.initializeApp({
    projectId: 'cjs2026'
  })
}

const db = admin.firestore()

async function listUsers() {
  console.log('\n📋 Listing all users in Firestore...\n')

  const snapshot = await db.collection('users').get()

  if (snapshot.empty) {
    console.log('No users found in the users collection.')
    return []
  }

  const users = []
  snapshot.forEach(doc => {
    const data = doc.data()
    users.push({
      uid: doc.id,
      email: data.email || '(no email)',
      displayName: data.displayName || '(no name)',
      registrationStatus: data.registrationStatus || '(no status)',
      role: data.role || null,
      fieldCount: Object.keys(data).length,
      isAdmin: ADMIN_EMAILS.includes(data.email) || data.role === 'admin' || data.role === 'super_admin'
    })
  })

  console.log(`Found ${users.length} user(s):\n`)
  console.log('UID'.padEnd(30) + 'Email'.padEnd(35) + 'Name'.padEnd(25) + 'Fields  Admin?')
  console.log('-'.repeat(100))

  users.forEach(user => {
    const adminFlag = user.isAdmin ? '✓ ADMIN' : ''
    console.log(
      user.uid.substring(0, 28).padEnd(30) +
      user.email.substring(0, 33).padEnd(35) +
      (user.displayName || '').substring(0, 23).padEnd(25) +
      String(user.fieldCount).padEnd(8) +
      adminFlag
    )
  })

  return users
}

async function deleteUser(uid) {
  console.log(`\n🗑️  Deleting user: ${uid}`)

  const userDoc = await db.collection('users').doc(uid).get()

  if (!userDoc.exists) {
    console.log('User not found in Firestore.')
    return false
  }

  const userData = userDoc.data()
  if (ADMIN_EMAILS.includes(userData.email) || userData.role === 'admin' || userData.role === 'super_admin') {
    console.log('⚠️  This is an admin user. Skipping to protect admin accounts.')
    console.log('   If you really need to delete this user, do it manually in Firebase Console.')
    return false
  }

  await db.collection('users').doc(uid).delete()
  console.log(`✅ Deleted Firestore document for ${userData.email || uid}`)

  console.log('\n⚠️  IMPORTANT: This only deleted the Firestore document.')
  console.log('   To also delete the Firebase Auth record, go to:')
  console.log('   https://console.firebase.google.com/project/cjs2026/authentication/users')
  console.log(`   Search for: ${userData.email || uid}`)

  return true
}

async function clearAllNonAdminUsers() {
  console.log('\n⚠️  CLEARING ALL NON-ADMIN USERS\n')

  const users = await listUsers()
  const nonAdminUsers = users.filter(u => !u.isAdmin)

  if (nonAdminUsers.length === 0) {
    console.log('\nNo non-admin users to delete.')
    return
  }

  console.log(`\n🗑️  Deleting ${nonAdminUsers.length} non-admin user(s)...\n`)

  let deleted = 0
  for (const user of nonAdminUsers) {
    await db.collection('users').doc(user.uid).delete()
    console.log(`  ✅ Deleted: ${user.email}`)
    deleted++
  }

  console.log(`\n✅ Deleted ${deleted} Firestore document(s).`)
  console.log('\n⚠️  IMPORTANT: This only deleted Firestore documents.')
  console.log('   To also delete Firebase Auth records, go to:')
  console.log('   https://console.firebase.google.com/project/cjs2026/authentication/users')
  console.log('\n   UIDs to delete from Auth:')
  nonAdminUsers.forEach(u => console.log(`   - ${u.uid} (${u.email})`))
}

// Main
async function main() {
  const arg = process.argv[3]

  try {
    switch (command) {
      case 'list':
        await listUsers()
        break

      case 'delete':
        if (!arg) {
          console.error('Usage: node scripts/clear-test-users.cjs delete <uid>')
          process.exit(1)
        }
        await deleteUser(arg)
        break

      case 'clear-all':
        // Safety confirmation
        console.log('⚠️  This will delete ALL non-admin users from Firestore!')
        console.log('   Admin emails are protected: ' + ADMIN_EMAILS.join(', '))
        console.log('\n   Press Ctrl+C to cancel, or wait 3 seconds to continue...')
        await new Promise(resolve => setTimeout(resolve, 3000))
        await clearAllNonAdminUsers()
        break

      case 'instructions':
        showInstructions()
        break

      default:
        console.log('Usage:')
        console.log('  node scripts/clear-test-users.cjs list           # List all users')
        console.log('  node scripts/clear-test-users.cjs delete <uid>   # Delete specific user')
        console.log('  node scripts/clear-test-users.cjs clear-all      # Delete all non-admin users')
        console.log('  node scripts/clear-test-users.cjs instructions   # Show manual cleanup instructions')
    }
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  process.exit(0)
}

main()
