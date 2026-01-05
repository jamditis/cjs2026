# Git merge conflict resolution

Lessons from resolving multi-file merge conflicts in CJS2026.

## The merge workflow

```bash
# 1. Fetch latest and attempt merge
git fetch origin master
git merge origin/master --no-commit

# 2. If conflicts, check what files are affected
git diff --name-only --diff-filter=U

# 3. Resolve each file
# 4. Stage resolved files
git add <file>

# 5. Verify build works
npm run build

# 6. Commit the merge
git commit -m "Merge origin/master into feature-branch"

# 7. Push
git push
```

## Resolution strategies by file type

### Documentation files (CLAUDE.md, README.md)

**Strategy**: Usually take the more recent/comprehensive version.

```bash
# Take master's version (theirs)
git checkout --theirs CLAUDE.md
git add CLAUDE.md

# Or take your branch's version (ours)
git checkout --ours CLAUDE.md
git add CLAUDE.md
```

### Source files (*.jsx, *.js)

**Strategy**: Combine features from both branches. Don't lose functionality.

**Example - Navbar.jsx conflict:**
```jsx
// HEAD (our branch) - has FAQ
{ name: 'FAQ', path: '/faq' },

// origin/master - has Updates
{ name: 'Updates', path: '/updates' },

// Resolution - include BOTH:
{ name: 'Updates', path: '/updates' },
{ name: 'FAQ', path: '/faq' },
```

### Configuration files (firestore.rules, package.json)

**Strategy**: Combine all unique entries from both branches.

**Example - firestore.rules:**
```javascript
// HEAD had CMS collections
match /cmsContent/{docId} { ... }

// Master had updates collection
match /updates/{updateId} { ... }

// Resolution - include BOTH collections
```

**Example - package.json scripts:**
```json
// Combine all scripts from both branches
"generate-updates": "node scripts/generate-updates.cjs",
"generate-from-firestore": "node scripts/generate-from-firestore.cjs",
```

### Lock files (package-lock.json)

**Strategy**: Regenerate from package.json.

```bash
git checkout --theirs package-lock.json
npm install
git add package-lock.json
```

## Reading conflict markers

```
<<<<<<< HEAD
// Your branch's version
code from your branch
=======
// Master's version
code from master
>>>>>>> origin/master
```

## Common pitfalls

### 1. Forgetting to combine features

**Wrong**: Choosing one side and losing the other's features.

**Right**: Read both sides and include all functionality.

### 2. Not testing after resolution

**Always** run `npm run build` before committing the merge.

### 3. Resolving JSON with invalid syntax

JSON conflicts are tricky - watch for:
- Missing/extra commas
- Unclosed brackets
- Duplicate keys

### 4. Import statement conflicts

When main.jsx or App.jsx has conflicts, ensure ALL imports are included:

```jsx
// Combine all page imports from both branches
import { Home, Schedule, FAQ, Updates, ... } from './pages'
```

## Multi-branch PR workflow

When you have multiple PRs with conflicts:

```bash
# 1. Merge first PR to master
gh pr merge 46 --merge --delete-branch

# 2. Update second PR's branch with new master
git checkout feature-branch-2
git fetch origin master
git merge origin/master  # Resolve conflicts
git push

# 3. Now merge second PR
gh pr merge 47 --merge --delete-branch
```

## Quick reference

| Situation | Command |
|-----------|---------|
| See conflicted files | `git diff --name-only --diff-filter=U` |
| Take their version | `git checkout --theirs <file>` |
| Take our version | `git checkout --ours <file>` |
| Abort merge | `git merge --abort` |
| After manual edit | `git add <file>` |
| Verify resolution | `npm run build` |
