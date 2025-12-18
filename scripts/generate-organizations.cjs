/**
 * Generate organizations data file from Airtable Organizations table
 * and upload sponsor logos to Firebase Storage
 *
 * Usage: node scripts/generate-organizations.cjs
 *
 * This pulls all organizations from the Airtable Organizations table,
 * uploads sponsor logos to Firebase Storage for permanent URLs,
 * and generates a JavaScript module for React components.
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const AIRTABLE_BASE_ID = 'appL8Sn87xUotm4jF';
const AIRTABLE_TABLE_NAME = 'Organizations';
const STORAGE_BUCKET = 'cjs2026.firebasestorage.app';

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

// Initialize Firebase Admin
function initFirebase() {
  // Check if already initialized
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  // Try service account file first
  const serviceAccountPath = path.join(__dirname, '..', 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: STORAGE_BUCKET
    });
  }

  // Try environment variable (for CI/CD)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: STORAGE_BUCKET
    });
  }

  // Try application default credentials (for local dev with gcloud)
  try {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: STORAGE_BUCKET
    });
  } catch (e) {
    console.warn('Warning: Could not initialize Firebase Admin. Logo uploads will be skipped.');
    console.warn('To enable logo uploads, either:');
    console.warn('  1. Place service-account.json in the project root');
    console.warn('  2. Set FIREBASE_SERVICE_ACCOUNT environment variable');
    console.warn('  3. Run: gcloud auth application-default login');
    return null;
  }
}

const API_KEY = loadApiKey();
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'content', 'organizationsData.js');

async function fetchAllRecords() {
  let allRecords = [];
  let offset = null;
  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

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
      throw new Error(`Airtable API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    allRecords = allRecords.concat(data.records);
    offset = data.offset;

    console.log(`Fetched ${allRecords.length} records...`);
  } while (offset);

  return allRecords;
}

function getLogoUrl(fields) {
  // Try different field name variations for logo
  const logoField = fields.Logo || fields.logo || fields['Logo URL'] || fields.logo_url;

  if (!logoField) return null;

  // If it's an Airtable attachment array, get the first one's URL
  if (Array.isArray(logoField) && logoField.length > 0) {
    return logoField[0].url || logoField[0].thumbnails?.large?.url || null;
  }

  // If it's a string URL
  if (typeof logoField === 'string') {
    return logoField;
  }

  return null;
}

function getLogoFilename(fields) {
  const logoField = fields.Logo || fields.logo;
  if (Array.isArray(logoField) && logoField.length > 0 && logoField[0].filename) {
    return logoField[0].filename;
  }
  return null;
}

function getSponsorTier(fields) {
  // Try different field name variations
  const tierField = fields['Sponsor tier'] || fields.sponsor_tier || fields.SponsorTier || fields.Tier || fields.tier;

  if (!tierField) return 'supporting';

  // If it's an array (linked record or multi-select), get first value
  if (Array.isArray(tierField)) {
    const first = tierField[0];
    if (typeof first === 'string') return first.toLowerCase();
    if (first?.name) return first.name.toLowerCase();
    return 'supporting';
  }

  // If it's a string, return it lowercased
  if (typeof tierField === 'string') {
    return tierField.toLowerCase();
  }

  // If it's an object with a name property
  if (tierField?.name) {
    return tierField.name.toLowerCase();
  }

  return 'supporting';
}

/**
 * Download image from URL and upload to Firebase Storage
 * Returns the permanent public URL
 */
async function uploadLogoToFirebase(airtableUrl, slug, originalFilename) {
  if (!admin.apps.length) {
    console.log(`  Skipping upload for ${slug} (Firebase not initialized)`);
    return null;
  }

  try {
    // Determine file extension
    let ext = 'png';
    if (originalFilename) {
      const match = originalFilename.match(/\.(\w+)$/);
      if (match) ext = match[1].toLowerCase();
    } else if (airtableUrl) {
      // Try to get extension from URL
      const urlMatch = airtableUrl.match(/\.(\w+)(?:\?|$)/);
      if (urlMatch) ext = urlMatch[1].toLowerCase();
    }

    // Download image from Airtable
    console.log(`  Downloading ${slug} logo...`);
    const response = await fetch(airtableUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const filePath = `sponsor-logos/${slug}.${ext}`;
    const file = bucket.file(filePath);

    console.log(`  Uploading to Firebase Storage: ${filePath}`);
    await file.save(buffer, {
      metadata: {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
    });

    // Make the file public
    await file.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${STORAGE_BUCKET}/${filePath}`;
    console.log(`  Uploaded: ${publicUrl}`);

    return publicUrl;
  } catch (error) {
    console.error(`  Error uploading ${slug} logo:`, error.message);
    return null;
  }
}

async function processRecords(records) {
  const organizations = [];

  for (const record of records) {
    const fields = record.fields;

    // Get logo URL from various possible field formats
    const airtableLogoUrl = getLogoUrl(fields);
    const originalFilename = getLogoFilename(fields);

    // Build slug
    const name = fields.Name || fields.name || 'Unknown';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const isSponsor = fields.Sponsor === true || fields.sponsor === true || fields['Sponsor?'] === true || fields.is_sponsor === true;

    // Upload logo to Firebase if it's a sponsor with a logo
    let firebaseLogoUrl = null;
    if (isSponsor && airtableLogoUrl) {
      firebaseLogoUrl = await uploadLogoToFirebase(airtableLogoUrl, slug, originalFilename);
    }

    organizations.push({
      id: record.id,
      name: name,
      slug: slug,
      website: fields.Website || fields.website || fields.URL || fields.url || '',
      // Use Firebase URL if available, otherwise fall back to Airtable URL
      logoUrl: firebaseLogoUrl || airtableLogoUrl,
      // Keep local path as ultimate fallback
      localLogoPath: `/sponsor-logos/${slug}.png`,
      // Sponsor fields
      isSponsor: isSponsor,
      sponsorTier: getSponsorTier(fields),
      sponsorOrder: fields['Sponsor order'] || fields.sponsor_order || fields.SponsorOrder || fields.Order || fields.order || 999,
      // Other org info
      description: fields.Description || fields.description || '',
      type: fields.Type || fields.type || 'organization',
      visible: fields.Visible !== false && fields.visible !== false,
    });
  }

  // Get sponsors (organizations with Sponsor checked)
  const sponsors = organizations
    .filter(org => org.isSponsor && org.visible)
    .sort((a, b) => {
      // Sort by tier priority, then by order
      const tierPriority = {
        'presenting': 1,
        'presenting sponsor': 1,
        'lead': 2,
        'lead sponsor': 2,
        'supporting': 3,
        'supporting sponsor': 3,
        'partner': 4,
        'media': 5,
        'media partner': 5,
        'community': 6,
        'community partner': 6,
      };
      const tierA = tierPriority[a.sponsorTier?.toLowerCase()] || 99;
      const tierB = tierPriority[b.sponsorTier?.toLowerCase()] || 99;
      if (tierA !== tierB) return tierA - tierB;
      return a.sponsorOrder - b.sponsorOrder;
    });

  // Group sponsors by tier
  const sponsorsByTier = sponsors.reduce((acc, sponsor) => {
    const tier = sponsor.sponsorTier?.toLowerCase() || 'supporting';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(sponsor);
    return acc;
  }, {});

  return {
    organizations: organizations.filter(org => org.visible),
    sponsors,
    sponsorsByTier,
    totalOrganizations: organizations.length,
    totalSponsors: sponsors.length,
  };
}

function generateJavaScript(data) {
  const timestamp = new Date().toISOString();

  return `/**
 * Organizations data generated from Airtable
 *
 * Generated: ${timestamp}
 *
 * DO NOT EDIT THIS FILE DIRECTLY.
 * To update:
 * 1. Edit the "Organizations" table in Airtable
 * 2. Check the "Sponsor" field for organizations that should display as sponsors
 * 3. Run: npm run generate-organizations
 * 4. Review changes and commit
 *
 * Logos are automatically uploaded to Firebase Storage for permanent URLs.
 */

// All sponsors (organizations with Sponsor checked, sorted by tier then order)
export const sponsors = ${JSON.stringify(data.sponsors, null, 2)};

// Sponsors grouped by tier
export const sponsorsByTier = ${JSON.stringify(data.sponsorsByTier, null, 2)};

// All organizations (visible ones)
export const organizations = ${JSON.stringify(data.organizations, null, 2)};

// Helper function to get sponsor by ID
export function getSponsorById(id) {
  return sponsors.find(s => s.id === id) || null;
}

// Helper function to get sponsors by tier
export function getSponsorsByTier(tier) {
  return sponsorsByTier[tier?.toLowerCase()] || [];
}

// Check if there are any sponsors
export function hasSponsors() {
  return sponsors.length > 0;
}

// Get all unique sponsor tiers
export function getSponsorTiers() {
  return Object.keys(sponsorsByTier);
}

// Tier display names
export const tierDisplayNames = {
  presenting: 'Presenting sponsor',
  'presenting sponsor': 'Presenting sponsor',
  lead: 'Lead sponsors',
  'lead sponsor': 'Lead sponsors',
  supporting: 'Supporting sponsors',
  'supporting sponsor': 'Supporting sponsors',
  partner: 'Partners',
  media: 'Media partners',
  'media partner': 'Media partners',
  community: 'Community partners',
  'community partner': 'Community partners',
};

// Generation metadata
export const metadata = {
  generatedAt: '${timestamp}',
  totalOrganizations: ${data.totalOrganizations},
  totalSponsors: ${data.totalSponsors},
  tiers: ${JSON.stringify(Object.keys(data.sponsorsByTier))},
};

export default {
  sponsors,
  sponsorsByTier,
  organizations,
  getSponsorById,
  getSponsorsByTier,
  hasSponsors,
  getSponsorTiers,
  tierDisplayNames,
  metadata
};
`;
}

async function main() {
  console.log('='.repeat(50));
  console.log('Generating organizations data from Airtable');
  console.log('='.repeat(50));

  try {
    // Initialize Firebase
    console.log('\nInitializing Firebase Admin...');
    initFirebase();
    if (admin.apps.length > 0) {
      console.log('Firebase Admin initialized successfully');
    }

    // Fetch records
    console.log('\nFetching records from Airtable Organizations table...');
    const records = await fetchAllRecords();
    console.log(`Total records fetched: ${records.length}`);

    // Process records (includes logo uploads)
    console.log('\nProcessing records and uploading logos...');
    const data = await processRecords(records);
    console.log(`Total organizations: ${data.totalOrganizations}`);
    console.log(`Total sponsors: ${data.totalSponsors}`);

    if (data.totalSponsors > 0) {
      console.log('\nSponsors by tier:');
      for (const [tier, orgs] of Object.entries(data.sponsorsByTier)) {
        console.log(`  ${tier}: ${orgs.length} (${orgs.map(o => o.name).join(', ')})`);
      }
    } else {
      console.log('\nNo sponsors found (no organizations have the Sponsor field checked)');
    }

    // Generate JavaScript
    console.log('\nGenerating JavaScript...');
    const js = generateJavaScript(data);

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(OUTPUT_FILE, js, 'utf-8');
    console.log(`\nWritten to: ${OUTPUT_FILE}`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('Organizations generation complete!');
    console.log('='.repeat(50));
    console.log('\nNext steps:');
    console.log('1. Review the generated file');
    console.log('2. Run: npm run build');
    console.log('3. Test locally: npm run dev');

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
