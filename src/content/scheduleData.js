// AUTO-GENERATED FROM FIRESTORE - DO NOT EDIT
// Generated at: 2026-01-04T18:42:56.690Z

export const scheduleData = [
  {
    "id": "session-mon-1",
    "title": "Blue Engine coaching from Hub/how to build revenue for collaboratives",
    "type": "session",
    "day": "Monday",
    "startTime": "2026-06-08T20:30:00.000Z",
    "endTime": null,
    "description": "Explore effective strategies for building sustainable revenue streams within collaborative organizations as Joe Amditis shares insights from the Blue Engine coaching model. Attendees will gain practical guidance on leveraging coaching frameworks and innovative approaches to enhance financial stability and growth for collaboratives, with actionable takeaways to implement in their own organizations.",
    "room": null,
    "speakers": [
      "recqwUniSWUEUfgcx"
    ],
    "speakerOrgs": null,
    "track": null,
    "isBookmarkable": true,
    "color": "teal"
  },
  {
    "id": "session-tue-2",
    "title": "Community impact tracking framework from Hub",
    "type": "keynote",
    "day": "Tuesday",
    "startTime": "2026-06-09T15:30:00.000Z",
    "endTime": null,
    "description": "Explore the innovative community impact tracking framework developed by Hub as Joe Amditis delves into practical strategies for measuring and demonstrating the real-world effects of community initiatives. Attendees will gain valuable insights into effective data collection, analysis, and reporting methods, empowering them to better assess and communicate the outcomes of their own programs. This session is ideal for professionals seeking actionable tools to enhance transparency and accountability in community-driven projects.",
    "room": null,
    "speakers": [
      "recqwUniSWUEUfgcx"
    ],
    "speakerOrgs": null,
    "track": null,
    "isBookmarkable": true,
    "color": "teal"
  }
];

// Sessions grouped by day
export const sessionsByDay = {
  "monday": [
    {
      "id": "session-mon-1",
      "title": "Blue Engine coaching from Hub/how to build revenue for collaboratives",
      "type": "session",
      "day": "Monday",
      "startTime": "2026-06-08T20:30:00.000Z",
      "endTime": null,
      "description": "Explore effective strategies for building sustainable revenue streams within collaborative organizations as Joe Amditis shares insights from the Blue Engine coaching model. Attendees will gain practical guidance on leveraging coaching frameworks and innovative approaches to enhance financial stability and growth for collaboratives, with actionable takeaways to implement in their own organizations.",
      "room": null,
      "speakers": [
        "recqwUniSWUEUfgcx"
      ],
      "speakerOrgs": null,
      "track": null,
      "isBookmarkable": true,
      "color": "teal"
    }
  ],
  "tuesday": [
    {
      "id": "session-tue-2",
      "title": "Community impact tracking framework from Hub",
      "type": "keynote",
      "day": "Tuesday",
      "startTime": "2026-06-09T15:30:00.000Z",
      "endTime": null,
      "description": "Explore the innovative community impact tracking framework developed by Hub as Joe Amditis delves into practical strategies for measuring and demonstrating the real-world effects of community initiatives. Attendees will gain valuable insights into effective data collection, analysis, and reporting methods, empowering them to better assess and communicate the outcomes of their own programs. This session is ideal for professionals seeking actionable tools to enhance transparency and accountability in community-driven projects.",
      "room": null,
      "speakers": [
        "recqwUniSWUEUfgcx"
      ],
      "speakerOrgs": null,
      "track": null,
      "isBookmarkable": true,
      "color": "teal"
    }
  ]
};

// Unique session types
export const sessionTypes = [
  "session",
  "keynote"
];

// Unique session tracks
export const sessionTracks = [];

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
  generatedAt: '2026-01-04T18:42:56.690Z',
  totalSessions: 2,
  mondaySessions: 1,
  tuesdaySessions: 1,
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
