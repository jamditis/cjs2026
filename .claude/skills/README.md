# CJS2026 Agent Skills

Contextual skills for the Collaborative Journalism Summit 2026 website.

## Skill Design Philosophy

These skills follow the principles from [Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering):

1. **Progressive Disclosure** - Skills load only when needed based on activation criteria
2. **Platform Agnosticism** - Work across Claude Code, Cursor, and custom implementations
3. **Expertise Transfer** - Encode domain knowledge, not step-by-step instructions
4. **Focused** - Each skill does one thing well (under 500 lines)

## Available Skills

### cjs-architecture
**Activation**: Navigating codebase, architectural decisions, understanding component interactions

Covers the overall project structure, layer model, critical files, and state management patterns.

### cms-content-pipeline
**Activation**: Adding CMS fields, content not appearing, debugging generate scripts

Covers Airtable integration, content generation scripts, `getContent()` patterns, and field mapping.

### firebase-patterns
**Activation**: Cloud Functions, Firestore operations, auth flows, security rules

Covers Firebase services, function patterns, security rules, user profile schema, and authorization.

### component-patterns
**Activation**: Creating React components, styling, animations, dashboard widgets

Covers design system, color palette, typography, animation patterns, and component templates.

### validation-testing
**Activation**: Pre-deployment checks, verifying content, debugging failures

Covers validation strategies, common failure patterns, and testing checklists (given zero automated tests).

## Skill Structure

```
skill-name/
├── SKILL.md              # Core instructions + metadata
└── references/           # Optional supplementary docs
    └── detailed-topic.md
```

## Activation Criteria

Skills activate based on context:

| Trigger | Skill |
|---------|-------|
| "where does X live in the codebase" | cjs-architecture |
| "add CMS field", "content not showing" | cms-content-pipeline |
| "create Cloud Function", "Firestore rules" | firebase-patterns |
| "create component", "add animation" | component-patterns |
| "deploy", "validate", "why is X broken" | validation-testing |

## Integration with Slash Commands

Skills provide deep knowledge; slash commands provide quick actions.

Use `/airtable:sync-content` to run the sync.
Use the `cms-content-pipeline` skill to understand *how* syncing works.

## Adding New Skills

1. Create `skill-name/SKILL.md` with YAML frontmatter:
```yaml
---
name: skill-name
description: One-line description for discovery
---
```

2. Include sections:
   - When to Activate
   - Core concepts
   - Practical patterns
   - Integration points
   - Guidelines

3. Keep under 500 lines; delegate reference material to `references/` directory.

4. Use third-person perspective for system prompt integration.
