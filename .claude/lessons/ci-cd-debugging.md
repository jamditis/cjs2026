# CI/CD debugging for CJS2026

Lessons learned from GitHub Actions deployment failures.

## The deployment pipeline

```
Push to master
    ↓
GitHub Actions triggers
    ↓
npm ci (install dependencies)
    ↓
generate-from-firestore.cjs (pull CMS content)  ← REGENERATES content files
    ↓
npm run build (Vite production build)
    ↓
Firebase deploy
```

**Key insight**: The `generate-from-firestore.cjs` script OVERWRITES the `src/content/*.js` files that are committed to git. What works locally may fail in CI if the generation script produces different output.

## Common CI failures

### 1. Export name mismatch

**Symptom:**
```
"sessions" is not exported by "src/content/scheduleData.js",
imported by "src/components/SessionCard.jsx"
```

**Cause**: Component imports a named export that the generation script doesn't produce.

**Debug process:**
1. Check the component's import statement
2. Check the generation script's output template
3. Ensure they match

**Fix pattern:**
```javascript
// In generate-from-firestore.cjs, export both names:
export const sessions = ${JSON.stringify(sessions)};
export const scheduleData = sessions;  // Alias for compatibility
```

### 2. Missing fields in generated data

**Symptom**: Feature works locally but breaks in production (e.g., images not loading).

**Cause**: Local `content/*.js` files have fields that the generation script doesn't include.

**Example - Logo path bug:**
```javascript
// Local organizationsData.js (committed) had:
localLogoPath: "/sponsor-logos/knight-foundation.png"

// But generate-from-firestore.cjs didn't include localLogoPath
// So production build had undefined, falling back to Firebase Storage URL
```

**Fix**: Add the missing field to the generation script:
```javascript
const localLogoPath = data.logoUrl && slug
  ? `/sponsor-logos/${slug}.png`
  : null;

return {
  // ...other fields
  localLogoPath: localLogoPath,
};
```

### 3. Build succeeds locally, fails in CI

**Debug checklist:**
1. Run `npm run generate-from-firestore` locally
2. Check `git diff src/content/` to see what changed
3. Run `npm run build` with the regenerated files
4. If build fails, you've reproduced the CI issue

## Checking CI logs

```bash
# List recent workflow runs
gh run list --limit 5

# View failed run logs
gh run view <run-id> --log-failed

# Watch a running workflow
gh run watch
```

## Key file relationships

| Generated File | Generation Script | Key Consumers |
|---------------|-------------------|---------------|
| `siteContent.js` | `generate-from-firestore.cjs` | Home.jsx, various |
| `scheduleData.js` | `generate-from-firestore.cjs` | Schedule.jsx, SessionCard.jsx |
| `organizationsData.js` | `generate-from-firestore.cjs` | Sponsors.jsx, Home.jsx |

## Prevention strategies

1. **After modifying generation scripts**, run locally and test build
2. **Check imports** in components that use generated content
3. **Add aliases** for backward compatibility when renaming exports
4. **Include all fields** that components expect (check the component code)
5. **Test the full CI flow** by pushing to a feature branch first

## Quick fix workflow

```bash
# 1. Check what CI generates vs what's committed
npm run generate-from-firestore
git diff src/content/

# 2. Test the build with generated content
npm run build

# 3. If build fails, fix the generation script
# 4. Commit the script fix (NOT the generated files)
git add scripts/generate-from-firestore.cjs
git commit -m "Fix generation script for [issue]"
git push
```
