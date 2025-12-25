---
allowed-tools: Bash(npm run build:*), Read, Grep, Glob
description: Run pre-deployment validation checks before deploying to Firebase
---

# Pre-Deploy Checks

Validate the codebase before deployment.

## Checks to Run

### 1. Content Files Exist
```
src/content/siteContent.js - Must exist, have timeline with 10 items
src/content/scheduleData.js - Must exist (can have empty sessions)
src/content/organizationsData.js - Must exist
```

### 2. Build Succeeds
Run `npm run build` and verify:
- No errors
- `dist/` folder created
- `dist/index.html` exists

### 3. Required Environment
Check `.env` or environment has:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`

### 4. Content Validation

Read `src/content/siteContent.js` and verify:
```javascript
// Timeline must have 10 years
timeline.length === 10

// Stats must have 4 items
stats.length === 4

// Required sections exist
sections.details
sections.footer
sections.expect
sections.history
```

### 5. No Console Errors in Build

The build output should not contain:
- `error` (case insensitive)
- `warning` about missing dependencies
- TypeScript/type errors

## Report Format

```
Pre-Deploy Check Results
========================
[PASS] Content files exist
[PASS] Build succeeds
[FAIL] Missing VITE_FIREBASE_API_KEY
[PASS] Timeline has 10 items
[WARN] scheduleData.js has 0 sessions

Ready to deploy: NO (1 failure)
```

Only report PASS if all checks pass.
