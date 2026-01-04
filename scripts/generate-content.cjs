/**
 * Generate static content file from Airtable
 *
 * Usage: node scripts/generate-content.cjs
 *
 * This pulls content from multiple Airtable tables set up by Omni:
 * - Site Content (tblTZ0F89UMTO8PO0) - main editable content
 * - Summit History - 10-year timeline data
 * - Stats - statistics for history section
 * - Event Details - structured event data
 * - What To Expect - day-by-day expectations
 *
 * And generates a JavaScript module that can be imported by React components.
 */

const fs = require('fs');
const path = require('path');

const AIRTABLE_BASE_ID = 'appL8Sn87xUotm4jF';

// Table IDs/names - Omni's new structure
const TABLES = {
  siteContent: 'tblTZ0F89UMTO8PO0',          // Site Content table
  summitHistory: 'Summit History',            // Timeline data
  stats: 'Stats',                             // Statistics
  eventDetails: 'Event Details',              // Structured event data
  whatToExpect: 'What To Expect',             // Day expectations
};

// Load API key from environment or .env file
function loadApiKey() {
  if (process.env.AIRTABLE_API_KEY) {
    return process.env.AIRTABLE_API_KEY;
  }
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    let match = content.match(/AIRTABLE_API_KEY=(.+)/);
    if (!match) match = content.match(/VITE_AIRTABLE_KEY=(.+)/);
    if (match) return match[1].trim();
  }
  throw new Error('AIRTABLE_API_KEY not found in environment or .env file');
}

const API_KEY = loadApiKey();
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'content', 'siteContent.js');

async function fetchTable(tableNameOrId) {
  let allRecords = [];
  let offset = null;
  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableNameOrId)}`;

  do {
    const url = new URL(baseUrl);
    url.searchParams.append('pageSize', '100');
    if (offset) {
      url.searchParams.append('offset', offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If table doesn't exist, return empty array (graceful fallback)
      if (response.status === 404) {
        console.log(`  ⚠️ Table "${tableNameOrId}" not found, skipping...`);
        return [];
      }
      throw new Error(`Airtable API error for ${tableNameOrId}: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;
  } while (offset);

  return allRecords;
}

function processSiteContent(records) {
  const content = {
    sections: {},
    byPage: {},
  };

  for (const record of records) {
    const fields = record.fields;
    const section = fields.Section || 'unknown';
    const fieldName = fields.Field || '';
    const value = fields.Content || '';
    const page = fields.Page || 'Home';
    const color = fields.Color || 'ink';
    const order = fields.Order || 0;
    const visible = fields.Visible !== false;
    const component = fields.Component || '';
    const link = fields.Link || '';

    // Skip invisible items or items without field names
    if (!visible || !fieldName) continue;

    // Initialize section if needed
    if (!content.sections[section]) {
      content.sections[section] = {};
    }

    // Store the content with metadata
    content.sections[section][fieldName] = {
      value,
      color,
      order,
      component,
      link,
      page
    };

    // Also organize by page
    if (!content.byPage[page]) {
      content.byPage[page] = {};
    }
    if (!content.byPage[page][section]) {
      content.byPage[page][section] = {};
    }
    content.byPage[page][section][fieldName] = {
      value,
      color,
      order,
      component,
      link
    };
  }

  return content;
}

function processSummitHistory(records) {
  const timeline = [];

  for (const record of records) {
    const fields = record.fields;
    const visible = fields.Visible !== false;
    if (!visible) continue;

    // Skip records without valid year/location (likely relational placeholders)
    const year = String(fields.Year || '').trim();
    const location = (fields.Location || '').trim();
    if (!year || !location) continue;

    timeline.push({
      year,
      location,
      theme: fields.Theme || '',
      link: fields.Link || '',
      color: fields.Color || 'teal',
      order: fields.Order || 0
    });
  }

  // Sort by order
  timeline.sort((a, b) => a.order - b.order);
  return timeline;
}

function processStats(records) {
  const stats = [];

  for (const record of records) {
    const fields = record.fields;
    const visible = fields.Visible !== false;
    if (!visible) continue;

    // Skip records without valid label/value (likely relational placeholders)
    const label = (fields.Label || '').trim();
    const value = String(fields.Value || '').trim();
    if (!label || !value) continue;

    // Combine Value + Suffix for display (e.g., "1500" + "+" = "1500+")
    const suffix = fields.Suffix || '';
    const displayValue = value + suffix;

    stats.push({
      id: label.toLowerCase().replace(/\s+/g, '_'),
      value: displayValue,
      label,
      color: fields.Color || 'teal',
      order: fields.Order || 0
    });
  }

  // Sort by order
  stats.sort((a, b) => a.order - b.order);
  return stats;
}

function processEventDetails(records) {
  const details = {};

  for (const record of records) {
    const fields = record.fields;
    const key = fields.Key || fields.Name?.toLowerCase().replace(/\s+/g, '_');
    if (!key) continue;

    details[key] = {
      name: fields.Name || '',
      value: fields.Value || '',
      displayValue: fields['Display Value'] || fields.Value || '',
      notes: fields.Notes || ''
    };
  }

  return details;
}

function processWhatToExpect(records) {
  const expect = {};

  for (const record of records) {
    const fields = record.fields;
    const day = (fields.Day || 'monday').toLowerCase();

    expect[day] = {
      label: fields['Day Label'] || fields.Day || '',
      items: (fields.Items || '').split('\n').filter(item => item.trim()),
      order: fields.Order || 0
    };
  }

  return expect;
}

// Fallback: extract timeline from Site Content if Summit History table doesn't exist
function extractTimelineFromSiteContent(sections) {
  const timelineSection = sections.timeline || {};
  const years = new Set();
  const timeline = [];

  for (const key of Object.keys(timelineSection)) {
    const match = key.match(/^(\d{4})_/);
    if (match) {
      years.add(match[1]);
    }
  }

  for (const year of years) {
    timeline.push({
      year,
      location: timelineSection[`${year}_location`]?.value || '',
      theme: timelineSection[`${year}_theme`]?.value || '',
      link: timelineSection[`${year}_link`]?.value || '',
      color: timelineSection[`${year}_year`]?.color || 'teal',
      order: timelineSection[`${year}_year`]?.order || 0
    });
  }

  timeline.sort((a, b) => a.order - b.order);
  return timeline;
}

// Fallback: extract stats from Site Content if Stats table doesn't exist
function extractStatsFromSiteContent(sections) {
  const statsSection = sections.stats || {};
  const statIds = new Set();
  const stats = [];

  for (const key of Object.keys(statsSection)) {
    const match = key.match(/^(.+)_value$/);
    if (match) {
      statIds.add(match[1]);
    }
  }

  for (const id of statIds) {
    stats.push({
      id,
      value: statsSection[`${id}_value`]?.value || '',
      label: statsSection[`${id}_label`]?.value || id,
      color: statsSection[`${id}_value`]?.color || 'teal',
      order: statsSection[`${id}_value`]?.order || 0
    });
  }

  stats.sort((a, b) => a.order - b.order);
  return stats;
}

function generateJavaScript(content, timeline, stats, eventDetails, whatToExpect) {
  const timestamp = new Date().toISOString();

  return `/**
 * Site content generated from Airtable
 *
 * Generated: ${timestamp}
 *
 * DO NOT EDIT THIS FILE DIRECTLY.
 * To update content:
 * 1. Edit the tables in Airtable (Site Content, Summit History, Stats, etc.)
 * 2. Run: npm run generate-content
 * 3. Review changes and commit
 */

// All content organized by section
export const sections = ${JSON.stringify(content.sections, null, 2)};

// Content organized by page
export const byPage = ${JSON.stringify(content.byPage, null, 2)};

// Timeline data (from Summit History table, sorted by order)
export const timeline = ${JSON.stringify(timeline, null, 2)};

// Stats data (from Stats table, sorted by order)
export const stats = ${JSON.stringify(stats, null, 2)};

// Event details (from Event Details table)
export const eventDetails = ${JSON.stringify(eventDetails, null, 2)};

// What to expect by day (from What To Expect table)
export const whatToExpect = ${JSON.stringify(whatToExpect, null, 2)};

// Helper function to get content value
export function getContent(section, field, defaultValue = '') {
  return sections[section]?.[field]?.value ?? defaultValue;
}

// Helper function to get content with metadata
export function getContentMeta(section, field) {
  return sections[section]?.[field] ?? null;
}

// Helper function to get all content for a section
export function getSection(sectionName) {
  return sections[sectionName] ?? {};
}

// Helper function to get content for a specific page
export function getPageContent(pageName) {
  return byPage[pageName] ?? {};
}

// Helper function to get event detail by key
export function getEventDetail(key, field = 'displayValue') {
  return eventDetails[key]?.[field] ?? '';
}

// Color class mapping - includes light/accent variants for Tailwind compatibility
const colorClasses = {
  teal: { text: 'text-brand-teal', bg: 'bg-brand-teal', border: 'border-brand-teal', bgLight: 'bg-brand-teal/10', bgAccent: 'bg-brand-teal/5' },
  cardinal: { text: 'text-brand-cardinal', bg: 'bg-brand-cardinal', border: 'border-brand-cardinal', bgLight: 'bg-brand-cardinal/10', bgAccent: 'bg-brand-cardinal/5' },
  'green-dark': { text: 'text-brand-green-dark', bg: 'bg-brand-green-dark', border: 'border-brand-green-dark', bgLight: 'bg-brand-green-dark/10', bgAccent: 'bg-brand-green-dark/5' },
  ink: { text: 'text-brand-ink', bg: 'bg-brand-ink', border: 'border-brand-ink', bgLight: 'bg-brand-ink/10', bgAccent: 'bg-brand-ink/5' },
  cream: { text: 'text-brand-cream', bg: 'bg-brand-cream', border: 'border-brand-cream', bgLight: 'bg-brand-cream/10', bgAccent: 'bg-brand-cream/5' },
  gold: { text: 'text-brand-gold', bg: 'bg-brand-gold', border: 'border-brand-gold', bgLight: 'bg-brand-gold/10', bgAccent: 'bg-brand-gold/5' },
  white: { text: 'text-white', bg: 'bg-white', border: 'border-white', bgLight: 'bg-white/10', bgAccent: 'bg-white/5' },
};

export function getColorClass(colorName, type = 'text') {
  return colorClasses[colorName]?.[type] ?? '';
}

// Generation metadata
export const metadata = {
  generatedAt: '${timestamp}',
  recordCount: ${Object.values(content.sections).reduce((sum, s) => sum + Object.keys(s).length, 0)},
  sections: ${JSON.stringify(Object.keys(content.sections))},
  pages: ${JSON.stringify(Object.keys(content.byPage))},
  timelineCount: ${timeline.length},
  statsCount: ${stats.length}
};

export default {
  sections,
  byPage,
  timeline,
  stats,
  eventDetails,
  whatToExpect,
  getContent,
  getContentMeta,
  getSection,
  getPageContent,
  getEventDetail,
  getColorClass,
  metadata
};
`;
}

async function main() {
  console.log('='.repeat(50));
  console.log('Generating site content from Airtable');
  console.log('='.repeat(50));

  try {
    // Fetch from all tables
    console.log('\n📥 Fetching from Airtable tables...\n');

    console.log('1. Site Content...');
    const siteContentRecords = await fetchTable(TABLES.siteContent);
    console.log(`   ✓ ${siteContentRecords.length} records`);

    console.log('2. Summit History...');
    const summitHistoryRecords = await fetchTable(TABLES.summitHistory);
    console.log(`   ✓ ${summitHistoryRecords.length} records`);

    console.log('3. Stats...');
    const statsRecords = await fetchTable(TABLES.stats);
    console.log(`   ✓ ${statsRecords.length} records`);

    console.log('4. Event Details...');
    const eventDetailsRecords = await fetchTable(TABLES.eventDetails);
    console.log(`   ✓ ${eventDetailsRecords.length} records`);

    console.log('5. What To Expect...');
    const whatToExpectRecords = await fetchTable(TABLES.whatToExpect);
    console.log(`   ✓ ${whatToExpectRecords.length} records`);

    // Process records
    console.log('\n🔄 Processing records...\n');

    const content = processSiteContent(siteContentRecords);
    console.log(`   Sections: ${Object.keys(content.sections).join(', ')}`);

    // Use dedicated tables if available, otherwise fall back to Site Content
    let timeline = processSummitHistory(summitHistoryRecords);
    if (timeline.length === 0) {
      console.log('   ⚠️ No Summit History records, extracting from Site Content...');
      timeline = extractTimelineFromSiteContent(content.sections);
    }
    console.log(`   Timeline items: ${timeline.length}`);

    let stats = processStats(statsRecords);
    if (stats.length === 0) {
      console.log('   ⚠️ No Stats records, extracting from Site Content...');
      stats = extractStatsFromSiteContent(content.sections);
    }
    console.log(`   Stats: ${stats.length}`);

    const eventDetails = processEventDetails(eventDetailsRecords);
    console.log(`   Event details: ${Object.keys(eventDetails).length}`);

    const whatToExpect = processWhatToExpect(whatToExpectRecords);
    console.log(`   What to expect days: ${Object.keys(whatToExpect).length}`);

    // Generate JavaScript
    console.log('\n📝 Generating JavaScript...');
    const js = generateJavaScript(content, timeline, stats, eventDetails, whatToExpect);

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(OUTPUT_FILE, js, 'utf-8');
    console.log(`   ✓ Written to: ${OUTPUT_FILE}`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ Content generation complete!');
    console.log('='.repeat(50));
    console.log('\nNext steps:');
    console.log('1. Review the generated file');
    console.log('2. Run: npm run build');
    console.log('3. Test locally: npm run dev');
    console.log('4. Deploy: npm run deploy');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
