# AuthContext API Reference

> **Module:** `src/contexts/AuthContext.jsx`
> **Last Updated:** December 2025

The AuthContext provides centralized authentication and user profile management for the CJS2026 website. It handles Firebase Authentication (Google OAuth + Magic Link), Firestore user profile operations, personal schedule management, and permission checks.

## Quick Start

```jsx
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { currentUser, userProfile, loginWithGoogle, logout } = useAuth()

  if (!currentUser) {
    return <button onClick={loginWithGoogle}>Sign In</button>
  }

  return <div>Welcome, {userProfile?.displayName}</div>
}
```

## Setup

Wrap your application with the `AuthProvider`:

```jsx
// In main.jsx or App.jsx
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes />
      </Router>
    </AuthProvider>
  )
}
```

---

## Context Values

### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `currentUser` | `User \| null` | Firebase Auth user object. `null` when not signed in. |
| `userProfile` | `UserProfile \| null` | Firestore user profile data. `null` when not loaded. |
| `loading` | `boolean` | `true` while auth state is being determined. |
| `needsProfileSetup` | `boolean` | `true` if user authenticated but lacks required fields (displayName). |

### Authentication Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `loginWithGoogle()` | — | `Promise<User \| null>` | Sign in with Google OAuth popup |
| `sendMagicLink(email)` | `email: string` | `Promise<void>` | Send passwordless magic link email |
| `completeSignInWithEmailLink(url)` | `url: string` | `Promise<User>` | Complete magic link sign-in |
| `isEmailLink(url)` | `url: string` | `boolean` | Check if URL is a valid sign-in link |
| `logout()` | — | `Promise<void>` | Sign out and clear state |

### Profile Management Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `completeProfileSetup(displayName, email?)` | `displayName: string`, `email?: string` | `Promise<UserProfile>` | Complete profile for new users |
| `getUserProfile(uid)` | `uid: string` | `Promise<UserProfile \| null>` | Fetch a user profile by UID |
| `updateUserProfile(uid, data)` | `uid: string`, `data: Partial<UserProfile>` | `Promise<UserProfile>` | Update profile fields |

### Schedule Builder Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `saveSession(sessionId)` | `sessionId: string` | `Promise<boolean>` | Add session to personal schedule |
| `unsaveSession(sessionId)` | `sessionId: string` | `Promise<boolean>` | Remove session from schedule |
| `isSessionSaved(sessionId)` | `sessionId: string` | `boolean` | Check if session is saved (sync) |
| `updateScheduleVisibility(visibility)` | `visibility: 'private' \| 'attendees_only' \| 'public'` | `Promise<boolean>` | Set schedule sharing visibility |

### Permission Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `canBookmarkSessions()` | — | `boolean` | Check if user can save sessions |

---

## Type Definitions

### UserProfile

User profile stored in Firestore `users/{uid}` collection.

```typescript
interface UserProfile {
  // Core identity
  id: string                 // Firestore document ID (= Firebase UID)
  email: string              // User's email address
  displayName: string        // User's display name
  photoURL: string           // URL to profile photo (Firebase Storage)

  // Professional info
  organization: string       // User's organization/company
  jobTitle: string           // User's job title/position

  // Social links
  website: string            // User's website URL (with https://)
  instagram: string          // Instagram username (without @)
  linkedin: string           // LinkedIn username
  bluesky: string            // Bluesky handle

  // Registration & status
  registrationStatus: 'pending' | 'registered' | 'confirmed' | 'approved'
  role: null | 'admin' | 'super_admin'
  notifyWhenTicketsAvailable: boolean

  // Eventbrite integration (set by webhook)
  eventbriteAttendeeId: string | null
  eventbriteOrderId: string | null

  // Schedule features
  savedSessions: string[]    // Array of session IDs
  scheduleVisibility: 'private' | 'attendees_only' | 'public'

  // Summit history & badges
  attendedSummits: number[]  // Array of years: [2017, 2022, ...]
  badges: string[]           // Array of badge IDs
  customBadges: {
    philosophy?: string[]
    misc?: string[]
  }

  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Schedule Visibility Levels

| Value | Description |
|-------|-------------|
| `'private'` | Only the user can see their schedule |
| `'attendees_only'` | Only registered attendees can view |
| `'public'` | Anyone with the link can view |

### Registration Status

| Value | Description |
|-------|-------------|
| `'pending'` | User signed in but hasn't purchased tickets |
| `'registered'` | User purchased tickets (set by Eventbrite webhook) |
| `'confirmed'` | User confirmed attendance |
| `'approved'` | Admin manually approved access |

---

## Detailed Method Documentation

### loginWithGoogle()

Signs in the user with Google OAuth using a popup window.

```jsx
const { loginWithGoogle } = useAuth()
const [error, setError] = useState(null)

async function handleGoogleSignIn() {
  try {
    setError(null)
    const user = await loginWithGoogle()
    if (user) {
      navigate('/dashboard')
    }
    // null means user cancelled - no action needed
  } catch (err) {
    setError(err.message)
  }
}
```

**Error Handling:**
- `popup-closed-by-user`: Returns `null` (user can retry)
- `popup-blocked`: Throws with message suggesting email sign-in
- `network-request-failed`: Throws with network error message

### sendMagicLink(email)

Sends a passwordless magic link to the user's email.

```jsx
const { sendMagicLink } = useAuth()
const [email, setEmail] = useState('')
const [sent, setSent] = useState(false)

async function handleSubmit(e) {
  e.preventDefault()
  try {
    await sendMagicLink(email)
    setSent(true)
  } catch (err) {
    console.error('Failed to send magic link:', err)
  }
}
```

The magic link redirects to `/auth/callback` where `completeSignInWithEmailLink()` should be called.

### completeSignInWithEmailLink(url)

Completes sign-in after clicking a magic link. Should be called from `/auth/callback`.

```jsx
// In AuthCallback.jsx
const { completeSignInWithEmailLink, isEmailLink } = useAuth()
const navigate = useNavigate()

useEffect(() => {
  const url = window.location.href
  if (isEmailLink(url)) {
    completeSignInWithEmailLink(url)
      .then(() => navigate('/dashboard'))
      .catch(err => {
        console.error('Sign-in failed:', err)
        navigate('/login?error=invalid-link')
      })
  }
}, [])
```

### completeProfileSetup(displayName, email?)

Completes profile setup for users who authenticated but lack required fields (common with Google Workspace accounts without display names).

```jsx
const { completeProfileSetup, needsProfileSetup } = useAuth()

if (needsProfileSetup) {
  return (
    <ProfileSetupModal
      onSubmit={async (name) => {
        await completeProfileSetup(name)
        // Profile is now complete, needsProfileSetup becomes false
      }}
    />
  )
}
```

### updateUserProfile(uid, data)

Updates specific fields on a user profile. Automatically handles document existence and schema consistency.

```jsx
const { updateUserProfile, currentUser } = useAuth()

// Update organization and job title
await updateUserProfile(currentUser.uid, {
  organization: 'The Washington Post',
  jobTitle: 'Senior Editor'
})

// Add attended summits
await updateUserProfile(currentUser.uid, {
  attendedSummits: [2022, 2023, 2024]
})
```

### saveSession(sessionId) / unsaveSession(sessionId)

Manages the user's personal schedule. Also updates global bookmark counts.

```jsx
const { saveSession, unsaveSession, isSessionSaved } = useAuth()

function BookmarkButton({ sessionId }) {
  const isSaved = isSessionSaved(sessionId)

  async function handleClick() {
    if (isSaved) {
      await unsaveSession(sessionId)
    } else {
      await saveSession(sessionId)
    }
  }

  return (
    <button onClick={handleClick}>
      {isSaved ? 'Remove' : 'Save'}
    </button>
  )
}
```

### canBookmarkSessions()

Checks if the current user has permission to save sessions. Permission is granted to:
- Admins and super admins
- Bootstrap admin emails
- Users with `registrationStatus` of `'registered'`, `'confirmed'`, or `'approved'`

```jsx
const { canBookmarkSessions } = useAuth()

function SessionCard({ session }) {
  const canSave = canBookmarkSessions()

  return (
    <div>
      <h3>{session.title}</h3>
      {canSave ? (
        <BookmarkButton sessionId={session.session_id} />
      ) : (
        <span className="text-gray-400">
          Purchase tickets to save sessions
        </span>
      )}
    </div>
  )
}
```

---

## Firestore Collections

### users/{uid}

User profile documents with the full schema (see UserProfile type above).

**Security Rules:**
- Users can read/write their own profile
- Admins can read all profiles
- Admins can update (except role field)
- Super admins can update any field

### sessionBookmarks/{sessionId}

Aggregate bookmark counts per session.

```javascript
{
  count: number,      // Number of users who saved this session
  updatedAt: Timestamp
}
```

---

## Bootstrap Admin Emails

These emails have admin access regardless of their Firestore `role` field:

```javascript
const ADMIN_EMAILS = [
  "jamditis@gmail.com",
  "murrayst@montclair.edu",
  "etiennec@montclair.edu"
]
```

This list is also in `Dashboard.jsx` and `functions/index.js`. Keep them in sync.

---

## Common Patterns

### Protected Routes

```jsx
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!currentUser) return <Navigate to="/login" />

  return children
}
```

### Conditional UI Based on Auth State

```jsx
function Navbar() {
  const { currentUser, userProfile, logout } = useAuth()

  return (
    <nav>
      <Logo />
      {currentUser ? (
        <>
          <span>Hi, {userProfile?.displayName}</span>
          <button onClick={logout}>Sign Out</button>
        </>
      ) : (
        <Link to="/login">Sign In</Link>
      )}
    </nav>
  )
}
```

### Admin-Only Features

```jsx
function AdminPanel() {
  const { userProfile, currentUser } = useAuth()

  const ADMIN_EMAILS = ["jamditis@gmail.com", "murrayst@montclair.edu", "etiennec@montclair.edu"]

  const isAdmin = userProfile?.role === 'admin' ||
                  userProfile?.role === 'super_admin' ||
                  ADMIN_EMAILS.includes(currentUser?.email)

  if (!isAdmin) return <Navigate to="/dashboard" />

  return <AdminDashboard />
}
```

---

## Related Files

| File | Purpose |
|------|---------|
| `src/pages/Login.jsx` | Login page with Google + magic link options |
| `src/pages/AuthCallback.jsx` | Magic link callback handler |
| `src/pages/Dashboard.jsx` | User dashboard with profile management |
| `src/components/ProtectedRoute.jsx` | Route protection wrapper |
| `docs/USER_PROFILE_SCHEMA.md` | Detailed profile schema documentation |
| `functions/index.js` | Cloud Functions (profile sync, admin operations) |
