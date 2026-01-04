# CJS2026 CMS editor guide

This guide explains how to use the custom CMS to manage content on the CJS2026 website.

## Overview

The CMS is organized by **pages** and **sections**. Each page contains multiple sections, and each section contains content blocks that you can add, edit, reorder, and delete.

```
Page (e.g., Home page)
├── Section (e.g., Hero banner)
│   ├── Content block (Headline)
│   ├── Content block (Tagline)
│   └── Content block (CTA button)
├── Section (e.g., Event details)
│   ├── Content block (Date display)
│   └── Content block (Location)
└── ...more sections
```

## Accessing the CMS

1. Log in to the admin panel at `/admin`
2. Click on the "CMS" tab in the sidebar
3. Select "Site content" from the sub-tabs

## Pages available

| Page | Description |
|------|-------------|
| **Home page** | Main landing page with hero, event details, highlights, timeline |
| **Schedule page** | Conference schedule with day headers and session listings |
| **Sponsors page** | Sponsor tiers and acknowledgments |
| **Code of conduct** | Community guidelines and policies |
| **Contact page** | Contact information and inquiry forms |
| **Auth pages** | Login and authentication screens |
| **Global** | Site-wide content like footer and navigation |

## Editing content

### Selecting a page to edit

1. From the CMS Content tab, you'll see a grid of available pages
2. Click on a page card to view its sections
3. Sections are expandable - click to show/hide content

### Editing existing content

1. Find the content block you want to edit
2. Click the pencil icon on the right
3. Modify the fields in the modal
4. Click "Save" to save changes

### Adding new content

**Option 1: From section**
1. Click the "Add content block" button at the bottom of any section
2. The modal will pre-select that section
3. Choose a block type and fill in the content
4. Click "Save"

**Option 2: From page header**
1. Click the "Add content" button in the page header
2. Select the target section from the dropdown
3. Choose a block type and fill in the content
4. Click "Save"

### Reordering content

Each content block has up/down arrow buttons on the left side:
- Click **↑** to move the block up in the order
- Click **↓** to move the block down in the order
- The number shows the current position (1, 2, 3...)

Order changes are saved immediately to the database.

**Undo:** Press **Ctrl+Z** (or **Cmd+Z** on Mac) to undo reorder actions. You can also click the "Undo" button in the header. Up to 10 recent actions can be undone.

### Deleting content

1. Click the trash icon on the content block
2. Confirm the deletion in the dialog
3. **Note:** Deletions cannot be undone

## Block types

When adding content, you'll select a block type. Here are the available types:

| Type | Icon | Description |
|------|------|-------------|
| **Headline** | 📝 | Large heading text for section titles |
| **Subheadline** | 📄 | Smaller heading text, often used below headlines |
| **Body text** | 📰 | Paragraph content for descriptions |
| **Bullet list** | 📋 | List items for features or requirements |
| **Stat card** | 📊 | Key statistics with number and label |
| **Info card** | 🎴 | Feature cards with title, description, and icon |
| **Timeline item** | ⏰ | Year/location entries for the summit history |
| **CTA button** | 🔘 | Call-to-action buttons with links |
| **Contact item** | 📧 | Contact information entries |
| **Sponsor package** | 🎁 | Sponsorship tier descriptions with benefits |
| **Day header** | 📅 | Schedule day dividers |
| **Notice banner** | ⚠️ | Important announcements or warnings |
| **Divider** | ➖ | Visual separator between content sections |

## Content fields

### Required fields
- **Content name** - Unique identifier (auto-formatted as snake_case)
- **Section** - Which section this content belongs to
- **Content** - The actual text/value to display

### Optional fields
- **Color** - Brand color (teal, cardinal, ink, green-dark)
- **Order** - Position within the section (auto-calculated)
- **Link** - URL for buttons or linked text
- **Visible** - Toggle to show/hide on the website

### Advanced options
- **Page context** - Specify which page the content appears on

## Publishing changes

Changes you make are saved to the database immediately. However, they won't appear on the live website until you publish:

1. Look for the yellow "unpublished changes" banner at the top
2. Click "Publish now" to deploy your changes
3. Wait ~60 seconds for the site to update

## Section reference

### Home page sections

| Section | Description | Allowed blocks |
|---------|-------------|----------------|
| Hero banner | Main headline and call-to-action | headline, subheadline, body_text, cta_button |
| Event details | Date, location, and key info | headline, body_text, stat_card, info_card |
| What to expect | Highlights of what attendees will experience | headline, subheadline, bullet_list, info_card |
| Stats | Key numbers and metrics | stat_card |
| Timeline | 10-year summit history | headline, timeline_item |
| Partners | Sponsor and partner recognition | headline, subheadline |

### Schedule page sections

| Section | Description | Allowed blocks |
|---------|-------------|----------------|
| Header | Page title and description | headline, subheadline, body_text |
| Day headers | Monday/Tuesday dividers | day_header, notice_banner |
| Sessions | Individual session listings | (managed via Schedule editor) |

### Sponsors page sections

| Section | Description | Allowed blocks |
|---------|-------------|----------------|
| Header | Page title | headline, subheadline |
| Sponsor tiers | Tier descriptions | sponsor_package |
| Benefits | What sponsors receive | bullet_list, body_text |

### Code of conduct sections

| Section | Description | Allowed blocks |
|---------|-------------|----------------|
| Header | Page title | headline |
| Community guidelines | Behavior expectations | headline, body_text, bullet_list |
| Reporting | How to report issues | body_text, contact_item |
| Enforcement | Consequences and process | body_text |

### Contact page sections

| Section | Description | Allowed blocks |
|---------|-------------|----------------|
| Header | Page title | headline, subheadline |
| Contact info | Email, phone, etc. | contact_item, body_text |
| Form instructions | How to reach us | body_text |

### Global sections

| Section | Description | Allowed blocks |
|---------|-------------|----------------|
| Navigation | Site navigation items | (managed separately) |
| Footer | Footer content and links | body_text, cta_button |
| Meta | SEO and metadata | (managed separately) |

## Tips for editors

1. **Use descriptive names** - Content names like `hero_main_headline` are clearer than `text1`
2. **Check the preview** - After publishing, verify changes on the live site
3. **Don't duplicate** - The system prevents duplicate content names within sections
4. **Consider mobile** - Long text may wrap differently on phones
5. **Use version history** - Check the "Version history" tab to see past changes

## Need help?

- Check the Version history tab to see recent changes
- Contact the development team for technical issues
- Refer to the style guide for brand guidelines
