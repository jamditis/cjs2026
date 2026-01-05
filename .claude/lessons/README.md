# Lessons learned

This directory contains lessons learned from CJS2026 development - patterns, debugging strategies, and solutions to specific problems encountered.

## Available lessons

| Lesson | Description | Date |
|--------|-------------|------|
| [firestore-security-rules.md](./firestore-security-rules.md) | Auth timing, permission-denied fixes, role-based access | 2026-01-04 |
| [ci-cd-debugging.md](./ci-cd-debugging.md) | GitHub Actions failures, export mismatches, generation scripts | 2026-01-04 |
| [git-merge-conflicts.md](./git-merge-conflicts.md) | Multi-file conflict resolution, combining features | 2026-01-04 |
| [content-accuracy.md](./content-accuracy.md) | Fact verification, never fabricate quotes, stats validation | 2026-01-05 |
| [historical-data-analysis.md](./historical-data-analysis.md) | Eventbrite CSV analysis, outreach list generation, segments | 2026-01-05 |

## When to reference

- **firestore-security-rules** - Permission denied errors, auth race conditions
- **ci-cd-debugging** - Build fails in CI but works locally
- **git-merge-conflicts** - Resolving conflicts when merging PRs
- **content-accuracy** - Verifying stats, updating marketing claims, quote attribution
- **historical-data-analysis** - Analyzing registration data, generating outreach lists

## Related skills

These lessons complement the skills in `.claude/skills/`:

| Skill | Related Lesson |
|-------|----------------|
| firebase-patterns | firestore-security-rules |
| cms-content-pipeline | ci-cd-debugging |
| component-patterns | (general React patterns) |
