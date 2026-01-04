---
allowed-tools: Read, Edit, Grep, Glob
argument-hint: <widget-name>
description: Add a new widget to the user Dashboard following existing card patterns
---

# Add Dashboard Widget

Create a new widget for `src/pages/Dashboard.jsx`.

**Argument:** $1 = widget name (e.g., "NetworkingCard", "SchedulePreview")

## Dashboard Structure

The Dashboard has these sections:
1. Status banner (pending users)
2. Profile card with edit modal
3. MySchedule widget
4. Badge display card
5. Quick links card

## Widget Pattern

```jsx
{/* $1 Widget */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
  className="card-sketch p-6"
>
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-heading text-xl text-brand-ink">Widget Title</h3>
    <span className="text-brand-teal">
      <IconComponent className="h-5 w-5" />
    </span>
  </div>

  {/* Widget content */}
  <div className="space-y-3">
    {/* ... */}
  </div>

  {/* Optional action button */}
  <button className="btn-primary w-full mt-4">
    Action Text
  </button>
</motion.div>
```

## Access Control

Check registration status before showing features:
```jsx
const hasFullAccess = isAdmin || ['registered', 'confirmed', 'approved'].includes(registrationStatus);

{hasFullAccess ? (
  <FullWidget />
) : (
  <LockedWidget message="Available after registration" />
)}
```

## State from AuthContext

Available via `useAuth()`:
- `currentUser` - Firebase auth user
- `userProfile` - Firestore profile data
- `savedSessions` - Array of session IDs
- `isSessionSaved(id)` - Check if session saved
- `saveSession(id)` / `unsaveSession(id)` - Toggle bookmark

## Animation Delay

Increment delay for each new card:
- Profile card: delay 0.2
- MySchedule: delay 0.3
- New widget: delay 0.4
- Quick links: delay 0.5
