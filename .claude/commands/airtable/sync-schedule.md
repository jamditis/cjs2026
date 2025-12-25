---
allowed-tools: Bash(npm run generate-schedule:*), Read, Grep
description: Pull session data from Airtable Schedule table and regenerate scheduleData.js
---

# Sync Schedule Data

Run `npm run generate-schedule` to pull sessions from Airtable.

## Expected Output Structure

```javascript
export const sessions = [
  {
    id: 'monday-session-1',
    title: 'Session Name',
    day: 'Monday',
    startTime: '9:00 AM',
    endTime: '10:00 AM',
    type: 'session',
    track: 'Track A',
    room: 'Main Hall',
    speakers: 'Name 1, Name 2',
    speakerOrgs: 'Org 1, Org 2',
    isBookmarkable: true,
    description: '...',
    order: 1,
    visible: true
  }
]
```

## Field Name Flexibility

The script handles variations: `day`/`Day`, `start_time`/`Start time`, etc.

After running, report:
- Total sessions generated
- Sessions by day (Monday/Tuesday)
- Any sessions with missing required fields (title, day, startTime)
- Sessions with `isBookmarkable: false` (breaks, etc.)
