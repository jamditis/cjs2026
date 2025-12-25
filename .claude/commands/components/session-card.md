---
allowed-tools: Read, Grep
description: Understand the SessionCard component for schedule display and bookmarking
---

# SessionCard Component Reference

`src/components/SessionCard.jsx` - The core component for displaying schedule sessions.

## Props

```typescript
interface SessionCardProps {
  session: {
    id: string;
    title: string;
    description?: string;
    day: 'Monday' | 'Tuesday';
    startTime: string;
    endTime?: string;
    type: 'session' | 'workshop' | 'break' | 'special' | 'lightning';
    track?: string;
    room?: string;
    speakers?: string;
    speakerOrgs?: string;
    isBookmarkable: boolean;
  };
  index?: number;           // For staggered animations
  compact?: boolean;        // Smaller view for dashboard widget
  bookmarkCount?: number;   // Number of users who bookmarked
}
```

## Bookmark Integration

Uses AuthContext for bookmark state:
```jsx
const { isSessionSaved, saveSession, unsaveSession, canBookmarkSessions } = useAuth();

const handleBookmark = async () => {
  if (isSessionSaved(session.id)) {
    await unsaveSession(session.id);
  } else {
    await saveSession(session.id);
  }
};
```

## Bookmark Count Badges

```jsx
// Tiered styling based on popularity
if (count >= 10) {
  // Hot: Red/orange gradient, pulsing flame
} else if (count >= 5) {
  // Popular: Amber badge with flame
} else {
  // Normal: Gray badge with user icon
}
```

## Type Colors

```javascript
const typeColors = {
  session: 'bg-brand-teal',
  workshop: 'bg-amber-500',
  break: 'bg-gray-400',
  special: 'bg-brand-cardinal',
  lightning: 'bg-purple-500'
};
```

## Used In

- `src/pages/Schedule.jsx` - Main schedule page
- `src/components/MySchedule.jsx` - Dashboard widget and /my-schedule page
- `src/pages/SharedSchedule.jsx` - Public shared schedule view
