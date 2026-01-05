/**
 * Generate static content files from Firestore CMS collections
 *
 * This script pulls content from Firestore and generates static JS files
 * that the frontend imports at build time.
 *
 * Usage: node scripts/generate-from-firestore.cjs
 *
 * Requirements:
 * - service-account.json file in project root (or set via GOOGLE_APPLICATION_CREDENTIALS)
 * - Firebase Admin SDK
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
function initFirebase() {
  // Check for service account file
  const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('   Firebase initialized with service account');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
    console.log('   Firebase initialized with application default credentials');
  } else {
    throw new Error('No Firebase credentials found. Provide service-account.json or set GOOGLE_APPLICATION_CREDENTIALS');
  }
}

const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content');

async function generateSiteContent() {
  console.log('\n   Generating siteContent.js from Firestore...');
  const db = admin.firestore();

  // Fetch all visible content, ordered by section then order
  const snapshot = await db.collection('cmsContent')
    .where('visible', '==', true)
    .get();

  // Build content structure
  const content = {};
  const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Sort by section and order
  allDocs.sort((a, b) => {
    if (a.section !== b.section) return (a.section || '').localeCompare(b.section || '');
    return (a.order || 0) - (b.order || 0);
  });

  allDocs.forEach(data => {
    const section = data.section || 'general';
    if (!content[section]) {
      content[section] = {};
    }
    content[section][data.field] = {
      content: data.content,
      color: data.color || null,
      component: data.component || null,
      link: data.link || null,
      order: data.order || 0
    };
  });

  // Fetch timeline data
  const timelineSnapshot = await db.collection('cmsTimeline')
    .where('visible', '==', true)
    .get();

  const timelineDocs = timelineSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  timelineDocs.sort((a, b) => (a.order || 0) - (b.order || 0));

  const timeline = timelineDocs.map(data => ({
    year: data.year,
    location: data.location,
    theme: data.theme || '',
    link: data.link || null,
    emoji: data.emoji || ''
  }));

  // Build stats array from content
  const stats = [];
  if (content.stats) {
    for (const [field, data] of Object.entries(content.stats)) {
      stats.push({
        field,
        value: data.content,
        color: data.color,
        order: data.order
      });
    }
    stats.sort((a, b) => a.order - b.order);
  }

  const output = `// AUTO-GENERATED FROM FIRESTORE - DO NOT EDIT
// Generated at: ${new Date().toISOString()}

const siteContent = ${JSON.stringify(content, null, 2)};

export const timeline = ${JSON.stringify(timeline, null, 2)};

export const stats = ${JSON.stringify(stats, null, 2)};

export function getContent(section, field, fallback = '') {
  return siteContent[section]?.[field]?.content ?? fallback;
}

export function getContentMeta(section, field) {
  return siteContent[section]?.[field] ?? null;
}

export function getColorClass(color, type = 'text') {
  const colorMap = {
    teal: { text: 'text-brand-teal', bg: 'bg-brand-teal', border: 'border-brand-teal' },
    cardinal: { text: 'text-brand-cardinal', bg: 'bg-brand-cardinal', border: 'border-brand-cardinal' },
    ink: { text: 'text-brand-ink', bg: 'bg-brand-ink', border: 'border-brand-ink' },
    'green-dark': { text: 'text-green-800', bg: 'bg-green-800', border: 'border-green-800' }
  };
  return colorMap[color]?.[type] ?? '';
}

export default siteContent;
`;

  fs.writeFileSync(path.join(CONTENT_DIR, 'siteContent.js'), output);
  console.log(`   ✓ Generated siteContent.js (${allDocs.length} content items, ${timeline.length} timeline entries)`);
}

async function generateScheduleData() {
  console.log('\n   Generating scheduleData.js from Firestore...');
  const db = admin.firestore();

  const snapshot = await db.collection('cmsSchedule')
    .where('visible', '==', true)
    .get();

  const sessionDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  sessionDocs.sort((a, b) => (a.order || 0) - (b.order || 0));

  const sessions = sessionDocs.map(data => ({
    id: data.sessionId || data.id,
    title: data.title,
    type: data.type,
    day: data.day,
    startTime: data.startTime,
    endTime: data.endTime || null,
    description: data.description || '',
    room: data.room || null,
    speakers: data.speakers || null,
    speakerOrgs: data.speakerOrgs || null,
    track: data.track || null,
    isBookmarkable: data.isBookmarkable !== false,
    color: data.color || 'teal'
  }));

  // Group sessions by day
  const sessionsByDay = {
    monday: sessions.filter(s => s.day?.toLowerCase() === 'monday'),
    tuesday: sessions.filter(s => s.day?.toLowerCase() === 'tuesday')
  };

  // Get unique types and tracks
  const sessionTypes = [...new Set(sessions.map(s => s.type).filter(Boolean))];
  const sessionTracks = [...new Set(sessions.map(s => s.track).filter(Boolean))];

  const output = `// AUTO-GENERATED FROM FIRESTORE - DO NOT EDIT
// Generated at: ${new Date().toISOString()}

export const scheduleData = ${JSON.stringify(sessions, null, 2)};

// Sessions grouped by day
export const sessionsByDay = ${JSON.stringify(sessionsByDay, null, 2)};

// Unique session types
export const sessionTypes = ${JSON.stringify(sessionTypes, null, 2)};

// Unique session tracks
export const sessionTracks = ${JSON.stringify(sessionTracks, null, 2)};

// Type colors mapping for UI
export const typeColors = {
  session: { bg: 'bg-brand-teal/5', text: 'text-brand-teal', border: 'border-brand-teal/20' },
  workshop: { bg: 'bg-brand-cardinal/5', text: 'text-brand-cardinal', border: 'border-brand-cardinal/20' },
  break: { bg: 'bg-brand-cream', text: 'text-brand-ink/60', border: 'border-brand-ink/10' },
  special: { bg: 'bg-brand-green-dark/5', text: 'text-brand-green-dark', border: 'border-brand-green-dark/20' },
  lightning: { bg: 'bg-brand-gold/10', text: 'text-brand-gold', border: 'border-brand-gold/20' },
};

// Generation metadata
export const metadata = {
  generatedAt: '${new Date().toISOString()}',
  totalSessions: ${sessions.length},
  mondaySessions: ${sessionsByDay.monday.length},
  tuesdaySessions: ${sessionsByDay.tuesday.length},
};

export function getSessionById(id) {
  return scheduleData.find(s => s.id === id);
}

export function getSessionsByIds(ids) {
  return scheduleData.filter(s => ids.includes(s.id));
}

export function getSessionsByDay(day) {
  return sessionsByDay[day?.toLowerCase()] || [];
}

export function getBookmarkableSessions() {
  return scheduleData.filter(s => s.isBookmarkable);
}

export default {
  sessions: scheduleData,
  sessionsByDay,
  sessionTypes,
  sessionTracks,
  getSessionById,
  getSessionsByIds,
  getBookmarkableSessions,
  typeColors,
  metadata
};
`;

  fs.writeFileSync(path.join(CONTENT_DIR, 'scheduleData.js'), output);
  console.log(`   ✓ Generated scheduleData.js (${sessions.length} sessions)`);
}

async function generateOrganizationsData() {
  console.log('\n   Generating organizationsData.js from Firestore...');
  const db = admin.firestore();

  const snapshot = await db.collection('cmsOrganizations')
    .where('visible', '==', true)
    .get();

  const orgDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const organizations = orgDocs.map(data => ({
    id: data.id,
    name: data.name,
    logoUrl: data.logoUrl || null,
    website: data.website || null,
    isSponsor: data.isSponsor || false,
    sponsorTier: data.sponsorTier || null,
    sponsorOrder: data.sponsorOrder || 99,
    description: data.description || '',
    type: data.type || null
  }));

  // Sort sponsors by tier order then sponsor order
  const tierOrder = ['presenting', 'presenting sponsor', 'lead', 'supporting', 'partner', 'media', 'community'];
  const sponsors = organizations
    .filter(o => o.isSponsor)
    .sort((a, b) => {
      // Normalize tier names for comparison
      const aTier = (a.sponsorTier || '').toLowerCase().replace(' sponsor', '');
      const bTier = (b.sponsorTier || '').toLowerCase().replace(' sponsor', '');
      const tierDiff = tierOrder.indexOf(aTier) - tierOrder.indexOf(bTier);
      if (tierDiff !== 0) return tierDiff;
      return (a.sponsorOrder || 99) - (b.sponsorOrder || 99);
    });

  // Group sponsors by tier (normalized key)
  const sponsorsByTier = sponsors.reduce((acc, sponsor) => {
    // Normalize tier key (remove " sponsor" suffix, lowercase)
    const tierKey = (sponsor.sponsorTier || 'other').toLowerCase().replace(' sponsor', '');
    if (!acc[tierKey]) {
      acc[tierKey] = [];
    }
    acc[tierKey].push(sponsor);
    return acc;
  }, {});

  const output = `// AUTO-GENERATED FROM FIRESTORE - DO NOT EDIT
// Generated at: ${new Date().toISOString()}

export const organizations = ${JSON.stringify(organizations, null, 2)};

export const sponsors = ${JSON.stringify(sponsors, null, 2)};

// Sponsors grouped by tier (normalized keys)
export const sponsorsByTier = ${JSON.stringify(sponsorsByTier, null, 2)};

// Tier display names for UI
export const tierDisplayNames = {
  presenting: 'Presenting sponsor',
  lead: 'Lead sponsors',
  supporting: 'Supporting sponsors',
  partner: 'Partners',
  media: 'Media partners',
  community: 'Community partners',
  other: 'Sponsors'
};

export function getSponsorsByTier(tier) {
  return sponsorsByTier[tier?.toLowerCase()] || [];
}

export function hasSponsors() {
  return sponsors.length > 0;
}

export function getTiers() {
  return Object.keys(sponsorsByTier);
}

export default organizations;
`;

  fs.writeFileSync(path.join(CONTENT_DIR, 'organizationsData.js'), output);
  console.log(`   ✓ Generated organizationsData.js (${organizations.length} organizations, ${sponsors.length} sponsors)`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('  FIRESTORE CMS CONTENT GENERATION');
  console.log('='.repeat(60));

  try {
    initFirebase();

    // Ensure content directory exists
    if (!fs.existsSync(CONTENT_DIR)) {
      fs.mkdirSync(CONTENT_DIR, { recursive: true });
    }

    await generateSiteContent();
    await generateScheduleData();
    await generateOrganizationsData();

    console.log('\n' + '='.repeat(60));
    console.log('  ✅ All content generated successfully');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Generation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
