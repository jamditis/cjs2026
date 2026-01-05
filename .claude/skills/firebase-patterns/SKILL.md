---
name: firebase-patterns
description: Firebase integration patterns for CJS2026 - Cloud Functions, Firestore operations, security rules, and authentication flows
---

# Firebase Patterns

## When to Activate

Use this skill when the agent needs to:
- Create or modify Cloud Functions
- Write Firestore security rules
- Debug authentication issues
- Understand the Firebase ↔ React integration
- Handle Eventbrite webhook integration

## Firebase Services Used

| Service | Purpose | Key Files |
|---------|---------|-----------|
| Auth | User authentication (Google, Magic Link) | `AuthContext.jsx` |
| Firestore | User profiles, logs, bookmarks | `firestore.rules` |
| Functions | Server-side logic, webhooks | `functions/index.js` |
| Storage | Profile photos | `storage.rules` |
| Hosting | Site deployment | `firebase.json` |

## Cloud Function Patterns

### Function Declaration Pattern

```javascript
exports.functionName = onRequest(
  {
    cors: true,
    secrets: [airtableApiKey]  // Only if needed
  },
  async (req, res) => {
    // Implementation
  }
);
```

### Authentication Levels

```javascript
// Level 0: Public (no auth)
// Just implement the function

// Level 1: Authenticated user
const auth = await verifyAuthToken(req.headers.authorization);
if (!auth) {
  return res.status(401).json({ error: "Unauthorized" });
}

// Level 2: Admin required
const admin = await requireAdmin(req);

// Level 3: Super admin required
const superAdmin = await requireSuperAdmin(req);
```

### Error Handling Pattern

```javascript
try {
  // Main logic
  await logActivity('action_type', userId, { details });
  res.json({ success: true, data });
} catch (error) {
  await logError('functionName', error, { context });
  res.status(500).json({ error: error.message });
}
```

### Logging Collections

| Collection | Purpose | Write Access |
|------------|---------|--------------|
| `activity_logs` | User actions | Cloud Functions |
| `admin_logs` | Admin actions | Cloud Functions |
| `system_errors` | Error tracking | Cloud Functions |
| `background_jobs` | Job execution | Cloud Functions |

## Firestore Security Rules Pattern

### User Profile Rules

```javascript
match /users/{userId} {
  // User can read/write own profile
  allow read, write: if request.auth.uid == userId;

  // Admin can read all
  allow read: if isAdmin();

  // Admin can update (but not role field)
  allow update: if isAdmin() &&
    !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']);

  // Super admin can update anything
  allow update: if isSuperAdmin();
}
```

### Admin-Only Collections

```javascript
match /activity_logs/{doc} {
  allow read: if isAdmin();
  allow write: if false;  // Cloud Functions only
}
```

## User Profile Schema

Every user document has this structure (initialized on creation):

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

  // Eventbrite
  eventbriteAttendeeId, eventbriteOrderId,
  ticketsPurchased, ticketType,

  // Schedule
  savedSessions: [],
  scheduleVisibility: 'private' | 'attendees_only' | 'public',

  // Gamification
  attendedSummits: [], badges: [], customBadges: {},

  // Timestamps
  createdAt, updatedAt
}
```

## Safe Document Operations

**Critical pattern**: Always ensure document exists before merge operations.

```javascript
// In AuthContext.jsx
async function ensureUserDocumentExists(uid, email) {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await setDoc(docRef, {
      ...getEmptyProfileSchema(),
      email,
      createdAt: serverTimestamp(),
    });
  }
}

// Call before any merge operation
await ensureUserDocumentExists(uid, email);
await setDoc(userRef, updates, { merge: true });
```

## Bookmark Count Sync

Atomic increment/decrement pattern:

```javascript
// In saveSession()
await setDoc(
  doc(db, 'sessionBookmarks', sessionId),
  { count: increment(1), updatedAt: serverTimestamp() },
  { merge: true }
);

// In unsaveSession()
await setDoc(
  doc(db, 'sessionBookmarks', sessionId),
  { count: increment(-1), updatedAt: serverTimestamp() },
  { merge: true }
);
```

## Admin Authorization Check

Dual system for backwards compatibility:

```javascript
// In functions/index.js
const ADMIN_EMAILS = [
  "jamditis@gmail.com",
  "murrayst@montclair.edu",
  "etiennec@montclair.edu",
];

async function isAdmin(uid, email = null) {
  // Check hardcoded list first (bootstrap access)
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    return true;
  }

  // Then check Firestore role
  const userDoc = await db.collection('users').doc(uid).get();
  const role = userDoc.data()?.role;
  return role === 'admin' || role === 'super_admin';
}
```

## Integration Points

- **cjs-architecture** - For understanding full system flow
- **cms-content-pipeline** - For Airtable sync functions

## Guidelines

1. Always use `verifyAuthToken()` for authenticated endpoints
2. Log errors with `logError()` helper for admin visibility
3. Use `logActivity()` for user-facing actions
4. Use `logAdminAction()` for admin operations (audit trail)
5. Test security rules locally before deploying
6. Remember: Storage rules are NOT YET DEPLOYED
