---
allowed-tools: Read, Grep, Glob
description: Debug authentication and user profile issues
---

# Debug Auth Issues

Common authentication problems and how to diagnose them.

## Quick Checks

### 1. User Document Exists?
Check Firestore for user document:
- Collection: `users`
- Document ID: Firebase Auth UID

### 2. Profile Complete?
Required fields for full access:
- `displayName` (non-empty)
- `email`
- `registrationStatus` ('registered' or 'confirmed' for full access)

### 3. Admin Access?
Check in this order:
1. Is email in hardcoded `ADMIN_EMAILS` list?
2. Does Firestore user document have `role: 'admin'` or `role: 'super_admin'`?

## Common Issues

### "Permission denied" on Firestore
- User trying to read another user's profile (only admins can)
- Missing auth token in Cloud Function call
- Firestore rules not deployed (`firebase deploy --only firestore:rules`)

### Google sign-in fails
- Check browser allows popups (or redirect fallback triggers)
- Verify Firebase Auth > Google provider enabled
- Check domain is in authorized domains list

### Magic link doesn't work
- Check spam folder
- Link already used (single-use)
- Link expired (default 1 hour)
- Cross-browser issue (email stored in localStorage)

### User stuck on "pending"
- Admin needs to update `registrationStatus` in Firestore
- Or user purchased ticket via Eventbrite (webhook updates status)

### Profile not saving
- Check `ensureUserDocumentExists()` ran first
- Verify `merge: true` on `setDoc` calls
- Check Firestore rules allow user to write own document

## Key Files

```
src/contexts/AuthContext.jsx  - All auth logic
src/pages/Login.jsx           - Login UI
src/pages/Dashboard.jsx       - Protected dashboard
firestore.rules               - Security rules
functions/index.js            - Cloud Functions for admin ops
```

## ADMIN_EMAILS Locations

Hardcoded admin list appears in:
1. `src/pages/Dashboard.jsx`
2. `functions/index.js`

Should match in both places. Long-term: migrate to role-based only.
