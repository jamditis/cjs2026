/**
 * Generate updates/news content file from Airtable
 *
 * Usage: node scripts/generate-updates.cjs
 *
 * This pulls all updates from the Airtable Updates table
 * and generates a JavaScript module that can be imported by React components.
 *
 * Airtable Table: Updates
 * Required fields:
 * - Title (Single line text) - Update headline
 * - Slug (Single line text) - URL-friendly identifier (e.g., "session-pitches-open")
 * - Summary (Long text) - Short description for list view
 * - Content (Long text) - Full article content (markdown supported)
 * - Date (Date) - Publication date
 * - Category (Single select) - e.g., "Announcements", "Deadlines", "Events"
 * - Type (Single select) - announcement, deadline, story, milestone
 * - Color (Single select) - teal, cardinal, green-dark
 * - Featured (Checkbox) - Show in featured section
 * - Countdown (Checkbox) - Show countdown timer (for deadline items)
 * - CTA Text (Single line text) - Button text
 * - CTA URL (Single line text) - Button link
 * - CTA External (Checkbox) - Opens in new tab
 * - Visible (Checkbox) - Show on website
 * - Order (Number) - Sort order (lower = first)
 */

const fs = require('fs');
const path = require('path');

const AIRTABLE_BASE_ID = 'appL8Sn87xUotm4jF';
const AIRTABLE_TABLE_NAME = 'Updates'; // Table name, not ID
// API key from environment variable or .env file
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || loadLocalEnv()?.AIRTABLE_API_KEY;

// Load API key from local .env file for development
function loadLocalEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      let match = content.match(/AIRTABLE_API_KEY=(.+)/);
      if (!match) match = content.match(/VITE_AIRTABLE_KEY=(.+)/);
      if (match) return { AIRTABLE_API_KEY: match[1].trim() };
    }
  } catch (e) {}
  return null;
}

const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'content', 'updatesData.js');

// Default updates to use if Airtable table doesn't exist yet
const DEFAULT_UPDATES = [
  {
    slug: 'session-pitches-open',
    type: 'announcement',
    featured: true,
    title: 'Session pitches now open for CJS2026',
    summary: 'We\'re accepting proposals for panels, workshops, and lightning talks. Share your collaborative journalism expertise with 150 practitioners, funders, and media leaders.',
    content: `The 10th anniversary Collaborative Journalism Summit is taking shape, and we need your help to build the program.

**What we're looking for:**
- **Panels** (45-60 min) — Moderated discussions with 3-4 speakers
- **Workshops** (90 min) — Hands-on learning sessions with practical takeaways
- **Lightning talks** (10 min) — Quick case studies or lessons learned

**Topics of interest:**
- Sustainability models for news collaboratives
- Technology and tools that enable collaboration
- Measuring the impact of collaborative journalism
- Building and maintaining trust with partners
- Regional and hyperlocal collaboration strategies

**Deadline: January 31, 2026**

Contact us at summit@collaborativejournalism.org with your proposal.`,
    date: '2026-01-02',
    category: 'Call for proposals',
    cta: { text: 'Contact us to pitch', url: '/contact', external: false },
    color: 'teal',
    visible: true
  },
  {
    slug: 'knight-foundation-presenting-sponsor',
    type: 'announcement',
    featured: true,
    title: 'Knight Foundation joins as presenting sponsor',
    summary: 'We\'re honored to welcome Knight Foundation as the presenting sponsor of CJS2026, continuing their commitment to strengthening journalism through collaboration.',
    content: `Knight Foundation has joined CJS2026 as the presenting sponsor, marking a decade of their investment in the collaborative journalism movement.

Since the earliest days of the Collaborative Journalism Summit, Knight Foundation has been a champion of the idea that journalism is stronger when newsrooms work together.

For information about sponsoring CJS2026, visit the sponsors page or contact summit@collaborativejournalism.org.`,
    date: '2025-12-18',
    category: 'Sponsors',
    cta: { text: 'Learn about sponsoring', url: '/sponsors', external: false },
    color: 'cardinal',
    visible: true
  },
  {
    slug: 'pitch-deadline-january-31',
    type: 'deadline',
    title: 'Session pitch deadline: January 31',
    summary: 'Final call for session proposals. Pitch a panel, workshop, or lightning talk to help shape the CJS2026 program.',
    content: `**The deadline for CJS2026 session pitches is January 31, 2026.**

We're looking for proposals that showcase real-world collaborative journalism — successes, challenges, and lessons learned.

**Submit your pitch:**
Email summit@collaborativejournalism.org with your proposal by January 31.`,
    date: '2026-01-31',
    category: 'Deadlines',
    countdown: true,
    cta: { text: 'Contact us to pitch', url: '/contact', external: false },
    color: 'cardinal',
    visible: true
  },
  {
    slug: 'decade-of-collaborative-journalism',
    type: 'story',
    title: 'A decade of proving journalism is stronger together',
    summary: 'Since 2017, CJS has grown from 20 attendees in Montclair to 1,500+ practitioners across 7 cities.',
    content: `In 2017, about 20 people gathered at Montclair State University for an unconventional idea: What if competing newsrooms actually worked together?

Ten years later, collaborative journalism has grown from an experiment into standard practice.

**By the numbers:**
- **10** summits since 2017
- **7** cities (plus 2 virtual years)
- **1,500+** total attendees
- **1** mission: journalism is stronger together`,
    date: '2025-12-15',
    category: '10th anniversary',
    cta: { text: 'Explore our full history', url: '/#history', external: false },
    color: 'green-dark',
    visible: true
  },
  {
    slug: 'cjs2026-chapel-hill',
    type: 'story',
    title: 'CJS2026 heads to Chapel Hill, North Carolina',
    summary: 'The Southeast is home to innovative collaborative journalism projects. We\'re bringing the summit to UNC Friday Center on June 8-9, 2026.',
    content: `For the 10th anniversary Collaborative Journalism Summit, we're heading to Chapel Hill, North Carolina.

**Venue: UNC Friday Center**
The William and Ida Friday Center for Continuing Education offers modern conference facilities in a campus setting.

**Dates: June 8-9, 2026**
- **Monday, June 8** — Full day of sessions plus evening dinner
- **Tuesday, June 9** — Morning workshops

**Co-located with INN Days**
Stay for INN Days (June 9-11) and get even more value from your trip.`,
    date: '2025-12-10',
    category: 'Location',
    cta: { text: 'See venue details', url: '/contact', external: false },
    color: 'teal',
    visible: true
  },
  {
    slug: 'inn-days-colocation',
    type: 'announcement',
    title: 'Co-located with INN Days 2026',
    summary: 'Attend both CJS2026 (June 8-9) and INN Days (June 9-11) at UNC Friday Center. Two events, one trip, maximum value.',
    content: `CJS2026 and INN Days 2026 will be co-located at UNC Friday Center in Chapel Hill.

**The lineup:**
- **June 8-9** — Collaborative Journalism Summit (CJS2026)
- **June 9-11** — INN Days

Learn more at inn.org.`,
    date: '2025-12-01',
    category: 'Events',
    cta: { text: 'Learn more about INN', url: 'https://inn.org', external: true },
    color: 'green-dark',
    visible: true
  },
  {
    slug: 'registration-coming-soon',
    type: 'announcement',
    title: 'Registration opens early 2026',
    summary: 'Sign up for email updates to be the first to know when registration opens. Early bird pricing available for the first 50 registrants.',
    content: `Registration for CJS2026 will open in early 2026.

**Early bird pricing:**
The first 50 registrants will receive early bird pricing. Sign up for our email list to be notified the moment registration opens.

**Questions?**
Email summit@collaborativejournalism.org with any registration questions.`,
    date: '2025-11-15',
    category: 'Registration',
    cta: { text: 'Get email updates', url: '/', external: false },
    color: 'teal',
    visible: true
  }
];

async function fetchAllRecords() {
  let allRecords = [];
  let offset = null;

  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`);
    url.searchParams.append('pageSize', '100');
    if (offset) {
      url.searchParams.append('offset', offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If table doesn't exist, return empty array (will use defaults)
      if (response.status === 404 || errorText.includes('TABLE_NOT_FOUND')) {
        console.log('⚠️  Updates table not found in Airtable. Using default updates.');
        return null;
      }
      throw new Error(`Airtable API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;

    console.log(`Fetched ${allRecords.length} updates...`);
  } while (offset);

  return allRecords;
}

function processRecords(records) {
  if (!records || records.length === 0) {
    return DEFAULT_UPDATES;
  }

  return records
    .map(record => {
      const f = record.fields;

      // Skip if not visible
      if (f.Visible === false) return null;

      return {
        slug: f.Slug || f.Title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || record.id,
        type: f.Type?.toLowerCase() || 'announcement',
        featured: f.Featured || false,
        title: f.Title || 'Untitled',
        summary: f.Summary || '',
        content: f.Content || '',
        date: f.Date || new Date().toISOString().split('T')[0],
        category: f.Category || 'Updates',
        countdown: f.Countdown || false,
        cta: f['CTA Text'] ? {
          text: f['CTA Text'],
          url: f['CTA URL'] || '/',
          external: f['CTA External'] || false
        } : null,
        color: f.Color?.toLowerCase() || 'teal',
        visible: f.Visible !== false,
        order: f.Order || 999
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Sort by date (newest first), then by order
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.order || 999) - (b.order || 999);
    });
}

function generateJavaScript(updates) {
  const timestamp = new Date().toISOString();

  return `/**
 * Updates/News data generated from Airtable
 *
 * Generated: ${timestamp}
 *
 * DO NOT EDIT THIS FILE DIRECTLY.
 * To update:
 * 1. Edit the "Updates" table in Airtable
 * 2. Run: npm run generate-updates
 * 3. Review changes and commit
 *
 * Each update has a unique slug for shareable URLs:
 * summit.collaborativejournalism.org/updates/[slug]
 */

// All updates (sorted by date, newest first)
export const updates = ${JSON.stringify(updates, null, 2)};

// Helper functions
export function getUpdateBySlug(slug) {
  return updates.find(u => u.slug === slug) || null;
}

export function getFeaturedUpdates() {
  return updates.filter(u => u.featured);
}

export function getRecentUpdates(limit = 5) {
  return updates.slice(0, limit);
}

export function getUpdatesByCategory(category) {
  return updates.filter(u => u.category.toLowerCase() === category.toLowerCase());
}

// Calculate days until a date
export function getDaysUntil(dateString) {
  const target = new Date(dateString);
  const now = new Date();
  const diff = target - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Generation metadata
export const metadata = {
  generatedAt: '${timestamp}',
  totalUpdates: ${updates.length},
  featuredCount: ${updates.filter(u => u.featured).length},
  categories: ${JSON.stringify([...new Set(updates.map(u => u.category))])},
};

export default updates;
`;
}

async function main() {
  console.log('🔄 Generating updates from Airtable...\n');

  if (!AIRTABLE_API_KEY) {
    console.log('⚠️  No Airtable API key found. Using default updates.');
    const javascript = generateJavaScript(DEFAULT_UPDATES);
    fs.writeFileSync(OUTPUT_FILE, javascript);
    console.log(`\n✅ Generated ${OUTPUT_FILE}`);
    console.log(`   ${DEFAULT_UPDATES.length} updates (defaults)`);
    return;
  }

  try {
    const records = await fetchAllRecords();
    const updates = processRecords(records);
    const javascript = generateJavaScript(updates);

    fs.writeFileSync(OUTPUT_FILE, javascript);

    console.log(`\n✅ Generated ${OUTPUT_FILE}`);
    console.log(`   ${updates.length} updates`);
    console.log(`   ${updates.filter(u => u.featured).length} featured`);
    console.log(`   Categories: ${[...new Set(updates.map(u => u.category))].join(', ')}`);

  } catch (error) {
    console.error('❌ Error generating updates:', error.message);

    // Fall back to defaults on error
    console.log('\n⚠️  Using default updates due to error.');
    const javascript = generateJavaScript(DEFAULT_UPDATES);
    fs.writeFileSync(OUTPUT_FILE, javascript);
    console.log(`✅ Generated ${OUTPUT_FILE} with defaults`);
  }
}

main();
