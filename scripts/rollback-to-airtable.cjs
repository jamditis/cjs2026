/**
 * Emergency Rollback to Airtable CMS
 *
 * Use this script if the Firestore CMS migration causes issues.
 * It reverts the content generation to use Airtable and deploys.
 *
 * Usage: node scripts/rollback-to-airtable.cjs
 */

const { execSync } = require('child_process');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function run(command, options = {}) {
  console.log(`   $ ${command}`);
  try {
    execSync(command, {
      cwd: projectRoot,
      stdio: 'inherit',
      ...options
    });
  } catch (error) {
    console.error(`   ✗ Command failed: ${command}`);
    throw error;
  }
}

async function rollback() {
  console.log('='.repeat(60));
  console.log('  EMERGENCY ROLLBACK TO AIRTABLE CMS');
  console.log('='.repeat(60));

  console.log('\n1. Regenerating content from Airtable...');
  run('npm run generate-all');

  console.log('\n2. Building the project...');
  run('npm run build');

  console.log('\n3. Deploying to Firebase Hosting...');
  run('npx firebase deploy --only hosting');

  console.log('\n4. Creating rollback commit...');
  try {
    run('git add .');
    run('git commit -m "Rollback: Revert to Airtable CMS"');
    run('git push');
  } catch (error) {
    console.log('   (Git commit skipped - may have no changes or not a git repo)');
  }

  console.log('\n' + '='.repeat(60));
  console.log('  ✅ ROLLBACK COMPLETE');
  console.log('='.repeat(60));
  console.log(`
The site is now running on Airtable CMS again.

To resume using Firestore CMS:
1. Debug the issue that caused the rollback
2. Re-run: node scripts/migrate-airtable-to-firestore.cjs
3. Update GitHub Actions to use generate-from-firestore.cjs
4. Deploy
`);
}

// Confirm before running
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\n⚠️  This will rollback to Airtable CMS. Continue? (y/N) ', (answer) => {
  rl.close();
  if (answer.toLowerCase() === 'y') {
    rollback().catch((error) => {
      console.error('\n❌ Rollback failed:', error.message);
      process.exit(1);
    });
  } else {
    console.log('   Rollback cancelled.');
    process.exit(0);
  }
});
