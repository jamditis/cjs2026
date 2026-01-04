# Visual requirements for Pittsburgh map illustration

## Reference: Current NC map

The existing North Carolina map establishes the visual language we need to match:

| Attribute | Current NC implementation |
|-----------|---------------------------|
| **Style** | Hand-drawn illustration, watercolor/colored pencil texture |
| **Geography** | State outline filled with topographical features (mountains, rivers, coastal areas) |
| **Focal symbol** | State bird (cardinal) perched prominently |
| **Color palette** | Muted earth tones: blue-grey mountains, sage greens, cream/parchment base, river blues |
| **Texture** | Visible pencil strokes, paper grain, organic linework |
| **Opacity in use** | 8% opacity as background watermark |
| **Purpose** | Decorative location identifier, adds "sense of place" without overwhelming content |

---

## Art direction

### Style specifications

| Attribute | Specification |
|-----------|---------------|
| **Art style** | Hand-illustrated, watercolor/ink wash, visible brushstrokes |
| **Line quality** | Organic, slightly irregular, "sketched" feel — NOT vector-clean |
| **Color palette** | Muted, desaturated tones matching brand colors |
| **Base tones** | Cream/parchment (#F5F0E6), warm grey undertones |
| **Accent colors** | Teal (#2A9D8F) for rivers, muted greens for forests, blue-grey for mountains |
| **Texture** | Paper grain, watercolor bleeds, pencil hatching |

### Design influences

Draw inspiration from:
- Vintage cartography and antique maps
- Naturalist field guides (Audubon style)
- WPA National Parks poster art
- Appalachian folk art traditions
- Rifle Paper Co. illustration style

### What to avoid

- Vector graphics with clean, perfect edges
- Photorealism or digital renders
- Corporate logos or sports team references
- AI-generated "slickness" — the final piece should feel human-made
- Pure black (#000) or pure white (#FFF) — use muted versions
- Neon or highly saturated colors

---

## Technical specifications

| Spec | Requirement |
|------|-------------|
| **Format** | PNG |
| **Background** | Transparent |
| **Minimum width** | 2000px (ideal: 3000px) |
| **Height** | Proportional to state shape |
| **Max file size** | 2MB (target under 1MB for web performance) |
| **Color space** | sRGB |
| **DPI** | 72 (web use) |

### Deliverables

1. **Primary file:** `pa-map.png` — Full illustration with transparent background
2. **Optional:** `pa-map-transp.png` — Alternative transparency version if needed
3. **Optional:** Source file (PSD, AI, or Procreate) for future edits

---

## Composition requirements

### Pennsylvania state outline

The primary shape is Pennsylvania's distinctive form:
- Rectangular body with notched northwest corner (Lake Erie access)
- Irregular eastern border (Delaware River)
- Overall horizontal orientation

### Focal point: Pittsburgh (Three Rivers)

The southwest region where Pittsburgh sits should be the visual anchor:
- Confluence of Allegheny + Monongahela rivers forming the Ohio River
- "The Point" triangle where downtown Pittsburgh sits
- This area should have slightly more detail/emphasis than other regions

### Geographic features to include

1. **Rivers** (high priority)
   - Three Rivers confluence at Pittsburgh
   - Susquehanna River system in central/eastern PA
   - Delaware River on eastern border
   - Treatment: Blue watercolor ribbons with hand-drawn curves

2. **Mountains** (high priority)
   - Allegheny Mountains in central-western region
   - Appalachian ridges running northeast-southwest
   - Treatment: Blue-grey ridgelines with pencil hatching, layered depth

3. **Forests/hills** (medium priority)
   - Rolling hills throughout western PA
   - Forested areas across the state
   - Treatment: Sage green watercolor washes with simple tree symbols

4. **Lake Erie** (low priority)
   - Northwest corner shoreline
   - Treatment: Subtle blue edge/water indication

5. **Pittsburgh bridges** (medium priority)
   - 2-4 simplified arch silhouettes crossing rivers at Pittsburgh
   - Treatment: Steel grey, integrated naturally into river crossings

### Iconic symbol options

Choose ONE for the main illustrated element (like the cardinal on NC map):

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **Ruffed Grouse** | Pennsylvania state bird | Matches NC map approach, authentic PA symbol | Less recognizable than cardinal |
| **Cardinal (retained)** | Keep the CJS mascot bird | Brand continuity, already associated with CJS | Not PA-specific |
| **Bridge silhouette** | Pittsburgh's defining icon | Instantly recognizable as Pittsburgh | Less "naturalist" feel |
| **Duquesne Incline** | Historic cable car | Unique to Pittsburgh | Very small detail |

**Recommendation:** Ruffed Grouse for authenticity, OR retain the cardinal for brand continuity.

---

## Alternative approaches

If a full illustrated map isn't feasible, consider these alternatives:

### Option A: Bridge-focused silhouette
- Simplified PA outline with prominent Pittsburgh bridge arches at The Point
- Pros: Very Pittsburgh-specific, clean, scalable
- Cons: Less illustrative warmth than current NC map

### Option B: Rivers-only abstraction
- PA outline with only the Three Rivers confluence rendered, rest minimal
- Pros: Modern, clean, emphasizes Pittsburgh's defining feature
- Cons: May feel too sparse compared to detailed NC map

### Option C: Keystone frame with Pittsburgh inset
- Keystone shape (PA is "Keystone State") framing a detailed Pittsburgh illustration
- Pros: Uses iconic PA shape, allows detailed city focus
- Cons: Different composition than NC map, may not work as background

### Option D: Temporary placeholder
- Simple PA state outline silhouette in teal at 8% opacity
- Pros: Quick to implement, clean
- Cons: Loses the distinctive illustrated character
