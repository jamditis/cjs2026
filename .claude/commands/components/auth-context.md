---
allowed-tools: Read, Grep
description: Reference for AuthContext - authentication, profiles, and schedule features
---

# AuthContext Reference

`src/contexts/AuthContext.jsx` - Central state management for auth, profiles, and schedules.

## Exported Values

```javascript
const {
  // Auth state
  currentUser,          // Firebase Auth user object
  userProfile,          // Firestore profile document
  loading,              // Auth loading state
  needsProfileSetup,    // True if profile incomplete

  // Auth actions
  loginWithGoogle,      // () => Promise - OAuth popup/redirect
  sendMagicLink,        // (email) => Promise - Email magic link
  completeSignInWithEmailLink,  // (url) => Promise
  logout,               // () => Promise

  // Profile actions
  createUserProfile,    // (user) => Promise - Called on first sign-in
  updateUserProfile,    // (updates) => Promise - Merge updates
  completeProfileSetup, // () => Promise - Clear needsProfileSetup flag
  getUserProfile,       // (uid) => Promise - Fetch any user's profile

  // Schedule actions
  saveSession,          // (sessionId) => Promise - Add to saved
  unsaveSession,        // (sessionId) => Promise - Remove from saved
  isSessionSaved,       // (sessionId) => boolean
  updateScheduleVisibility,  // (visibility) => Promise
  canBookmarkSessions,  // () => boolean - Based on registration status
} = useAuth();
```

## User Profile Schema

All fields initialized on account creation:
```javascript
{
  // Identity
  email, displayName, photoURL,

  // Professional
  organization, jobTitle,

  // Social
  website, instagram, linkedin, bluesky,

  // Registration
  registrationStatus: 'pending' | 'registered' | 'confirmed',
  role: null | 'admin' | 'super_admin',
  notifyWhenTicketsAvailable: false,

  // Eventbrite
  eventbriteAttendeeId, eventbriteOrderId,
  ticketsPurchased, ticketType, ticketPurchasedAt,
  ticketRefunded, checkedIn,

  // Schedule
  savedSessions: [],
  scheduleVisibility: 'private' | 'attendees_only' | 'public',

  // Gamification
  attendedSummits: [],
  badges: [],
  customBadges: { philosophy: [], misc: [] },

  // Timestamps
  createdAt, updatedAt,
}
```

## Key Patterns

### Safe Document Updates
Always uses `ensureUserDocumentExists()` before merge operations:
```javascript
async function updateUserProfile(updates) {
  await ensureUserDocumentExists(currentUser.uid, currentUser.email);
  await setDoc(userRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
}
```

### Bookmark Count Sync
Saving/unsaving sessions atomically updates `sessionBookmarks/{sessionId}.count`:
```javascript
await setDoc(bookmarkRef, { count: increment(1) }, { merge: true });
```

## Usage Example

```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { currentUser, userProfile, saveSession } = useAuth();

  if (!currentUser) return <LoginPrompt />;

  return (
    <div>
      <p>Welcome, {userProfile?.displayName}</p>
      <button onClick={() => saveSession('session-1')}>
        Save Session
      </button>
    </div>
  );
}
```
