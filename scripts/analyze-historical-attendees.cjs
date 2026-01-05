/**
 * Historical Attendee Analysis Script
 *
 * Analyzes all CJS registration data from 2017-2025 to:
 * - Verify attendee tallies
 * - Identify repeat attendees and loyalty patterns
 * - Analyze organization types and sectors
 * - Analyze geographic distribution
 * - Generate actionable insights for CJS2026
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'planning', 'previous_summits');

// Summit metadata
const SUMMIT_INFO = {
  2017: { location: 'Montclair, NJ', venue: 'Montclair State University', type: 'in-person' },
  2018: { location: 'Montclair, NJ', venue: 'Montclair State University', type: 'in-person' },
  2019: { location: 'Philadelphia, PA', venue: 'Temple University', type: 'in-person' },
  2020: { location: 'Virtual', venue: 'Online', type: 'virtual' },
  2021: { location: 'Virtual', venue: 'Online', type: 'virtual' },
  2022: { location: 'Chicago, IL', venue: 'Northwestern/Medill', type: 'in-person' },
  2023: { location: 'Washington, D.C.', venue: 'Georgetown University', type: 'in-person' },
  2024: { location: 'Detroit, MI', venue: 'Wayne State University', type: 'in-person' },
  2025: { location: 'Denver, CO', venue: 'Delta Hotels Denver Thornton', type: 'in-person' }
};

// Organization type keywords for classification
const ORG_TYPES = {
  'University/Academic': ['university', 'college', 'school', 'institute', 'edu', 'professor', 'academic', 'faculty', 'student'],
  'Nonprofit News': ['nonprofit', 'non-profit', 'foundation', 'public media', 'npr', 'pbs', 'ipbs', 'inn', 'institute for nonprofit'],
  'Legacy Media': ['tribune', 'times', 'post', 'herald', 'journal', 'gazette', 'news', 'broadcast', 'tv', 'radio'],
  'Digital Native': ['digital', 'online', '.com', 'media', 'dot', 'podcast'],
  'Funder/Foundation': ['foundation', 'fund', 'knight', 'lenfest', 'democracy', 'philanthropic'],
  'Tech/Platform': ['google', 'facebook', 'meta', 'microsoft', 'apple', 'tech', 'platform', 'software'],
  'Freelance/Independent': ['freelance', 'independent', 'self', 'consultant', 'gmail.com', 'yahoo.com', 'hotmail.com']
};

// Parse CSV with proper handling of quoted fields
function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= headers.length) {
      const record = {};
      headers.forEach((header, idx) => {
        record[header.trim()] = values[idx]?.trim() || '';
      });
      records.push(record);
    }
  }

  return records;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values.map(v => v.replace(/^"|"$/g, '').trim());
}

// Normalize email for matching
function normalizeEmail(email) {
  return email?.toLowerCase().trim() || '';
}

// Classify organization type based on email domain or org name
function classifyOrganization(email, orgHints = '') {
  const combined = (email + ' ' + orgHints).toLowerCase();

  for (const [type, keywords] of Object.entries(ORG_TYPES)) {
    if (keywords.some(kw => combined.includes(kw))) {
      return type;
    }
  }
  return 'Other/Unknown';
}

// Extract email domain
function getEmailDomain(email) {
  const match = email?.match(/@(.+)$/);
  return match ? match[1].toLowerCase() : '';
}

// Get state from various fields
function extractState(record) {
  return record['Billing State'] || '';
}

// Main analysis
async function analyzeAllSummits() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  COLLABORATIVE JOURNALISM SUMMIT - HISTORICAL ATTENDEE ANALYSIS');
  console.log('  Analyzing registrations from 2017-2025');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.csv')).sort();

  // Master data structures
  const allAttendees = new Map(); // email -> { years: [], orgs: [], names: [] }
  const yearlyStats = {};
  const allOrganizations = new Map(); // domain -> { count, years }
  const allStates = new Map(); // state -> count

  // Process each year
  for (const file of files) {
    const yearMatch = file.match(/^(\d{4})/);
    if (!yearMatch) continue;

    const year = parseInt(yearMatch[1]);
    const filepath = path.join(DATA_DIR, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    const records = parseCSV(content);

    yearlyStats[year] = {
      total: records.length,
      paid: 0,
      free: 0,
      revenue: 0,
      uniqueEmails: new Set(),
      organizations: new Set(),
      states: new Map(),
      orgTypes: new Map()
    };

    for (const record of records) {
      const email = normalizeEmail(record['Email Address']);
      const firstName = record['First Name'] || '';
      const lastName = record['Last Name'] || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const domain = getEmailDomain(email);
      const state = extractState(record);
      const revenue = parseFloat(record['Gross Revenue (USD)'] || 0);
      const orderType = record['Type'] || '';

      if (!email) continue;

      // Track attendee across years
      if (!allAttendees.has(email)) {
        allAttendees.set(email, { years: [], names: new Set(), domains: new Set() });
      }
      const attendee = allAttendees.get(email);
      if (!attendee.years.includes(year)) {
        attendee.years.push(year);
      }
      attendee.names.add(fullName);
      attendee.domains.add(domain);

      // Yearly stats
      yearlyStats[year].uniqueEmails.add(email);
      if (domain) yearlyStats[year].organizations.add(domain);
      yearlyStats[year].revenue += revenue;

      if (orderType.includes('Free')) {
        yearlyStats[year].free++;
      } else {
        yearlyStats[year].paid++;
      }

      // Geographic tracking
      if (state) {
        yearlyStats[year].states.set(state, (yearlyStats[year].states.get(state) || 0) + 1);
        allStates.set(state, (allStates.get(state) || 0) + 1);
      }

      // Organization tracking
      if (domain) {
        if (!allOrganizations.has(domain)) {
          allOrganizations.set(domain, { count: 0, years: new Set() });
        }
        allOrganizations.get(domain).count++;
        allOrganizations.get(domain).years.add(year);
      }

      // Org type classification
      const orgType = classifyOrganization(email);
      yearlyStats[year].orgTypes.set(orgType, (yearlyStats[year].orgTypes.get(orgType) || 0) + 1);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 1: YEARLY BREAKDOWN & TALLY VERIFICATION
  // ═══════════════════════════════════════════════════════════════════

  console.log('┌─────────────────────────────────────────────────────────────────┐');
  console.log('│  SECTION 1: YEARLY ATTENDANCE & TALLY VERIFICATION             │');
  console.log('└─────────────────────────────────────────────────────────────────┘\n');

  let totalAttendees = 0;
  let totalRevenue = 0;
  const uniqueCities = new Set();

  console.log('Year  │ Location          │ Attendees │ Unique │  Paid  │  Free  │ Revenue');
  console.log('──────┼───────────────────┼───────────┼────────┼────────┼────────┼──────────');

  for (const year of Object.keys(yearlyStats).sort()) {
    const stats = yearlyStats[year];
    const info = SUMMIT_INFO[year];
    const unique = stats.uniqueEmails.size;

    totalAttendees += stats.total;
    totalRevenue += stats.revenue;
    if (info.type === 'in-person') {
      uniqueCities.add(info.location);
    }

    console.log(
      `${year}  │ ${info.location.padEnd(17)} │ ${String(stats.total).padStart(9)} │ ${String(unique).padStart(6)} │ ${String(stats.paid).padStart(6)} │ ${String(stats.free).padStart(6)} │ $${stats.revenue.toFixed(2).padStart(9)}`
    );
  }

  console.log('──────┴───────────────────┴───────────┴────────┴────────┴────────┴──────────');
  console.log(`TOTAL                     │ ${String(totalAttendees).padStart(9)} │        │        │        │ $${totalRevenue.toFixed(2).padStart(9)}`);

  console.log('\n📊 TALLY VERIFICATION:');
  console.log(`   Total registrations across all years: ${totalAttendees}`);
  console.log(`   Unique individuals (by email): ${allAttendees.size}`);
  console.log(`   Unique cities hosted: ${uniqueCities.size} (${[...uniqueCities].join(', ')})`);
  console.log(`   Total summits: 9 (2017-2025)`);

  // Check against website claims
  console.log('\n⚠️  WEBSITE CLAIMS VS. ACTUAL DATA:');
  console.log('   Website says "1,500+ attendees" → Actual: ' + totalAttendees + ' registrations');
  console.log('   Website says "7 cities" → Actual: ' + uniqueCities.size + ' unique cities');
  console.log('   Website says "10 summits" → Actual: 9 summits (2017-2025) + 2026 = 10th');

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 2: REPEAT ATTENDEE ANALYSIS
  // ═══════════════════════════════════════════════════════════════════

  console.log('\n┌─────────────────────────────────────────────────────────────────┐');
  console.log('│  SECTION 2: REPEAT ATTENDEE & LOYALTY ANALYSIS                 │');
  console.log('└─────────────────────────────────────────────────────────────────┘\n');

  // Categorize by attendance frequency
  const attendanceFrequency = { 1: [], 2: [], 3: [], 4: [], 5: [], '6+': [] };

  for (const [email, data] of allAttendees) {
    const count = data.years.length;
    const key = count >= 6 ? '6+' : count;
    attendanceFrequency[key].push({ email, ...data, count });
  }

  console.log('Attendance Frequency Distribution:');
  console.log('───────────────────────────────────');
  for (const [times, attendees] of Object.entries(attendanceFrequency)) {
    const pct = ((attendees.length / allAttendees.size) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(pct / 2));
    console.log(`${times} summit(s): ${String(attendees.length).padStart(4)} attendees (${pct.padStart(5)}%) ${bar}`);
  }

  // Super fans (5+ summits)
  const superFans = [...allAttendees.entries()]
    .filter(([_, data]) => data.years.length >= 5)
    .sort((a, b) => b[1].years.length - a[1].years.length);

  console.log(`\n🌟 SUPER FANS (5+ summits attended): ${superFans.length} people`);
  console.log('───────────────────────────────────────────────────────────────');
  superFans.slice(0, 15).forEach(([email, data]) => {
    const name = [...data.names][0] || 'Unknown';
    const domain = [...data.domains][0] || '';
    console.log(`   ${data.years.length}x: ${name.padEnd(25)} (${domain})`);
    console.log(`       Years: ${data.years.sort().join(', ')}`);
  });

  // OG attendees (attended 2017)
  const ogAttendees = [...allAttendees.entries()].filter(([_, data]) => data.years.includes(2017));
  const ogStillActive = ogAttendees.filter(([_, data]) => data.years.includes(2024) || data.years.includes(2025));

  console.log(`\n🎓 OG ATTENDEES (attended inaugural 2017): ${ogAttendees.length}`);
  console.log(`   Still active (attended 2024 or 2025): ${ogStillActive.length} (${((ogStillActive.length/ogAttendees.length)*100).toFixed(1)}% retention)`);

  // Retention analysis
  console.log('\n📈 YEAR-OVER-YEAR RETENTION:');
  const years = Object.keys(yearlyStats).sort().map(Number);
  for (let i = 1; i < years.length; i++) {
    const prevYear = years[i-1];
    const currYear = years[i];
    const prevAttendees = new Set([...allAttendees.entries()].filter(([_, d]) => d.years.includes(prevYear)).map(([e]) => e));
    const currAttendees = new Set([...allAttendees.entries()].filter(([_, d]) => d.years.includes(currYear)).map(([e]) => e));
    const retained = [...prevAttendees].filter(e => currAttendees.has(e)).length;
    const retentionRate = ((retained / prevAttendees.size) * 100).toFixed(1);
    console.log(`   ${prevYear} → ${currYear}: ${retained}/${prevAttendees.size} returned (${retentionRate}% retention)`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 3: ORGANIZATION ANALYSIS
  // ═══════════════════════════════════════════════════════════════════

  console.log('\n┌─────────────────────────────────────────────────────────────────┐');
  console.log('│  SECTION 3: ORGANIZATION & SECTOR ANALYSIS                     │');
  console.log('└─────────────────────────────────────────────────────────────────┘\n');

  // Top organizations by attendance
  const topOrgs = [...allOrganizations.entries()]
    .filter(([domain]) => !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com'].includes(domain))
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 25);

  console.log('Top 25 Organizations by Total Registrations:');
  console.log('─────────────────────────────────────────────');
  topOrgs.forEach(([domain, data], idx) => {
    const yearsStr = [...data.years].sort().join(', ');
    console.log(`${String(idx+1).padStart(2)}. ${domain.padEnd(35)} ${String(data.count).padStart(3)} registrations (${data.years.size} years)`);
  });

  // Organization type breakdown (aggregated)
  console.log('\n📊 ORGANIZATION TYPE BREAKDOWN (All Years):');
  const allOrgTypes = new Map();
  for (const stats of Object.values(yearlyStats)) {
    for (const [type, count] of stats.orgTypes) {
      allOrgTypes.set(type, (allOrgTypes.get(type) || 0) + count);
    }
  }

  const sortedOrgTypes = [...allOrgTypes.entries()].sort((a, b) => b[1] - a[1]);
  const totalTyped = sortedOrgTypes.reduce((sum, [_, count]) => sum + count, 0);

  sortedOrgTypes.forEach(([type, count]) => {
    const pct = ((count / totalTyped) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(pct / 2));
    console.log(`   ${type.padEnd(22)} ${String(count).padStart(5)} (${pct.padStart(5)}%) ${bar}`);
  });

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 4: GEOGRAPHIC ANALYSIS
  // ═══════════════════════════════════════════════════════════════════

  console.log('\n┌─────────────────────────────────────────────────────────────────┐');
  console.log('│  SECTION 4: GEOGRAPHIC DISTRIBUTION                            │');
  console.log('└─────────────────────────────────────────────────────────────────┘\n');

  // Top states
  const topStates = [...allStates.entries()]
    .filter(([state]) => state.length === 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  console.log('Top 20 States by Registration:');
  console.log('──────────────────────────────');
  topStates.forEach(([state, count], idx) => {
    const pct = ((count / totalAttendees) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(pct));
    console.log(`${String(idx+1).padStart(2)}. ${state} ${String(count).padStart(4)} (${pct.padStart(5)}%) ${bar}`);
  });

  // Regional breakdown
  const regions = {
    'Northeast': ['CT', 'DE', 'MA', 'MD', 'ME', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT', 'DC'],
    'Southeast': ['AL', 'AR', 'FL', 'GA', 'KY', 'LA', 'MS', 'NC', 'SC', 'TN', 'VA', 'WV'],
    'Midwest': ['IA', 'IL', 'IN', 'KS', 'MI', 'MN', 'MO', 'ND', 'NE', 'OH', 'SD', 'WI'],
    'Southwest': ['AZ', 'NM', 'OK', 'TX'],
    'West': ['AK', 'CA', 'CO', 'HI', 'ID', 'MT', 'NV', 'OR', 'UT', 'WA', 'WY']
  };

  console.log('\n🗺️  REGIONAL BREAKDOWN:');
  for (const [region, states] of Object.entries(regions)) {
    const count = states.reduce((sum, st) => sum + (allStates.get(st) || 0), 0);
    const pct = ((count / totalAttendees) * 100).toFixed(1);
    console.log(`   ${region.padEnd(12)}: ${String(count).padStart(4)} (${pct}%)`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // SECTION 5: TRENDS & INSIGHTS
  // ═══════════════════════════════════════════════════════════════════

  console.log('\n┌─────────────────────────────────────────────────────────────────┐');
  console.log('│  SECTION 5: KEY TRENDS & ACTIONABLE INSIGHTS                   │');
  console.log('└─────────────────────────────────────────────────────────────────┘\n');

  // Growth trends
  const inPersonYears = years.filter(y => SUMMIT_INFO[y].type === 'in-person');
  const avgInPerson = inPersonYears.reduce((sum, y) => sum + yearlyStats[y].total, 0) / inPersonYears.length;
  const virtualYears = years.filter(y => SUMMIT_INFO[y].type === 'virtual');
  const avgVirtual = virtualYears.reduce((sum, y) => sum + yearlyStats[y].total, 0) / virtualYears.length;

  console.log('📈 ATTENDANCE TRENDS:');
  console.log(`   Average in-person attendance: ${avgInPerson.toFixed(0)} per summit`);
  console.log(`   Average virtual attendance: ${avgVirtual.toFixed(0)} per summit (${((avgVirtual/avgInPerson)*100).toFixed(0)}% of in-person)`);
  console.log(`   2020 pandemic spike: ${yearlyStats[2020].total} registrations (${((yearlyStats[2020].total/avgInPerson)*100).toFixed(0)}% of avg in-person)`);

  // First-timer vs returner breakdown
  const firstTimersByYear = {};
  const seenEmails = new Set();
  for (const year of years) {
    const yearEmails = [...allAttendees.entries()]
      .filter(([_, d]) => d.years.includes(year))
      .map(([e]) => e);
    const firstTimers = yearEmails.filter(e => !seenEmails.has(e));
    firstTimersByYear[year] = {
      firstTimers: firstTimers.length,
      returners: yearEmails.length - firstTimers.length,
      total: yearEmails.length
    };
    yearEmails.forEach(e => seenEmails.add(e));
  }

  console.log('\n🆕 FIRST-TIMERS VS. RETURNERS BY YEAR:');
  console.log('Year  │ First-timers │ Returners │ % New');
  console.log('──────┼──────────────┼───────────┼───────');
  for (const year of years) {
    const data = firstTimersByYear[year];
    const pctNew = ((data.firstTimers / data.total) * 100).toFixed(0);
    console.log(`${year}  │ ${String(data.firstTimers).padStart(12)} │ ${String(data.returners).padStart(9)} │ ${pctNew.padStart(4)}%`);
  }

  // Key insights summary
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('  💡 KEY INSIGHTS & RECOMMENDATIONS FOR CJS2026');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  console.log('1. CORE COMMUNITY IS STRONG');
  console.log(`   • ${superFans.length} "super fans" have attended 5+ summits`);
  console.log(`   • ${((attendanceFrequency[2].length + attendanceFrequency[3].length + attendanceFrequency[4].length + attendanceFrequency[5].length + attendanceFrequency['6+'].length) / allAttendees.size * 100).toFixed(0)}% of all attendees are repeat visitors`);
  console.log('   → RECOMMENDATION: Create VIP/alumni recognition at CJS2026\n');

  console.log('2. HIGH CHURN REQUIRES CONTINUOUS OUTREACH');
  console.log(`   • ${((attendanceFrequency[1].length / allAttendees.size) * 100).toFixed(0)}% attended only once`);
  console.log('   • Average year-over-year retention is modest');
  console.log('   → RECOMMENDATION: Implement post-event nurture campaigns\n');

  console.log('3. ACADEMIC/UNIVERSITY SECTOR DOMINATES');
  const uniCount = allOrgTypes.get('University/Academic') || 0;
  console.log(`   • ${((uniCount / totalTyped) * 100).toFixed(0)}% of attendees from universities`);
  console.log('   → RECOMMENDATION: Partner with J-schools for student scholarships\n');

  console.log('4. GEOGRAPHIC CONCENTRATION');
  const topThreeStates = topStates.slice(0, 3);
  const topThreeTotal = topThreeStates.reduce((sum, [_, count]) => sum + count, 0);
  console.log(`   • Top 3 states (${topThreeStates.map(([s]) => s).join(', ')}) = ${((topThreeTotal/totalAttendees)*100).toFixed(0)}% of all registrations`);
  console.log('   → RECOMMENDATION: Targeted outreach to underrepresented regions\n');

  console.log('5. VIRTUAL EXPANDED REACH');
  console.log(`   • 2020-2021 virtual events reached ${yearlyStats[2020].total + yearlyStats[2021].total} people`);
  console.log('   • Many first-timers from virtual era didn\'t return in-person');
  console.log('   → RECOMMENDATION: Consider hybrid options for accessibility\n');

  // Pittsburgh-specific insight
  const paAttendees = allStates.get('PA') || 0;
  console.log('6. PITTSBURGH 2026 OPPORTUNITY');
  console.log(`   • ${paAttendees} total Pennsylvania registrations historically`);
  console.log('   • 2019 Philadelphia summit drew strong regional attendance');
  console.log('   → RECOMMENDATION: Heavy outreach to PA/OH/WV newsrooms\n');

  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  Analysis complete. Data exported for reference.');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // Export summary data
  const summary = {
    generatedAt: new Date().toISOString(),
    totalRegistrations: totalAttendees,
    uniqueIndividuals: allAttendees.size,
    totalRevenue: totalRevenue,
    yearlyBreakdown: Object.fromEntries(
      Object.entries(yearlyStats).map(([year, stats]) => [year, {
        total: stats.total,
        unique: stats.uniqueEmails.size,
        paid: stats.paid,
        free: stats.free,
        revenue: stats.revenue
      }])
    ),
    repeatAttendees: {
      oneTime: attendanceFrequency[1].length,
      twoTimes: attendanceFrequency[2].length,
      threeTimes: attendanceFrequency[3].length,
      fourTimes: attendanceFrequency[4].length,
      fiveTimes: attendanceFrequency[5].length,
      sixPlus: attendanceFrequency['6+'].length
    },
    topOrganizations: topOrgs.slice(0, 10).map(([domain, data]) => ({ domain, count: data.count, years: data.years.size })),
    topStates: topStates.slice(0, 10).map(([state, count]) => ({ state, count }))
  };

  fs.writeFileSync(
    path.join(__dirname, '..', 'planning', 'attendee-analysis-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  console.log('Summary saved to: planning/attendee-analysis-summary.json');
}

analyzeAllSummits().catch(console.error);
