---
allowed-tools: Read, Grep
description: Audit Firestore and Storage security rules for vulnerabilities and overly permissive patterns
---

# Audit Firebase Security Rules

Review `firestore.rules` and `storage.rules` for security issues.

## Dangerous Patterns to Flag

### Critical (Fix Immediately)
- `allow read, write: if true;` - Public access to everything
- `allow write: if request.auth != null;` without user ownership check
- Missing `request.auth.uid == userId` on user documents
- Write rules without field validation

### Warning (Review Needed)
- Collections readable by all authenticated users
- Missing rate limiting considerations
- Broad document paths like `{allPaths=**}`

## Expected Rule Structure

### User Profiles
```javascript
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;  // Own profile
  allow read: if isAdmin();  // Admin can read all
  allow update: if isAdmin() && !touchesRoleField();  // Admin can update (not role)
  allow update: if isSuperAdmin();  // Super admin full access
}
```

### Admin-Only Collections
```javascript
match /activity_logs/{doc} {
  allow read: if isAdmin();
  allow write: if false;  // Cloud Functions only
}
```

### Public Read, Auth Write
```javascript
match /sessionBookmarks/{sessionId} {
  allow read: if true;
  allow update: if request.auth != null;
}
```

## Files to Check
- `/home/user/cjs2026/firestore.rules`
- `/home/user/cjs2026/storage.rules`

## Storage Rules

Current profile photo rules should enforce:
- User can only write to `profile-photos/{userId}/`
- Max file size: 2MB
- Content type: `image/*`
- Public read access

Report findings with line numbers and severity ratings.
