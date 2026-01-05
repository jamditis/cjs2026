# Cloud Functions Reference

All endpoints in `functions/index.js`.

## Public Endpoints (No Auth)

| Function | Method | Purpose |
|----------|--------|---------|
| `health` | GET | Health check |
| `getSiteContent` | GET | CMS content (5min cache) |
| `saveEmailSignup` | POST | Newsletter signup |
| `eventbriteWebhook` | POST | Eventbrite webhooks |
| `getEditRequests` | GET | Edit suggestions |
| `invalidateCache` | POST | Clear content cache |

## Authenticated User Endpoints

| Function | Method | Purpose |
|----------|--------|---------|
| `saveEditRequest` | POST | Submit edit suggestion |
| `checkEventbriteTicket` | POST | Check ticket status |
| `syncProfileToAirtable` | POST | Sync single user |

## Admin Endpoints

| Function | Method | Purpose |
|----------|--------|---------|
| `getSystemStats` | GET | Dashboard metrics |
| `getActivityLogs` | GET | User activity logs |
| `getSystemErrors` | GET | Error tracking |
| `resolveError` | POST | Mark error resolved |
| `getBackgroundJobs` | GET | Job history |
| `getAdminLogs` | GET | Admin audit trail |
| `exportAttendees` | GET | Export users JSON |
| `syncAllProfilesToAirtable` | POST | Batch sync users |
| `syncEventbriteAttendees` | POST | Sync Eventbrite |
| `getEventbriteSyncStatus` | GET | Sync statistics |

## Super Admin Endpoints

| Function | Method | Purpose |
|----------|--------|---------|
| `grantAdminRole` | POST | Promote to admin |
| `revokeAdminRole` | POST | Remove admin role |

## Triggered Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `syncBookmarkCountToAirtable` | Firestore write | Sync bookmark counts |

## Secrets Used

```javascript
const airtableApiKey = defineSecret("AIRTABLE_API_KEY");
const eventbriteToken = defineSecret("EVENTBRITE_TOKEN");
```

## Helper Functions

```javascript
// Auth verification
verifyAuthToken(authHeader)  // Returns { uid, email } or null

// Role checks
isAdmin(uid, email)          // Check admin status
requireAdmin(req)            // Throws if not admin
requireSuperAdmin(req)       // Throws if not super_admin

// Logging
logActivity(type, userId, details)    // User actions
logAdminAction(uid, action, target, details)  // Admin audit
logError(source, error, context)      // Error tracking
```

## Base URL

```
https://us-central1-cjs2026.cloudfunctions.net/{functionName}
```
