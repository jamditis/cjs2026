// AUTO-GENERATED FROM FIRESTORE - DO NOT EDIT
// Generated at: 2026-01-04T18:42:56.814Z

export const organizations = [
  {
    "id": "nWV0vqZUqu4OruwUUSv4",
    "name": "Knight Foundation",
    "logoUrl": "https://v5.airtableusercontent.com/v3/u/48/48/1767412800000/JcZvmU5kP7jfvdINcRKfpw/3jo9rgjUdnfdAOkogGv1vRvjYxj9VcsoJX2T-o60sVvZOeX9NswI8Xo6TSb4VJTH2c0fhtlSuwd9E_GSjkoRHRky3yHABU7quFLAh4X6nCnzjD3WdwKK4LEMGjoF5EfEwB87GfIn7z2gb3mszp9JQPbfzrjQpKKuFi1I3HrvJW8/Re1aUJki1CUsL7grb50ll5MJljTW-bLwKbDz2yy_KgU",
    "website": "https://knightfoundation.org/",
    "isSponsor": true,
    "sponsorTier": "presenting sponsor",
    "sponsorOrder": 99,
    "description": "",
    "type": null
  }
];

export const sponsors = [
  {
    "id": "nWV0vqZUqu4OruwUUSv4",
    "name": "Knight Foundation",
    "logoUrl": "https://v5.airtableusercontent.com/v3/u/48/48/1767412800000/JcZvmU5kP7jfvdINcRKfpw/3jo9rgjUdnfdAOkogGv1vRvjYxj9VcsoJX2T-o60sVvZOeX9NswI8Xo6TSb4VJTH2c0fhtlSuwd9E_GSjkoRHRky3yHABU7quFLAh4X6nCnzjD3WdwKK4LEMGjoF5EfEwB87GfIn7z2gb3mszp9JQPbfzrjQpKKuFi1I3HrvJW8/Re1aUJki1CUsL7grb50ll5MJljTW-bLwKbDz2yy_KgU",
    "website": "https://knightfoundation.org/",
    "isSponsor": true,
    "sponsorTier": "presenting sponsor",
    "sponsorOrder": 99,
    "description": "",
    "type": null
  }
];

// Sponsors grouped by tier (normalized keys)
export const sponsorsByTier = {
  "presenting": [
    {
      "id": "nWV0vqZUqu4OruwUUSv4",
      "name": "Knight Foundation",
      "logoUrl": "https://v5.airtableusercontent.com/v3/u/48/48/1767412800000/JcZvmU5kP7jfvdINcRKfpw/3jo9rgjUdnfdAOkogGv1vRvjYxj9VcsoJX2T-o60sVvZOeX9NswI8Xo6TSb4VJTH2c0fhtlSuwd9E_GSjkoRHRky3yHABU7quFLAh4X6nCnzjD3WdwKK4LEMGjoF5EfEwB87GfIn7z2gb3mszp9JQPbfzrjQpKKuFi1I3HrvJW8/Re1aUJki1CUsL7grb50ll5MJljTW-bLwKbDz2yy_KgU",
      "website": "https://knightfoundation.org/",
      "isSponsor": true,
      "sponsorTier": "presenting sponsor",
      "sponsorOrder": 99,
      "description": "",
      "type": null
    }
  ]
};

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
