---
allowed-tools: Bash(npm run build:*), Bash(npx firebase deploy:*), Bash(firebase deploy:*), Read
description: Deploy to Firebase Hosting and/or Cloud Functions with pre-flight checks
---

# Firebase Deploy

Deploy the site after running pre-flight checks.

## Pre-Flight Checks

Before deploying, verify:

1. **Content files exist and are populated**
   - `src/content/siteContent.js` has timeline array with 10 items
   - `src/content/scheduleData.js` exists (can be empty)
   - `src/content/organizationsData.js` exists

2. **Build succeeds**
   - Run `npm run build`
   - Check `dist/` folder created
   - No build errors

3. **Environment check**
   - Firebase project is `cjs2026`
   - Custom domain: `summit.collaborativejournalism.org`

## Deploy Commands

```bash
# Full deploy (hosting + functions)
npm run deploy

# Hosting only (faster)
npm run build && npx firebase deploy --only hosting

# Functions only
npx firebase deploy --only functions

# Security rules only
npx firebase deploy --only firestore:rules
npx firebase deploy --only storage:rules
```

## Post-Deploy Verification

After deploy:
1. Check https://cjs2026.web.app loads
2. Check https://summit.collaborativejournalism.org loads
3. Verify OG image appears in social previews
4. Test one Cloud Function (e.g., health endpoint)

## Rollback

Firebase Hosting supports one-click rollback in Firebase Console:
Hosting > Release History > Select previous release > Rollback
