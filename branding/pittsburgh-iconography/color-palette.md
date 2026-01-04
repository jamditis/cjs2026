# Color palette for Pittsburgh graphics

## Brand colors (primary)

These are the CJS2026 brand colors that should anchor all Pittsburgh graphics:

| Name | Hex | RGB | Use |
|------|-----|-----|-----|
| **Teal** | `#2A9D8F` | rgb(42, 157, 143) | Rivers, water features, primary accent |
| **Cream** | `#F5F0E6` | rgb(245, 240, 230) | Parchment base, paper texture |
| **Ink** | `#2C3E50` | rgb(44, 62, 80) | Outlines, borders, dark details |
| **Cardinal** | `#CA3553` | rgb(202, 53, 83) | Bird, highlight accents |

---

## Pittsburgh-specific additions

These colors complement the brand palette for Pittsburgh-specific elements:

| Name | Hex | RGB | Use |
|------|-----|-----|-----|
| **Steel grey** | `#6B7B8C` | rgb(107, 123, 140) | Bridges, industrial silhouettes |
| **River blue** | `#4A7C91` | rgb(74, 124, 145) | River depth, water shadows |
| **Forest sage** | `#8B9A8B` | rgb(139, 154, 139) | Forested hillsides, vegetation |
| **Rust accent** | `#B87333` | rgb(184, 115, 51) | Subtle industrial heritage hints |
| **Point gold** | `#C9A227` | rgb(201, 162, 39) | Very sparingly for The Point marker |

---

## Color swatches

### Brand colors

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│             │  │             │  │             │  │             │
│   TEAL      │  │   CREAM     │  │   INK       │  │  CARDINAL   │
│  #2A9D8F    │  │  #F5F0E6    │  │  #2C3E50    │  │  #CA3553    │
│             │  │             │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
    Rivers         Background       Outlines        Accents
```

### Pittsburgh additions

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│             │  │             │  │             │  │             │  │             │
│ STEEL GREY  │  │ RIVER BLUE  │  │ FOREST SAGE │  │ RUST ACCENT │  │ POINT GOLD  │
│  #6B7B8C    │  │  #4A7C91    │  │  #8B9A8B    │  │  #B87333    │  │  #C9A227    │
│             │  │             │  │             │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
    Bridges         Water           Forests         Industrial       The Point
                    depth                           hints            (sparingly)
```

---

## Color usage by element

| Element | Primary color | Secondary color | Notes |
|---------|---------------|-----------------|-------|
| State outline | Ink (#2C3E50) | — | Thin border line |
| Rivers | Teal (#2A9D8F) | River blue (#4A7C91) | Gradient for depth |
| The Point | Point gold (#C9A227) | Teal (#2A9D8F) | Subtle highlight |
| Bridges | Steel grey (#6B7B8C) | — | Simple silhouettes |
| Mountains | Steel grey (#6B7B8C) | Ink (#2C3E50) | Layered ridges |
| Forests | Forest sage (#8B9A8B) | — | Watercolor wash |
| Lake Erie | Teal (#2A9D8F) | — | Light wash |
| Bird (grouse) | Rust accent (#B87333) | Ink (#2C3E50) | Natural coloring |
| Bird (cardinal) | Cardinal (#CA3553) | Ink (#2C3E50) | If retaining brand bird |
| Paper/background | Cream (#F5F0E6) | — | Transparent for PNG |

---

## Color constraints

### Maximum colors
Use no more than **8 colors** in the final illustration to maintain cohesion.

### Saturation
All colors should be **muted and desaturated**. The illustrated map should feel aged, like vintage cartography — not bright and digital.

### Blacks and whites
- **Avoid pure black** (#000000) — use Ink (#2C3E50) instead
- **Avoid pure white** (#FFFFFF) — use Cream (#F5F0E6) instead

### Colors to avoid

| Color | Hex | Reason |
|-------|-----|--------|
| Steelers gold | `#FFB612` | Too associated with football team |
| Steelers black | `#000000` | Combined with gold = sports reference |
| Bright primary colors | Various | Clash with muted palette |
| Neon colors | Various | Too digital, not vintage |
| Cool greys | Various | Prefer warm-toned greys |

---

## CSS variables (for reference)

These are the CSS custom properties used in the CJS2026 website:

```css
:root {
  /* Brand colors */
  --color-teal: #2A9D8F;
  --color-cream: #F5F0E6;
  --color-ink: #2C3E50;
  --color-cardinal: #CA3553;
  --color-green-dark: #1A7A6E;

  /* Extended palette */
  --color-parchment: #EDE8DC;
  --color-paper: #FAF8F5;
}
```

---

## Accessibility notes

When using these colors for text or important UI elements (not just decorative illustrations):

| Combination | Contrast ratio | WCAG level |
|-------------|----------------|------------|
| Ink on Cream | 8.5:1 | AAA |
| Teal on Cream | 3.2:1 | AA Large |
| Cardinal on Cream | 4.8:1 | AA |
| Steel grey on Cream | 4.1:1 | AA |

For the map illustration (decorative, 8% opacity), accessibility contrast is not a concern since it's a background element with no text.
