/**
 * CMS Stress Test Suite
 *
 * Comprehensive tests to verify the Airtable CMS integration
 * is production-ready and handles edge cases correctly.
 *
 * Usage: node scripts/stress-test-cms.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RESULTS = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function test(name, fn) {
  try {
    const result = fn();
    if (result === true) {
      RESULTS.passed++;
      RESULTS.tests.push({ name, status: 'PASS' });
      console.log(`   ✓ ${name}`);
    } else if (result === 'warning') {
      RESULTS.warnings++;
      RESULTS.tests.push({ name, status: 'WARN' });
      console.log(`   ⚠ ${name}`);
    } else {
      RESULTS.failed++;
      RESULTS.tests.push({ name, status: 'FAIL', reason: result });
      console.log(`   ✗ ${name}: ${result}`);
    }
  } catch (e) {
    RESULTS.failed++;
    RESULTS.tests.push({ name, status: 'ERROR', reason: e.message });
    console.log(`   ✗ ${name}: ${e.message}`);
  }
}

// ============================================
// TEST SUITE 1: Generated File Validation
// ============================================
function testGeneratedFiles() {
  console.log('\n📁 TEST SUITE 1: Generated File Validation\n');

  const files = [
    'src/content/siteContent.js',
    'src/content/scheduleData.js',
    'src/content/organizationsData.js',
  ];

  for (const file of files) {
    const fullPath = path.join(__dirname, '..', file);
    const name = path.basename(file);

    // Test: File exists
    test(`${name} exists`, () => {
      if (!fs.existsSync(fullPath)) return `File not found: ${file}`;
      return true;
    });

    // Test: File is not empty
    test(`${name} is not empty`, () => {
      const stat = fs.statSync(fullPath);
      if (stat.size < 100) return `File too small: ${stat.size} bytes`;
      return true;
    });

    // Test: File is valid JavaScript (can be required)
    test(`${name} is valid JavaScript`, () => {
      try {
        // Clear require cache first
        delete require.cache[require.resolve(fullPath)];
        require(fullPath);
        return true;
      } catch (e) {
        return `Parse error: ${e.message}`;
      }
    });

    // Test: File has expected exports
    test(`${name} has expected exports`, () => {
      const module = require(fullPath);
      if (name === 'siteContent.js') {
        if (!module.sections) return 'Missing: sections';
        if (!module.getContent) return 'Missing: getContent function';
        if (!module.timeline) return 'Missing: timeline';
        if (!module.stats) return 'Missing: stats';
      } else if (name === 'scheduleData.js') {
        if (!module.sessions) return 'Missing: sessions';
        if (!module.getSessionById) return 'Missing: getSessionById function';
      } else if (name === 'organizationsData.js') {
        if (!module.sponsors) return 'Missing: sponsors';
        if (typeof module.hasSponsors !== 'function') return 'Missing: hasSponsors function';
      }
      return true;
    });
  }
}

// ============================================
// TEST SUITE 2: Content Integrity
// ============================================
function testContentIntegrity() {
  console.log('\n🔍 TEST SUITE 2: Content Integrity\n');

  const siteContentPath = path.join(__dirname, '..', 'src/content/siteContent.js');
  const content = require(siteContentPath);

  // Test: No Chapel Hill references
  test('No Chapel Hill references in sections', () => {
    const json = JSON.stringify(content.sections);
    if (json.toLowerCase().includes('chapel hill')) {
      return 'Found "Chapel Hill" in sections';
    }
    return true;
  });

  // Test: Pittsburgh references exist
  test('Pittsburgh references exist', () => {
    const json = JSON.stringify(content.sections);
    if (!json.includes('Pittsburgh')) {
      return 'No Pittsburgh references found';
    }
    return true;
  });

  // Test: Required sections exist
  test('Required sections exist', () => {
    const required = ['details', 'footer', 'timeline', 'stats'];
    const missing = required.filter(s => !content.sections[s]);
    if (missing.length > 0) return `Missing sections: ${missing.join(', ')}`;
    return true;
  });

  // Test: Details section has required fields
  test('Details section has required fields', () => {
    const details = content.sections.details || {};
    const required = ['headline', 'tagline', 'location'];
    const missing = required.filter(f => !details[f]);
    if (missing.length > 0) return `Missing fields: ${missing.join(', ')}`;
    return true;
  });

  // Test: Timeline has entries
  test('Timeline has at least 5 entries', () => {
    if (!content.timeline || content.timeline.length < 5) {
      return `Only ${content.timeline?.length || 0} timeline entries`;
    }
    return true;
  });

  // Test: Stats has entries
  test('Stats has at least 3 entries', () => {
    if (!content.stats || content.stats.length < 3) {
      return `Only ${content.stats?.length || 0} stats entries`;
    }
    return true;
  });

  // Test: getContent function works
  test('getContent() returns expected values', () => {
    const headline = content.getContent('details', 'headline', 'fallback');
    if (headline === 'fallback') return 'getContent returned fallback for headline';
    if (!headline || headline.length < 5) return `Unexpected headline: "${headline}"`;
    return true;
  });

  // Test: getContent fallback works
  test('getContent() fallback works for missing field', () => {
    const missing = content.getContent('nonexistent', 'field', 'my-fallback');
    if (missing !== 'my-fallback') return `Expected "my-fallback", got "${missing}"`;
    return true;
  });
}

// ============================================
// TEST SUITE 3: Schedule Data
// ============================================
function testScheduleData() {
  console.log('\n📅 TEST SUITE 3: Schedule Data\n');

  const schedulePath = path.join(__dirname, '..', 'src/content/scheduleData.js');
  const schedule = require(schedulePath);

  // Test: Sessions array exists and has items
  test('Sessions array exists', () => {
    if (!Array.isArray(schedule.sessions)) return 'sessions is not an array';
    return true;
  });

  // Test: Each session has required fields
  test('Sessions have required fields', () => {
    for (const session of schedule.sessions) {
      if (!session.id) return `Session missing id: ${JSON.stringify(session).substring(0, 50)}`;
      if (!session.title) return `Session missing title: ${session.id}`;
      if (!session.day) return `Session missing day: ${session.id}`;
    }
    return true;
  });

  // Test: getSessionById works
  test('getSessionById() works', () => {
    if (schedule.sessions.length === 0) return 'warning'; // No sessions to test
    const firstId = schedule.sessions[0].id;
    const found = schedule.getSessionById(firstId);
    if (!found) return `Could not find session by id: ${firstId}`;
    return true;
  });

  // Test: sessionsByDay is populated
  test('sessionsByDay has monday/tuesday', () => {
    if (!schedule.sessionsByDay) return 'sessionsByDay is missing';
    if (!schedule.sessionsByDay.monday) return 'monday sessions missing';
    if (!schedule.sessionsByDay.tuesday) return 'tuesday sessions missing';
    return true;
  });
}

// ============================================
// TEST SUITE 4: Organizations Data
// ============================================
function testOrganizationsData() {
  console.log('\n🏢 TEST SUITE 4: Organizations Data\n');

  const orgsPath = path.join(__dirname, '..', 'src/content/organizationsData.js');
  const orgs = require(orgsPath);

  // Test: sponsors array exists
  test('sponsors array exists', () => {
    if (!Array.isArray(orgs.sponsors)) return 'sponsors is not an array';
    return true;
  });

  // Test: hasSponsors function works
  test('hasSponsors() function works', () => {
    const result = orgs.hasSponsors();
    if (typeof result !== 'boolean') return `hasSponsors returned ${typeof result}`;
    return true;
  });

  // Test: sponsorsByTier exists
  test('sponsorsByTier object exists', () => {
    if (typeof orgs.sponsorsByTier !== 'object') return 'sponsorsByTier is not an object';
    return true;
  });

  // Test: Each sponsor has required fields
  test('Sponsors have required fields', () => {
    for (const sponsor of orgs.sponsors) {
      if (!sponsor.id) return `Sponsor missing id`;
      if (!sponsor.name) return `Sponsor missing name: ${sponsor.id}`;
    }
    return true;
  });
}

// ============================================
// TEST SUITE 5: Fresh Generation Test
// ============================================
async function testFreshGeneration() {
  console.log('\n🔄 TEST SUITE 5: Fresh Generation Test\n');

  // Backup current files
  const files = [
    'src/content/siteContent.js',
    'src/content/scheduleData.js',
    'src/content/organizationsData.js',
  ];

  const backups = {};
  for (const file of files) {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      backups[file] = fs.readFileSync(fullPath, 'utf-8');
    }
  }

  test('Backup files created', () => {
    if (Object.keys(backups).length < 3) return 'Could not backup all files';
    return true;
  });

  // Run generate-all
  test('npm run generate-all succeeds', () => {
    try {
      execSync('npm run generate-all', {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
        timeout: 60000
      });
      return true;
    } catch (e) {
      return `Command failed: ${e.message}`;
    }
  });

  // Verify files were regenerated
  test('Files were regenerated', () => {
    for (const file of files) {
      const fullPath = path.join(__dirname, '..', file);
      if (!fs.existsSync(fullPath)) return `${file} not found after regeneration`;

      const newContent = fs.readFileSync(fullPath, 'utf-8');
      // Check it has the generation timestamp comment
      if (!newContent.includes('Generated:')) return `${file} missing generation timestamp`;
    }
    return true;
  });

  // Clear require cache and re-test
  for (const file of files) {
    const fullPath = path.join(__dirname, '..', file);
    delete require.cache[require.resolve(fullPath)];
  }

  test('Regenerated files are valid JavaScript', () => {
    for (const file of files) {
      const fullPath = path.join(__dirname, '..', file);
      try {
        require(fullPath);
      } catch (e) {
        return `${file} parse error: ${e.message}`;
      }
    }
    return true;
  });
}

// ============================================
// TEST SUITE 6: Build Test
// ============================================
function testBuild() {
  console.log('\n🏗️ TEST SUITE 6: Build Test\n');

  test('npm run build succeeds', () => {
    try {
      execSync('npm run build', {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
        timeout: 120000
      });
      return true;
    } catch (e) {
      return `Build failed: ${e.stderr?.toString().substring(0, 200) || e.message}`;
    }
  });

  test('dist/index.html exists', () => {
    const distIndex = path.join(__dirname, '..', 'dist', 'index.html');
    if (!fs.existsSync(distIndex)) return 'dist/index.html not found';
    return true;
  });

  test('dist/assets contains JS bundle', () => {
    const assetsDir = path.join(__dirname, '..', 'dist', 'assets');
    if (!fs.existsSync(assetsDir)) return 'dist/assets not found';

    const files = fs.readdirSync(assetsDir);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    if (jsFiles.length === 0) return 'No JS files in dist/assets';
    return true;
  });

  test('dist/assets contains CSS bundle', () => {
    const assetsDir = path.join(__dirname, '..', 'dist', 'assets');
    const files = fs.readdirSync(assetsDir);
    const cssFiles = files.filter(f => f.endsWith('.css'));
    if (cssFiles.length === 0) return 'No CSS files in dist/assets';
    return true;
  });
}

// ============================================
// TEST SUITE 7: GitHub Actions Simulation
// ============================================
function testGitHubActionsSimulation() {
  console.log('\n🔄 TEST SUITE 7: GitHub Actions Simulation\n');

  // Test: Workflow file exists
  test('.github/workflows/deploy.yml exists', () => {
    const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'deploy.yml');
    if (!fs.existsSync(workflowPath)) return 'Workflow file not found';
    return true;
  });

  // Test: Workflow has required steps
  test('Workflow has generate-all step', () => {
    const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'deploy.yml');
    const content = fs.readFileSync(workflowPath, 'utf-8');
    if (!content.includes('generate-all')) return 'Missing generate-all command';
    return true;
  });

  // Test: Workflow references AIRTABLE_API_KEY
  test('Workflow uses AIRTABLE_API_KEY secret', () => {
    const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'deploy.yml');
    const content = fs.readFileSync(workflowPath, 'utf-8');
    if (!content.includes('AIRTABLE_API_KEY')) return 'Missing AIRTABLE_API_KEY reference';
    return true;
  });

  // Test: Environment variables in .env match what workflow expects
  test('Local .env has AIRTABLE key', () => {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) return '.env file not found';

    const content = fs.readFileSync(envPath, 'utf-8');
    if (!content.includes('AIRTABLE')) return '.env missing AIRTABLE key';
    return true;
  });
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('='.repeat(60));
  console.log('  CMS STRESS TEST SUITE');
  console.log('='.repeat(60));

  const startTime = Date.now();

  testGeneratedFiles();
  testContentIntegrity();
  testScheduleData();
  testOrganizationsData();
  await testFreshGeneration();
  testBuild();
  testGitHubActionsSimulation();

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  STRESS TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`\n   ✓ Passed:   ${RESULTS.passed}`);
  console.log(`   ⚠ Warnings: ${RESULTS.warnings}`);
  console.log(`   ✗ Failed:   ${RESULTS.failed}`);
  console.log(`\n   Duration: ${duration}s`);

  if (RESULTS.failed > 0) {
    console.log('\n   FAILED TESTS:');
    for (const t of RESULTS.tests.filter(t => t.status === 'FAIL' || t.status === 'ERROR')) {
      console.log(`   • ${t.name}: ${t.reason}`);
    }
  }

  const status = RESULTS.failed === 0 ? 'PASS' : 'FAIL';
  console.log(`\n   OVERALL: ${status === 'PASS' ? '✅' : '❌'} ${status}`);
  console.log('\n' + '='.repeat(60));

  process.exit(RESULTS.failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Stress test crashed:', e);
  process.exit(1);
});
