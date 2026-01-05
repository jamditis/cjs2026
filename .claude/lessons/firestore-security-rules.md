# Firestore security rules patterns

Lessons learned from CJS2026 development regarding Firestore security rules.

## Rule evaluation order

Firestore evaluates rules with OR logic - if ANY rule matches, access is granted. However, **query validation** is different from **document validation**.

### The permission-denied race condition

**Problem encountered:**
```
[code=permission-denied]: Missing or insufficient permissions.
```

This error occurred when the Admin panel's Updates tab tried to query Firestore before the user's authentication state was fully loaded.

**Root cause:**
```jsx
// BAD: Empty dependency array means this runs immediately on mount
useEffect(() => {
  const q = query(collection(db, 'updates'), orderBy('date', 'desc'))
  const unsubscribe = onSnapshot(q, (snapshot) => { ... })
  return () => unsubscribe()
}, [])  // <-- No dependencies!
```

**Solution:**
```jsx
// GOOD: Wait for currentUser before querying
useEffect(() => {
  if (!currentUser) {
    setLoading(false)
    return
  }

  const q = query(collection(db, 'updates'), orderBy('date', 'desc'))
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => { ... },
    (error) => {
      console.error('Firestore listener error:', error)
      // Fallback gracefully
    }
  )
  return () => unsubscribe()
}, [currentUser])  // <-- Depend on auth state
```

## Role-based access patterns

### Helper functions

Define reusable helper functions at the top of your rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isSuperAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }

    // ... rules using these functions
  }
}
```

### Layered read permissions

For collections with both public and admin access, layer the rules:

```javascript
match /updates/{updateId} {
  // Admin check FIRST (more permissive for admins)
  allow read: if isAdmin() || isSuperAdmin();
  // Then public check (restricted)
  allow read: if resource.data.visible == true;
  // Write is admin-only
  allow create, update, delete: if isAdmin() || isSuperAdmin();
}
```

### User profile visibility patterns

For shared schedules with configurable visibility:

```javascript
match /users/{userId} {
  // Users can always access their own profile
  allow read, write: if request.auth != null && request.auth.uid == userId;

  // Public profiles - anyone can read
  allow read: if resource.data.scheduleVisibility == 'public';

  // Attendees-only - authenticated users can read
  allow read: if request.auth != null && resource.data.scheduleVisibility == 'attendees_only';

  // Admins can read all
  allow read: if isAdmin() || isSuperAdmin();
}
```

## CMS collection patterns

For admin-managed content that's publicly readable:

```javascript
// Content anyone can read, admins can edit, super_admins can delete
match /cmsContent/{docId} {
  allow read: if true;
  allow create, update: if isAdmin() || isSuperAdmin();
  allow delete: if isSuperAdmin();
}
```

## Always add error handlers to snapshots

```jsx
const unsubscribe = onSnapshot(
  query,
  (snapshot) => {
    // Success handler
  },
  (error) => {
    // Error handler - ALWAYS include this
    console.error('Snapshot error:', error)
    // Provide fallback behavior
  }
)
```

## Key takeaways

1. **Auth timing matters** - Always wait for auth state before querying protected collections
2. **Add error handlers** - `onSnapshot` can fail; handle it gracefully
3. **Layer permissions** - Check admin access before public access
4. **Test in CI** - Local dev may have different auth timing than production
5. **Deploy rules separately** - `firebase deploy --only firestore:rules`
