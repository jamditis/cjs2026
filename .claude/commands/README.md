# CJS2026 Claude Commands

Custom slash commands for the Collaborative Journalism Summit 2026 website.

## Usage

Type `/command-name` in Claude Code to run any command.

## Available Commands

### Airtable CMS (`/airtable:*`)

| Command | Description |
|---------|-------------|
| `/airtable:sync-content` | Pull fresh site content from Airtable |
| `/airtable:sync-schedule` | Pull session data from Airtable |
| `/airtable:sync-sponsors` | Pull sponsor data (requires Firebase) |
| `/airtable:add-content-field` | Add new CMS-controlled field |

### Firebase (`/firebase:*`)

| Command | Description |
|---------|-------------|
| `/firebase:add-cloud-function` | Create new Cloud Function |
| `/firebase:audit-security-rules` | Check security rules for issues |
| `/firebase:deploy` | Deploy with pre-flight checks |

### Components (`/components:*`)

| Command | Description |
|---------|-------------|
| `/components:add-dashboard-widget` | Add widget to user dashboard |
| `/components:add-admin-tab` | Add tab to admin panel |
| `/components:add-page` | Create new page with routing |
| `/components:session-card` | SessionCard component reference |
| `/components:auth-context` | AuthContext hook reference |

### Deploy (`/deploy:*`)

| Command | Description |
|---------|-------------|
| `/deploy:pre-check` | Run pre-deployment validation |
| `/deploy:generate-all` | Regenerate all Airtable content |

### Reference

| Command | Description |
|---------|-------------|
| `/style-guide` | Design system quick reference |
| `/debug-auth` | Troubleshoot auth issues |

## Command Structure

Commands follow these principles:

1. **Expertise Transfer** - Encode domain knowledge, not step-by-step instructions
2. **Flow, Not Friction** - Produce working code directly
3. **Voice Matches Domain** - Sound like a CJS2026 developer
4. **Focused** - Each command does one thing well

## Adding New Commands

Create a `.md` file in the appropriate subdirectory:

```markdown
---
allowed-tools: Read, Edit, Grep
argument-hint: <arg1> <arg2>
description: One-line description for /help
---

# Command Title

Instructions for Claude...
```

## Key Project Files

- `CLAUDE.md` - Main project instructions
- `CJS_WEB_STYLE_GUIDE.md` - Design system documentation
- `src/contexts/AuthContext.jsx` - Auth state management
- `functions/index.js` - Cloud Functions
- `scripts/generate-*.cjs` - Airtable content generators
