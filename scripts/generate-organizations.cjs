/**
 * Generate organizations data file from Airtable Organizations table
 *
 * Usage: node scripts/generate-organizations.cjs
 *
 * This pulls all organizations from the Airtable Organizations table
 * and generates a JavaScript module for React components.
 * Organizations with the "Sponsor" field checked will be exported as sponsors.
 */

const fs = require('fs');
const path = require('path');

const AIRTABLE_BASE_ID = 'appL8Sn87xUotm4jF';
const AIRTABLE_TABLE_NAME = 'Organizations';

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

function processRecords(records) {
  const organizations = records.map((record) => {
    const fields = record.fields;

    // Get logo URL from various possible field formats
    const logoUrl = getLogoUrl(fields);

    // Build local logo path if logo file exists
    // Format: /sponsor-logos/{slug}.png
    const name = fields.Name || fields.name || 'Unknown';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    return {
      id: record.id,
      name: name,
      slug: slug,
      website: fields.Website || fields.website || fields.URL || fields.url || '',
      logoUrl: logoUrl,
      // Local logo path - assumes logos are stored as /sponsor-logos/{slug}.png
      // This can be overridden by the Logo URL field in Airtable
      localLogoPath: `/sponsor-logos/${slug}.png`,
      // Sponsor fields - check various field name formats
      isSponsor: fields.Sponsor === true || fields.sponsor === true || fields['Sponsor?'] === true || fields.is_sponsor === true,
      sponsorTier: getSponsorTier(fields),
      sponsorOrder: fields['Sponsor order'] || fields.sponsor_order || fields.SponsorOrder || fields.Order || fields.order || 999,
      // Other org info
      description: fields.Description || fields.description || '',
      type: fields.Type || fields.type || 'organization',
      visible: fields.Visible !== false && fields.visible !== false,
    };
  });

  // Get sponsors (organizations with Sponsor checked)
  const sponsors = organizations
    .filter(org => org.isSponsor && org.visible)
    .sort((a, b) => {
      // Sort by tier priority, then by order
      const tierPriority = {
        'presenting': 1,
        'lead': 2,
        'supporting': 3,
        'partner': 4,
        'media': 5,
        'community': 6,
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
  lead: 'Lead sponsors',
  supporting: 'Supporting sponsors',
  partner: 'Partners',
  media: 'Media partners',
  community: 'Community partners',
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
    // Fetch records
    console.log('\nFetching records from Airtable Organizations table...');
    const records = await fetchAllRecords();
    console.log(`Total records fetched: ${records.length}`);

    // Process records
    console.log('\nProcessing records...');
    const data = processRecords(records);
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
