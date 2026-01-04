# AI image generation prompts

Prompts for generating the Pittsburgh map illustration using AI tools.

---

## Midjourney prompts

### Primary prompt (recommended)

```
Hand-illustrated watercolor map of Pennsylvania state, vintage cartography style, featuring the Three Rivers confluence at Pittsburgh with 3 simplified bridge arches, Allegheny Mountains in blue-grey watercolor, forested hills in sage green, rivers in teal blue, a ruffed grouse bird perched near Pittsburgh, muted earthy color palette, visible brushstrokes and paper texture, naturalist field guide aesthetic, transparent background --ar 4:3 --style raw --v 6
```

### Simplified version

```
Watercolor illustrated map of Pennsylvania, Pittsburgh Three Rivers confluence with bridge silhouettes, Allegheny Mountains, vintage cartography style, hand-drawn aesthetic, muted teal and sage colors, paper texture, transparent background --ar 4:3 --v 6
```

### With cardinal (brand continuity)

```
Hand-illustrated watercolor map of Pennsylvania state, vintage cartography style, Three Rivers confluence at Pittsburgh with bridge arches, Allegheny Mountains in blue-grey, a red cardinal bird perched on eastern border, rivers in teal watercolor, forested areas in sage green, visible brushstrokes, antique map aesthetic --ar 4:3 --style raw --v 6
```

### Style variations

**More vintage:**
```
Antique illustrated map of Pennsylvania, 1800s naturalist style, Three Rivers at Pittsburgh with iron bridges, Appalachian mountain ridges, aged parchment texture, hand-colored engraving aesthetic, muted earth tones --ar 4:3 --v 6
```

**More modern:**
```
Contemporary watercolor illustration of Pennsylvania state map, minimalist topographical style, Pittsburgh rivers confluence emphasized, soft teal and sage palette, clean linework with watercolor fills, white background --ar 4:3 --v 6
```

---

## DALL-E 3 prompts

### Primary prompt

```
Create a hand-illustrated watercolor map of the state of Pennsylvania in the style of vintage cartography and naturalist field guides. The map should feature:

1. The Pennsylvania state outline with organic, hand-drawn edges
2. The Three Rivers confluence at Pittsburgh (southwest) where the Allegheny and Monongahela rivers meet to form the Ohio River
3. 2-3 simplified bridge arch silhouettes crossing the rivers at Pittsburgh
4. The Allegheny Mountains running through central Pennsylvania in blue-grey watercolor
5. Forested hills in sage green throughout western PA
6. Rivers rendered as teal-blue watercolor ribbons
7. A ruffed grouse (Pennsylvania state bird) perched near Pittsburgh

Style: Hand-painted watercolor with visible brushstrokes, pencil texture, and paper grain. Colors should be muted and earthy - teal (#2A9D8F), sage green (#8B9A8B), blue-grey (#6B7B8C), cream base. The overall aesthetic should feel like a WPA poster or Audubon illustration.

The background should be transparent or very light cream. No text, labels, or corporate logos.
```

### Shorter version

```
Hand-illustrated watercolor map of Pennsylvania state. Vintage cartography style with visible brushstrokes. Feature the Three Rivers confluence at Pittsburgh with bridge silhouettes, Allegheny Mountains in blue-grey, forested hills in sage green, rivers in teal. Include a ruffed grouse bird. Muted earthy palette, paper texture, transparent background.
```

---

## Stable Diffusion prompts

### Primary prompt (SDXL)

```
(masterpiece, best quality) hand-illustrated watercolor map of Pennsylvania state, vintage cartography, naturalist illustration style, Three Rivers confluence at Pittsburgh with bridge arches, Allegheny Mountains blue-grey ridges, teal rivers, sage green forests, ruffed grouse bird, muted earth tones, visible brushstrokes, paper texture, parchment aesthetic, (transparent background:1.2)

Negative prompt: text, labels, logos, sports, modern buildings, photorealistic, 3d render, digital art, vector graphics, clean lines, neon colors, saturated colors, black and gold
```

### With ControlNet (if using reference image)

```
Hand-painted watercolor illustration matching reference style, Pennsylvania state map, Three Rivers Pittsburgh, vintage cartography, naturalist field guide aesthetic, bridge silhouettes, mountain ridges, forest areas, teal and sage palette, paper texture

Negative prompt: sports logos, corporate branding, photorealistic, vector, clean digital lines
```

---

## Ideogram prompts

```
A hand-illustrated watercolor map of Pennsylvania state in vintage cartography style. The map shows the Three Rivers confluence at Pittsburgh with simplified bridge arches, the Allegheny Mountains in blue-grey watercolor, forested hills in sage green, and rivers in teal blue. A ruffed grouse bird is perched near Pittsburgh. The style resembles WPA poster art and naturalist field guides with visible brushstrokes and paper texture. Muted earthy color palette. Transparent background.
```

---

## Post-processing notes

After generating with AI:

1. **Remove background** — Use remove.bg or Photoshop to ensure true transparency
2. **Color correction** — Adjust to match exact hex codes in color-palette.md
3. **Add texture** — Overlay paper grain texture if AI output is too smooth
4. **Clean edges** — Touch up any artifacts around state outline
5. **Resize** — Export at minimum 2000px wide, ideally 3000px
6. **Optimize** — Compress PNG to under 2MB while maintaining quality

---

## Prompt modifiers to experiment with

**For more hand-drawn feel:**
- "pencil and watercolor"
- "colored pencil illustration"
- "ink wash and watercolor"
- "hand-colored engraving"

**For vintage aesthetic:**
- "antique map style"
- "19th century naturalist illustration"
- "WPA poster art"
- "Audubon style"

**For paper texture:**
- "on aged parchment"
- "paper texture overlay"
- "visible paper grain"
- "cotton rag paper"

**Colors:**
- "muted earth tones"
- "desaturated palette"
- "teal and sage color scheme"
- "warm grey undertones"

---

## What to avoid in prompts

Don't include:
- "Steelers" or "Pittsburgh sports"
- "Steel mill" or "industrial"
- "Black and gold"
- "Modern skyline"
- "Photorealistic"
- "3D render"
- "Digital art"
- "Vector illustration"
- "Clean lines"
- "Neon" or "vibrant colors"

---

## Expected results

AI generation will likely require 5-10 iterations to get close to the desired result. Plan to:

1. Generate multiple variations
2. Select best base image
3. Have a designer refine and polish
4. Add any missing elements manually
5. Color correct to exact brand palette

AI-generated images work best as a **starting point**, not final deliverable.
