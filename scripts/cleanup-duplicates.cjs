/**
 * Cleanup duplicate content in Firestore cmsContent collection
 *
 * This script finds documents with the same field+section combination
 * and removes duplicates, keeping only the most recently updated one.
 *
 * Usage: node scripts/cleanup-duplicates.cjs
 */

const admin = require('firebase-admin')
const path = require('path')

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'planning', 'cjs2026-firebase-adminsdk-fbsvc-f9f29f3c23.json')

try {
  const serviceAccount = require(serviceAccountPath)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
} catch (error) {
  console.error('Error loading service account:', error.message)
  console.log('\nMake sure service-account.json exists in the project root.')
  console.log('You can download it from Firebase Console > Project Settings > Service Accounts')
  process.exit(1)
}

const db = admin.firestore()

async function findAndRemoveDuplicates() {
  console.log('='.repeat(60))
  console.log('  CMS CONTENT DUPLICATE CLEANUP')
  console.log('='.repeat(60))
  console.log('')

  // Fetch all cmsContent documents
  const snapshot = await db.collection('cmsContent').get()
  const docs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))

  console.log(`Found ${docs.length} total documents in cmsContent\n`)

  // Group by field+section combination
  const groups = {}
  docs.forEach(doc => {
    const key = `${doc.section}::${doc.field}`
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(doc)
  })

  // Find groups with duplicates
  const duplicateGroups = Object.entries(groups).filter(([key, items]) => items.length > 1)

  if (duplicateGroups.length === 0) {
    console.log('No duplicates found!')
    process.exit(0)
  }

  console.log(`Found ${duplicateGroups.length} field+section combinations with duplicates:\n`)

  const toDelete = []

  for (const [key, items] of duplicateGroups) {
    const [section, field] = key.split('::')
    console.log(`  ${section} > ${field}: ${items.length} copies`)

    // Sort by updatedAt (newest first), then by createdAt, then by id
    items.sort((a, b) => {
      const aTime = a.updatedAt?.toDate?.()?.getTime() || a.createdAt?.toDate?.()?.getTime() || 0
      const bTime = b.updatedAt?.toDate?.()?.getTime() || b.createdAt?.toDate?.()?.getTime() || 0
      return bTime - aTime
    })

    // Keep the first (newest), mark rest for deletion
    const keep = items[0]
    const remove = items.slice(1)

    console.log(`    Keeping: ${keep.id} (content: "${(keep.content || '').substring(0, 30)}...")`)
    remove.forEach(doc => {
      console.log(`    Removing: ${doc.id}`)
      toDelete.push(doc.id)
    })
    console.log('')
  }

  console.log(`\nTotal documents to delete: ${toDelete.length}`)
  console.log('')

  // Confirm deletion
  const readline = require('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('Proceed with deletion? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() === 'yes') {
      console.log('\nDeleting duplicates...')

      // Delete in batches of 500 (Firestore limit)
      const batchSize = 500
      for (let i = 0; i < toDelete.length; i += batchSize) {
        const batch = db.batch()
        const chunk = toDelete.slice(i, i + batchSize)

        chunk.forEach(docId => {
          batch.delete(db.collection('cmsContent').doc(docId))
        })

        await batch.commit()
        console.log(`  Deleted batch ${Math.floor(i / batchSize) + 1}`)
      }

      console.log(`\n✅ Successfully deleted ${toDelete.length} duplicate documents`)
    } else {
      console.log('\nDeletion cancelled.')
    }

    rl.close()
    process.exit(0)
  })
}

findAndRemoveDuplicates().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
