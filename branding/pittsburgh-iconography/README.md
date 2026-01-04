# Pittsburgh iconography for CJS2026

This folder contains specifications and briefs for creating Pittsburgh-themed visual assets for the 2026 Collaborative Journalism Summit website.

## Contents

| File | Purpose |
|------|---------|
| `visual-requirements.md` | Detailed art direction and style specifications |
| `iconography-elements.md` | Pittsburgh-specific icons, symbols, and what to avoid |
| `color-palette.md` | Color specifications for Pittsburgh graphics |
| `artist-brief.md` | Ready-to-send brief for commissioning an illustrator |
| `ai-prompts.md` | Prompts for Midjourney, DALL-E, and Stable Diffusion |
| `pittsburgh-profile.json` | Complete JSON specification for programmatic use |

## Context

The current NC map (`public/nc-map.png`) is a hand-illustrated watercolor-style topographical map with a cardinal perched on it. The Pittsburgh replacement should match this aesthetic while incorporating Pittsburgh-specific iconography.

**Current usage in code:**
```jsx
// src/pages/Home.jsx (lines 289-297)
<motion.img
  src="/pa-map.png"
  alt=""
  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] md:w-[700px] lg:w-[900px] opacity-[0.08]"
/>
```

## Quick start

1. **Commissioning an artist?** → Start with `artist-brief.md`
2. **Using AI image generation?** → Start with `ai-prompts.md`
3. **Need full specifications?** → Read `visual-requirements.md`
4. **Building programmatically?** → Use `pittsburgh-profile.json`

## Output requirements

- **Filename:** `pa-map.png`
- **Location:** `public/pa-map.png`
- **Format:** PNG with transparent background
- **Minimum dimensions:** 2000px wide
- **Maximum file size:** 2MB (target under 1MB)

---

*Created January 2026 for CJS2026 venue transition from Chapel Hill, NC to Pittsburgh, PA*
