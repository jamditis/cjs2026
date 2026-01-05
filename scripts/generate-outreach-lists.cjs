/**
 * Generate outreach lists for CJS2026 marketing campaigns
 *
 * Extracts contact information for:
 * 1. Super Fans (5+ summit attendances)
 * 2. Class of 2020 (pandemic first-timers who haven't returned)
 * 3. OG Attendees (2017 inaugural attendees)
 *
 * Output: CSV files for email campaigns
 */

const fs = require('fs');
const path = require('path');

// CSV files by year (correct Eventbrite order IDs)
const CSV_FILES = {
  2017: '2017 Orders-31291355286.csv',
  2018: '2018 Orders-42048839210.csv',
  2019: '2019 Orders-52547754749.csv',
  2020: '2020 Orders-85801292977.csv',
  2021: '2021 Orders-138314332893.csv',
  2022: '2022 Orders-243146767527.csv',
  2023: '2023 Orders-489920614747.csv',
  2024: '2024 Orders-760838216587.csv',
  2025: '2025 Orders-1063325438009.csv'
};

const PLANNING_DIR = path.join(__dirname, '..', 'planning', 'previous_summits');
const OUTPUT_DIR = path.join(__dirname, '..', 'planning', 'outreach-lists');

// Parse CSV - handles quoted fields with commas
function parseCSV(content) {
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = parseCSVLine(lines[i]);
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      rows.push(row);
    }
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Normalize email for deduplication
function normalizeEmail(email) {
  return (email || '').toLowerCase().trim();
}

// Extract first name from full name
function getFirstName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || '';
}

// Main analysis
async function generateOutreachLists() {
  console.log('🎯 Generating CJS2026 Outreach Lists\n');

  // Track all attendees by email
  const attendeesByEmail = new Map();

  // Process each year's CSV
  for (const [year, filename] of Object.entries(CSV_FILES)) {
    const filepath = path.join(PLANNING_DIR, filename);

    if (!fs.existsSync(filepath)) {
      console.log(`⚠️  Missing: ${filename}`);
      continue;
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    const rows = parseCSV(content);

    console.log(`📊 ${year}: ${rows.length} registrations`);

    for (const row of rows) {
      const email = normalizeEmail(row['Email Address'] || row['Email'] || row['Attendee Email']);
      if (!email || email.includes('test') || email.includes('example')) continue;

      const name = row['First Name'] && row['Last Name']
        ? `${row['First Name']} ${row['Last Name']}`
        : row['Name'] || row['Attendee Name'] || '';

      const firstName = row['First Name'] || getFirstName(name);
      const lastName = row['Last Name'] || '';
      const org = row['Company'] || row['Organization'] || row['Billing City'] || '';
      const title = row['Job Title'] || row['Title'] || '';

      if (!attendeesByEmail.has(email)) {
        attendeesByEmail.set(email, {
          email,
          firstName,
          lastName,
          name: name || `${firstName} ${lastName}`.trim(),
          organization: org,
          title,
          years: [],
          firstYear: parseInt(year),
          lastYear: parseInt(year)
        });
      }

      const attendee = attendeesByEmail.get(email);
      if (!attendee.years.includes(parseInt(year))) {
        attendee.years.push(parseInt(year));
      }
      attendee.lastYear = Math.max(attendee.lastYear, parseInt(year));

      // Update name/org if we have better data
      if (!attendee.name && name) attendee.name = name;
      if (!attendee.firstName && firstName) attendee.firstName = firstName;
      if (!attendee.organization && org) attendee.organization = org;
      if (!attendee.title && title) attendee.title = title;
    }
  }

  console.log(`\n✅ Total unique attendees: ${attendeesByEmail.size}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. SUPER FANS (5+ summits)
  const superFans = Array.from(attendeesByEmail.values())
    .filter(a => a.years.length >= 5)
    .sort((a, b) => b.years.length - a.years.length);

  console.log(`🌟 SUPER FANS (5+ summits): ${superFans.length} people`);
  superFans.forEach(sf => {
    console.log(`   ${sf.name || sf.email} - ${sf.years.length} summits (${sf.years.join(', ')})`);
  });

  // 2. LOYAL ATTENDEES (3-4 summits)
  const loyalAttendees = Array.from(attendeesByEmail.values())
    .filter(a => a.years.length >= 3 && a.years.length <= 4)
    .sort((a, b) => b.years.length - a.years.length);

  console.log(`\n⭐ LOYAL ATTENDEES (3-4 summits): ${loyalAttendees.length} people`);

  // 3. CLASS OF 2020 (pandemic first-timers who haven't returned)
  const classOf2020 = Array.from(attendeesByEmail.values())
    .filter(a => a.firstYear === 2020 && a.years.length === 1);

  console.log(`\n🎓 CLASS OF 2020 (haven't returned): ${classOf2020.length} people`);

  // 4. OG ATTENDEES (2017 inaugural)
  const ogAttendees = Array.from(attendeesByEmail.values())
    .filter(a => a.years.includes(2017));

  console.log(`\n🏆 OG ATTENDEES (2017 inaugural): ${ogAttendees.length} people`);

  // 5. LAPSED ATTENDEES (attended 2+ times but not since 2023)
  const lapsedAttendees = Array.from(attendeesByEmail.values())
    .filter(a => a.years.length >= 2 && a.lastYear <= 2023);

  console.log(`\n😴 LAPSED ATTENDEES (2+ times, not since 2023): ${lapsedAttendees.length} people`);

  // 6. RECENT FIRST-TIMERS (2024-2025 first year)
  const recentFirstTimers = Array.from(attendeesByEmail.values())
    .filter(a => a.firstYear >= 2024 && a.years.length === 1);

  console.log(`\n🆕 RECENT FIRST-TIMERS (2024-2025): ${recentFirstTimers.length} people`);

  // Generate CSV files
  const csvHeader = 'Email,First Name,Last Name,Full Name,Organization,Title,Years Attended,Total Summits,First Year,Last Year\n';

  function toCSVRow(a) {
    return [
      a.email,
      `"${(a.firstName || '').replace(/"/g, '""')}"`,
      `"${(a.lastName || '').replace(/"/g, '""')}"`,
      `"${(a.name || '').replace(/"/g, '""')}"`,
      `"${(a.organization || '').replace(/"/g, '""')}"`,
      `"${(a.title || '').replace(/"/g, '""')}"`,
      `"${a.years.join(', ')}"`,
      a.years.length,
      a.firstYear,
      a.lastYear
    ].join(',');
  }

  // Write Super Fans CSV
  const superFanCSV = csvHeader + superFans.map(toCSVRow).join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'super-fans.csv'), superFanCSV);
  console.log(`\n📁 Wrote: outreach-lists/super-fans.csv`);

  // Write Loyal Attendees CSV
  const loyalCSV = csvHeader + loyalAttendees.map(toCSVRow).join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'loyal-attendees.csv'), loyalCSV);
  console.log(`📁 Wrote: outreach-lists/loyal-attendees.csv`);

  // Write Class of 2020 CSV
  const class2020CSV = csvHeader + classOf2020.map(toCSVRow).join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'class-of-2020.csv'), class2020CSV);
  console.log(`📁 Wrote: outreach-lists/class-of-2020.csv`);

  // Write OG Attendees CSV
  const ogCSV = csvHeader + ogAttendees.map(toCSVRow).join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'og-attendees-2017.csv'), ogCSV);
  console.log(`📁 Wrote: outreach-lists/og-attendees-2017.csv`);

  // Write Lapsed Attendees CSV
  const lapsedCSV = csvHeader + lapsedAttendees.map(toCSVRow).join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'lapsed-attendees.csv'), lapsedCSV);
  console.log(`📁 Wrote: outreach-lists/lapsed-attendees.csv`);

  // Write Recent First-Timers CSV
  const recentCSV = csvHeader + recentFirstTimers.map(toCSVRow).join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'recent-first-timers.csv'), recentCSV);
  console.log(`📁 Wrote: outreach-lists/recent-first-timers.csv`);

  // Write summary JSON
  const summary = {
    generatedAt: new Date().toISOString(),
    lists: {
      superFans: { count: superFans.length, file: 'super-fans.csv' },
      loyalAttendees: { count: loyalAttendees.length, file: 'loyal-attendees.csv' },
      classOf2020: { count: classOf2020.length, file: 'class-of-2020.csv' },
      ogAttendees: { count: ogAttendees.length, file: 'og-attendees-2017.csv' },
      lapsedAttendees: { count: lapsedAttendees.length, file: 'lapsed-attendees.csv' },
      recentFirstTimers: { count: recentFirstTimers.length, file: 'recent-first-timers.csv' }
    },
    totalUniqueAttendees: attendeesByEmail.size
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );
  console.log(`📁 Wrote: outreach-lists/summary.json`);

  console.log('\n✅ All outreach lists generated!\n');

  return { superFans, loyalAttendees, classOf2020, ogAttendees, lapsedAttendees, recentFirstTimers };
}

generateOutreachLists().catch(console.error);
