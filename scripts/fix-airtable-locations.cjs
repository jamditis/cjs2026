/**
 * Fix Airtable Locations table - Update Chapel Hill venues to Pittsburgh
 * Run: node scripts/fix-airtable-locations.cjs
 */

require('dotenv').config();

const AIRTABLE_PAT = process.env.VITE_AIRTABLE_KEY;
const BASE_ID = 'appL8Sn87xUotm4jF';

async function updateRecord(tableId, recordId, fields) {
  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${tableId}/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update ${recordId}: ${error}`);
  }

  return response.json();
}

async function deleteRecord(tableId, recordId) {
  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${tableId}/${recordId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete ${recordId}: ${error}`);
  }

  return response.json();
}

async function main() {
  console.log('🔧 Fixing Airtable Locations table...\n');

  // Update UNC Friday Center -> Pittsburgh Main Venue
  console.log('1. Updating UNC Friday Center -> Pittsburgh Main Venue (TBA)');
  try {
    await updateRecord('Locations', 'recRAqIrPx0GDuhUS', {
      'Location': 'Pittsburgh Main Venue (TBA)',
      'Info': 'Main event space in Pittsburgh, PA. Specific venue to be announced.'
    });
    console.log('   ✅ Updated successfully');
  } catch (err) {
    console.error('   ❌ Error:', err.message);
  }

  // Update Trillium Dining Room -> Pittsburgh Dining Room
  console.log('2. Updating Trillium Dining Room -> Pittsburgh Dining Room (TBA)');
  try {
    await updateRecord('Locations', 'recAsa1aa1awhZ6tA', {
      'Location': 'Pittsburgh Dining Room (TBA)',
      'Info': 'Meal service location in Pittsburgh. Specific venue to be announced.'
    });
    console.log('   ✅ Updated successfully');
  } catch (err) {
    console.error('   ❌ Error:', err.message);
  }

  // Update other Chapel Hill venues to Pittsburgh generic names
  const otherVenues = [
    { id: 'rec922r4ElJSHcUPz', old: 'Redbud', new: 'Pittsburgh Room A (TBA)' },
    { id: 'recMO2BOR4HzObOY8', old: 'Bellflower', new: 'Pittsburgh Room B (TBA)' },
    { id: 'recOSLOspe9GuYxm2', old: 'Windflower', new: 'Pittsburgh Room C (TBA)' },
    { id: 'recQmKkfkQPSbTxi0', old: 'Wintergreen', new: 'Pittsburgh Room D (TBA)' },
    { id: 'recs57WyRbshu54qc', old: 'Willow Lounge', new: 'Pittsburgh Lounge (TBA)' },
    { id: 'recxLtCdBCigdnpYv', old: 'Grumman Auditorium', new: 'Pittsburgh Auditorium (TBA)' }
  ];

  for (const venue of otherVenues) {
    console.log(`3. Updating ${venue.old} -> ${venue.new}`);
    try {
      await updateRecord('Locations', venue.id, {
        'Location': venue.new,
        'Info': 'Pittsburgh venue TBA. Will be updated when confirmed.'
      });
      console.log('   ✅ Updated successfully');
    } catch (err) {
      console.error('   ❌ Error:', err.message);
    }
  }

  console.log('\n✅ Location updates complete!');
  console.log('\n---\n');

  // Clean up test attendees
  console.log('🧹 Cleaning up test attendees...\n');

  const testAttendees = [
    { id: 'recaL28KTkyAxpwzI', name: 'Victor Anthony Barnes' },
    { id: 'recpmMa0KIlajdOf7', name: 'TEST USER' }
  ];

  for (const attendee of testAttendees) {
    console.log(`Deleting test attendee: ${attendee.name}`);
    try {
      await deleteRecord('Attendees', attendee.id);
      console.log('   ✅ Deleted successfully');
    } catch (err) {
      console.error('   ❌ Error:', err.message);
    }
  }

  console.log('\n✅ All fixes complete!');
}

main().catch(console.error);
