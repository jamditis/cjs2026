---
allowed-tools: Read, Edit, Grep, Glob
argument-hint: <function-name> <auth-level: none|user|admin|super_admin>
description: Add a new Firebase Cloud Function following existing patterns in functions/index.js
---

# Add Cloud Function

Create a new endpoint in `functions/index.js` matching the project's established patterns.

**Arguments:** $1 = function name (camelCase), $2 = auth level required

## Existing Patterns to Follow

### Function Declaration
```javascript
exports.$1 = onRequest(
  { cors: true, secrets: [airtableApiKey] },  // Add secrets if needed
  async (req, res) => {
    // Implementation
  }
);
```

### Auth Verification (based on $2)
```javascript
// none - Public endpoint
// No verification needed

// user - Authenticated user required
const auth = await verifyAuthToken(req.headers.authorization);
if (!auth) {
  return res.status(401).json({ error: "Unauthorized" });
}

// admin - Admin role required
const admin = await requireAdmin(req);

// super_admin - Super admin required
const superAdmin = await requireSuperAdmin(req);
```

### Error Handling Pattern
```javascript
try {
  // Main logic
  await logActivity('action_type', userId, { details });
  res.json({ success: true, data });
} catch (error) {
  await logError('$1', error, { context });
  res.status(500).json({ error: error.message });
}
```

### Method Checking
```javascript
if (req.method !== 'POST') {
  return res.status(405).json({ error: 'Method not allowed' });
}
```

## Collections Available

- `users` - User profiles
- `activity_logs` - User actions (logActivity helper)
- `admin_logs` - Admin actions (logAdminAction helper)
- `system_errors` - Error tracking (logError helper)
- `background_jobs` - Async job tracking
- `announcements` - Site-wide banners
- `sessionBookmarks` - Bookmark counts per session

## Secrets Available

```javascript
const airtableApiKey = defineSecret("AIRTABLE_API_KEY");
const eventbriteToken = defineSecret("EVENTBRITE_TOKEN");
```

Add to function config if needed: `secrets: [airtableApiKey]`

Place the new function near related functions in the file. Document in CLAUDE.md under "Cloud Function endpoints".
