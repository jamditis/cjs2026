#!/usr/bin/env node
/**
 * Setup Task Tracker table in Airtable with Kanban-friendly structure
 * Creates fields, populates initial tasks, and provides view setup instructions
 */

const AIRTABLE_BASE_ID = 'appL8Sn87xUotm4jF';
const TABLE_NAME = 'Task tracker';

// Load .env file
require('dotenv').config();

// Get API key from environment (supports both variable names)
const AIRTABLE_API_KEY = process.env.AIRTABLE_PAT_KEY || process.env.AIRTABLE_API_KEY;

if (!AIRTABLE_API_KEY) {
  console.error('Error: AIRTABLE_PAT_KEY environment variable not set');
  console.log('\nEnsure .env file has AIRTABLE_PAT_KEY=your_key');
  process.exit(1);
}

// Kanban statuses for the board
const STATUSES = [
  'Backlog',
  'To Do',
  'In Progress',
  'Review',
  'Done'
];

// Team members for assignment (multi-select)
const TEAM_MEMBERS = [
  'Joe Amditis',
  'Stefanie Murray',
  'Etienne Claret'
];

// Priority levels
const PRIORITIES = [
  'Critical',
  'High',
  'Medium',
  'Low'
];

// Categories for organizing tasks
const CATEGORIES = [
  'Frontend',
  'Backend',
  'Content',
  'Design',
  'DevOps',
  'Marketing',
  'Admin',
  'Bug Fix'
];

// Initial tasks to populate based on our work
// Field names match existing Airtable structure: Assigned (not Assignee), Notes (not Description)
const INITIAL_TASKS = [
  // DONE
  {
    Name: 'Fix stats animation bug on homepage',
    Notes: 'Stats were using wrong data structure - fixed to use {id, value, label} format. Hardcoded historical values for reliability.',
    Status: 'Done',
    Priority: 'High',
    Category: 'Bug Fix',
    Assigned: ['Joe Amditis'],
    'Date Added': new Date().toISOString().split('T')[0],
    'Date Completed': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Remove legacy App.jsx and unused code',
    Notes: '~1,720 lines of dead code removed including App.jsx, Register.jsx, ForgotPassword.jsx, timeline-data.json',
    Status: 'Done',
    Priority: 'Medium',
    Category: 'DevOps',
    Assigned: ['Joe Amditis'],
    'Date Added': new Date().toISOString().split('T')[0],
    'Date Completed': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Update FAQ - remove early bird and parallel tracks',
    Notes: 'No early bird pricing this year, single track schedule (no parallel sessions)',
    Status: 'Done',
    Priority: 'Medium',
    Category: 'Content',
    Assigned: ['Joe Amditis'],
    'Date Added': new Date().toISOString().split('T')[0],
    'Date Completed': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Update OG image and favicons to Pittsburgh',
    Notes: 'Replaced Chapel Hill imagery with Pittsburgh branding',
    Status: 'Done',
    Priority: 'High',
    Category: 'Design',
    Assigned: ['Joe Amditis'],
    'Date Added': new Date().toISOString().split('T')[0],
    'Date Completed': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Fix attendee count stats (2,569 not 1,500)',
    Notes: 'Updated all locations with accurate stats from Eventbrite CSV analysis',
    Status: 'Done',
    Priority: 'High',
    Category: 'Content',
    Assigned: ['Joe Amditis'],
    'Date Added': new Date().toISOString().split('T')[0],
    'Date Completed': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Create email outreach lists from historical data',
    Notes: 'Generated Super Fans, Class of 2020, OG attendees, Lapsed, and Recent lists',
    Status: 'Done',
    Priority: 'Medium',
    Category: 'Marketing',
    Assigned: ['Joe Amditis'],
    'Date Added': new Date().toISOString().split('T')[0],
    'Date Completed': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Add lesson documentation from sessions',
    Notes: 'Created lessons in .claude/lessons/ folder',
    Status: 'Done',
    Priority: 'Low',
    Category: 'Admin',
    Assigned: ['Joe Amditis'],
    'Date Added': new Date().toISOString().split('T')[0],
    'Date Completed': new Date().toISOString().split('T')[0]
  },

  // TO DO / BACKLOG
  {
    Name: 'Update Airtable location fields to Pittsburgh',
    Notes: 'Update venue_location, 2026_location, signup_headline with Pittsburgh info',
    Status: 'To Do',
    Priority: 'High',
    Category: 'Content',
    Assigned: ['Stefanie Murray'],
    'Date Added': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Confirm Pittsburgh venue name',
    Notes: 'Need to update venue_name in Airtable once confirmed',
    Status: 'Backlog',
    Priority: 'High',
    Category: 'Admin',
    Assigned: [],
    'Date Added': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Deploy Firebase Storage rules',
    Notes: 'Profile photo upload rules are configured but need deployment',
    Status: 'To Do',
    Priority: 'Medium',
    Category: 'DevOps',
    Assigned: ['Joe Amditis'],
    'Date Added': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Send Super Fans outreach email',
    Notes: 'Use planning/email-campaign-templates.md and planning/outreach-lists/super-fans.csv',
    Status: 'Backlog',
    Priority: 'Medium',
    Category: 'Marketing',
    Assigned: ['Stefanie Murray'],
    'Date Added': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Send Class of 2020 re-engagement email',
    Notes: '552 pandemic first-timers who never returned - use "finally meet in person" messaging',
    Status: 'Backlog',
    Priority: 'Medium',
    Category: 'Marketing',
    Assigned: ['Stefanie Murray'],
    'Date Added': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Archive unused CMS components',
    Notes: 'Move CMSManager.jsx, CMSTour.jsx, cmsArchitecture.js to deprecated folder',
    Status: 'Backlog',
    Priority: 'Low',
    Category: 'DevOps',
    Assigned: ['Joe Amditis'],
    'Date Added': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Set up Eventbrite registration',
    Notes: 'Create 2026 event in Eventbrite, configure ticket types',
    Status: 'Backlog',
    Priority: 'High',
    Category: 'Admin',
    Assigned: [],
    'Date Added': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Finalize session schedule',
    Notes: 'Populate Schedule table in Airtable with confirmed sessions',
    Status: 'Backlog',
    Priority: 'High',
    Category: 'Content',
    Assigned: ['Stefanie Murray'],
    'Date Added': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Recruit additional sponsors',
    Notes: 'Knight Foundation is presenting sponsor - need lead/supporting sponsors',
    Status: 'In Progress',
    Priority: 'High',
    Category: 'Admin',
    Assigned: ['Stefanie Murray'],
    'Date Added': new Date().toISOString().split('T')[0]
  },
  {
    Name: 'Review session pitch submissions',
    Notes: 'Deadline is January 31 - need to review and select sessions',
    Status: 'To Do',
    Priority: 'High',
    Category: 'Content',
    Assigned: ['Stefanie Murray', 'Joe Amditis'],
    'Date Added': new Date().toISOString().split('T')[0]
  }
];

async function makeRequest(method, endpoint, body = null, queryParams = '') {
  const encodedEndpoint = encodeURIComponent(endpoint);
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodedEndpoint}${queryParams}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Airtable API error: ${JSON.stringify(data)}`);
  }

  return data;
}

async function checkTableExists() {
  try {
    // Try to get one record from the table
    const data = await makeRequest('GET', TABLE_NAME, null, '?maxRecords=1');
    return { exists: true, records: data.records };
  } catch (error) {
    if (error.message.includes('NOT_FOUND') || error.message.includes('Could not find')) {
      return { exists: false };
    }
    throw error;
  }
}

async function createRecords(records) {
  // Airtable limits batch creates to 10 records at a time
  const batches = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  const results = [];
  for (const batch of batches) {
    const data = await makeRequest('POST', TABLE_NAME, {
      records: batch.map(record => ({ fields: record })),
      typecast: true // Auto-create select options
    });
    results.push(...data.records);
    console.log(`  Created ${data.records.length} records...`);
  }

  return results;
}

async function main() {
  console.log('🎯 Setting up Task Tracker for CJS2026\n');

  // Check if table exists
  console.log('1. Checking if Task Tracker table exists...');
  const { exists, records } = await checkTableExists();

  if (!exists) {
    console.log('\n❌ Task Tracker table not found!');
    console.log('\n📋 Please create the table manually in Airtable:');
    console.log(`   1. Go to: https://airtable.com/${AIRTABLE_BASE_ID}`);
    console.log('   2. Click "+ Add or import" to create a new table');
    console.log('   3. Name it "Task Tracker"');
    console.log('   4. Run this script again\n');
    process.exit(1);
  }

  console.log('   ✓ Table exists');

  // Check if we should populate
  if (records && records.length > 0) {
    console.log(`\n⚠️  Table already has ${records.length}+ records.`);
    console.log('   To avoid duplicates, skipping initial population.');
    console.log('   Delete existing records first if you want to repopulate.\n');
  } else {
    console.log('\n2. Populating initial tasks...');
    try {
      await createRecords(INITIAL_TASKS);
      console.log(`   ✓ Created ${INITIAL_TASKS.length} tasks`);
    } catch (error) {
      console.error('   Error creating records:', error.message);
      console.log('\n   The table may need these fields configured:');
      console.log('   - Name (Primary field, Single line text)');
      console.log('   - Notes (Rich text)');
      console.log('   - Status (Single select: Backlog, To Do, In Progress, Review, Done)');
      console.log('   - Priority (Single select: Critical, High, Medium, Low)');
      console.log('   - Category (Single select: Frontend, Backend, Content, Design, DevOps, Marketing, Admin, Bug Fix)');
      console.log('   - Assigned (Multiple select: Joe Amditis, Stefanie Murray, Etienne Claret)');
      console.log('   - Date Added (Date)');
      console.log('   - Date Completed (Date)');
      process.exit(1);
    }
  }

  console.log('\n3. Setting up Kanban view...');
  console.log('\n   📋 CREATE THE KANBAN VIEW MANUALLY:');
  console.log(`   1. Go to: https://airtable.com/${AIRTABLE_BASE_ID}`);
  console.log('   2. Open the "Task Tracker" table');
  console.log('   3. Click the "+ Add view" button (or Views dropdown)');
  console.log('   4. Select "Kanban"');
  console.log('   5. Name it "Development Board"');
  console.log('   6. Set "Group by" field to "Status"');
  console.log('   7. Drag columns to order: Backlog → To Do → In Progress → Review → Done');
  console.log('   8. Click "Hide empty columns" if you want a cleaner view\n');

  console.log('   💡 OPTIONAL VIEWS TO CREATE:');
  console.log('   - "My Tasks" - Filter by Assignee, Grid view');
  console.log('   - "High Priority" - Filter Status != Done AND Priority = Critical or High');
  console.log('   - "By Category" - Kanban grouped by Category\n');

  console.log('✅ Task Tracker setup complete!\n');
  console.log('📊 Summary of tasks:');
  const byStatus = {};
  INITIAL_TASKS.forEach(t => {
    byStatus[t.Status] = (byStatus[t.Status] || 0) + 1;
  });
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`);
  });
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
