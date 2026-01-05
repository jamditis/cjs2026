/**
 * CMS Architecture Configuration
 *
 * This file defines the content block system for the CJS2026 website.
 * It specifies what types of content can exist in each section of each page,
 * enabling editors to add, edit, reorder, and remove content blocks.
 *
 * STRUCTURE:
 * - BLOCK_TYPES: Reusable content block templates with their properties
 * - PAGE_CONFIGS: Page-specific configurations with sections and allowed blocks
 * - Helper functions for the CMS UI
 */

// ============================================================================
// CONTENT BLOCK TYPES
// ============================================================================
// These define what kinds of content can be created. Each block type has:
// - label: Human-readable name shown in the UI
// - icon: Emoji for visual identification
// - fields: What properties the block has
// - preview: How to show a preview in the admin list

export const BLOCK_TYPES = {
  // Text blocks
  headline: {
    id: 'headline',
    label: 'Headline',
    icon: '📝',
    description: 'Large heading text for section titles',
    fields: [
      { name: 'content', label: 'Headline text', type: 'text', required: true },
      { name: 'color', label: 'Color', type: 'color', default: 'teal' }
    ],
    preview: (block) => block.content?.substring(0, 50) || 'Untitled headline'
  },

  subheadline: {
    id: 'subheadline',
    label: 'Subheadline',
    icon: '📄',
    description: 'Secondary heading or tagline',
    fields: [
      { name: 'content', label: 'Subheadline text', type: 'text', required: true },
      { name: 'color', label: 'Color', type: 'color', default: 'ink' }
    ],
    preview: (block) => block.content?.substring(0, 50) || 'Untitled subheadline'
  },

  body_text: {
    id: 'body_text',
    label: 'Body text',
    icon: '📃',
    description: 'Paragraph of text content',
    fields: [
      { name: 'content', label: 'Text content', type: 'textarea', required: true },
      { name: 'color', label: 'Color', type: 'color', default: 'ink' }
    ],
    preview: (block) => block.content?.substring(0, 80) + '...' || 'Empty text block'
  },

  bullet_list: {
    id: 'bullet_list',
    label: 'Bullet list',
    icon: '📋',
    description: 'List of items (one per line)',
    fields: [
      { name: 'content', label: 'List items (one per line)', type: 'textarea', required: true },
      { name: 'color', label: 'Color', type: 'color', default: 'ink' }
    ],
    preview: (block) => {
      const items = block.content?.split('\n').filter(Boolean) || []
      return `${items.length} items: ${items[0]?.substring(0, 30)}...`
    }
  },

  // Data display blocks
  stat_card: {
    id: 'stat_card',
    label: 'Stat card',
    icon: '📊',
    description: 'Large number with label (e.g., "10 Summits")',
    fields: [
      { name: 'content', label: 'Value (e.g., "10", "1500+")', type: 'text', required: true },
      { name: 'label', label: 'Label (e.g., "Summits")', type: 'text', required: true },
      { name: 'color', label: 'Color', type: 'color', default: 'teal' }
    ],
    preview: (block) => `${block.content} ${block.label || ''}`
  },

  info_card: {
    id: 'info_card',
    label: 'Info card',
    icon: '🃏',
    description: 'Card with title and description',
    fields: [
      { name: 'title', label: 'Card title', type: 'text', required: true },
      { name: 'content', label: 'Card description', type: 'textarea', required: true },
      { name: 'color', label: 'Color', type: 'color', default: 'teal' },
      { name: 'link', label: 'Link URL (optional)', type: 'url' }
    ],
    preview: (block) => block.title || 'Untitled card'
  },

  timeline_item: {
    id: 'timeline_item',
    label: 'Timeline item',
    icon: '📅',
    description: 'Year entry in the history timeline',
    fields: [
      { name: 'year', label: 'Year', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text', required: true },
      { name: 'theme', label: 'Theme/description', type: 'text' },
      { name: 'link', label: 'Link to summit site', type: 'url' },
      { name: 'color', label: 'Color', type: 'color', default: 'teal' }
    ],
    preview: (block) => `${block.year}: ${block.location}`
  },

  // Interactive blocks
  cta_button: {
    id: 'cta_button',
    label: 'Call-to-action button',
    icon: '🔘',
    description: 'Button with link',
    fields: [
      { name: 'content', label: 'Button text', type: 'text', required: true },
      { name: 'link', label: 'Button URL', type: 'url', required: true },
      { name: 'color', label: 'Color', type: 'color', default: 'teal' }
    ],
    preview: (block) => `[${block.content}] → ${block.link?.substring(0, 30)}`
  },

  contact_item: {
    id: 'contact_item',
    label: 'Contact item',
    icon: '📧',
    description: 'Contact method (email, phone, social)',
    fields: [
      { name: 'label', label: 'Label (e.g., "Email")', type: 'text', required: true },
      { name: 'content', label: 'Value (e.g., "summit@...")', type: 'text', required: true },
      { name: 'link', label: 'Link URL', type: 'url' },
      { name: 'color', label: 'Color', type: 'color', default: 'teal' }
    ],
    preview: (block) => `${block.label}: ${block.content}`
  },

  // Sponsorship blocks
  sponsor_package: {
    id: 'sponsor_package',
    label: 'Sponsor package',
    icon: '💎',
    description: 'Sponsorship tier with price and benefits',
    fields: [
      { name: 'title', label: 'Package name', type: 'text', required: true },
      { name: 'price', label: 'Price', type: 'text', required: true },
      { name: 'content', label: 'Benefits (one per line)', type: 'textarea', required: true },
      { name: 'availability', label: 'Availability note', type: 'text' },
      { name: 'color', label: 'Color', type: 'color', default: 'teal' }
    ],
    preview: (block) => `${block.title} - ${block.price}`
  },

  // Schedule blocks
  day_header: {
    id: 'day_header',
    label: 'Day header',
    icon: '📆',
    description: 'Day label for schedule (e.g., "Monday, June 8")',
    fields: [
      { name: 'content', label: 'Day title', type: 'text', required: true },
      { name: 'subtitle', label: 'Subtitle (e.g., "Main summit day")', type: 'text' },
      { name: 'color', label: 'Color', type: 'color', default: 'teal' }
    ],
    preview: (block) => block.content
  },

  notice_banner: {
    id: 'notice_banner',
    label: 'Notice banner',
    icon: '⚠️',
    description: 'Highlighted announcement or notice',
    fields: [
      { name: 'title', label: 'Banner title', type: 'text', required: true },
      { name: 'content', label: 'Banner message', type: 'textarea', required: true },
      { name: 'color', label: 'Color', type: 'color', default: 'amber' }
    ],
    preview: (block) => block.title
  },

  // Generic
  divider: {
    id: 'divider',
    label: 'Divider',
    icon: '➖',
    description: 'Visual separator between content',
    fields: [
      { name: 'style', label: 'Style', type: 'select', options: ['line', 'dots', 'space'], default: 'line' }
    ],
    preview: () => '— Divider —'
  }
}

// ============================================================================
// PAGE CONFIGURATIONS
// ============================================================================
// Each page defines its sections and what block types are allowed in each.
// This controls what editors can add to each part of the site.

export const PAGE_CONFIGS = {
  // -------------------------------------------------------------------------
  // HOME PAGE
  // -------------------------------------------------------------------------
  home: {
    id: 'home',
    label: 'Home page',
    icon: '🏠',
    description: 'Main landing page with hero, event details, and highlights',
    sections: [
      {
        id: 'hero',
        label: 'Hero banner',
        description: 'Main headline, tagline, and call-to-action at the top of the page',
        allowedBlocks: ['headline', 'subheadline', 'body_text', 'cta_button'],
        maxBlocks: 10,
        reorderable: true,
        defaultBlocks: [
          { field: 'year', blockType: 'subheadline', description: 'Anniversary badge (e.g., "10th anniversary!")' },
          { field: 'headline', blockType: 'headline', description: 'Main summit headline' },
          { field: 'tagline', blockType: 'subheadline', description: 'Tagline (e.g., "Prepare to partner.")' },
          { field: 'date_display', blockType: 'body_text', description: 'Event dates' },
          { field: 'location', blockType: 'body_text', description: 'Event location' },
          { field: 'registration_note', blockType: 'body_text', description: 'Registration status message' }
        ]
      },
      {
        id: 'details',
        label: 'Event details',
        description: 'Date, location, and registration information cards',
        allowedBlocks: ['headline', 'body_text', 'info_card'],
        maxBlocks: 15,
        reorderable: true,
        defaultBlocks: [
          { field: 'section_headline', blockType: 'headline', description: 'Section title' },
          { field: 'section_description', blockType: 'body_text', description: 'Intro paragraph' },
          { field: 'when_day1_title', blockType: 'info_card', description: 'Day 1 info' },
          { field: 'when_day2_title', blockType: 'info_card', description: 'Day 2 info' },
          { field: 'venue_name', blockType: 'info_card', description: 'Venue info' },
          { field: 'who_count', blockType: 'info_card', description: 'Attendee info' }
        ]
      },
      {
        id: 'expect',
        label: 'What to expect',
        description: 'Feature cards highlighting summit benefits',
        allowedBlocks: ['headline', 'body_text', 'bullet_list', 'info_card'],
        maxBlocks: 10,
        reorderable: true,
        defaultBlocks: [
          { field: 'section_headline', blockType: 'headline', description: 'Section title' },
          { field: 'monday_label', blockType: 'subheadline', description: 'Day 1 label' },
          { field: 'monday_items', blockType: 'bullet_list', description: 'Day 1 activities' },
          { field: 'tuesday_label', blockType: 'subheadline', description: 'Day 2 label' },
          { field: 'tuesday_items', blockType: 'bullet_list', description: 'Day 2 activities' }
        ]
      },
      {
        id: 'stats',
        label: 'Summit stats',
        description: 'Key numbers and achievements',
        allowedBlocks: ['stat_card'],
        maxBlocks: 6,
        reorderable: true,
        defaultBlocks: [
          { field: 'summits_value', blockType: 'stat_card', description: 'Number of summits' },
          { field: 'cities_value', blockType: 'stat_card', description: 'Number of cities' },
          { field: 'attendees_value', blockType: 'stat_card', description: 'Total attendees' },
          { field: 'mission_value', blockType: 'stat_card', description: 'Mission stat' }
        ]
      },
      {
        id: 'timeline',
        label: 'History timeline',
        description: '10 years of collaborative journalism summits',
        allowedBlocks: ['headline', 'body_text', 'timeline_item'],
        maxBlocks: 20,
        reorderable: true,
        defaultBlocks: [
          { field: 'section_headline', blockType: 'headline', description: 'Section title' },
          { field: 'section_description', blockType: 'body_text', description: 'Intro text' }
          // Timeline items are dynamically loaded from timeline array
        ]
      },
      {
        id: 'footer',
        label: 'Footer',
        description: 'Email signup, links, and contact info',
        allowedBlocks: ['headline', 'body_text', 'contact_item', 'cta_button'],
        maxBlocks: 10,
        reorderable: true,
        defaultBlocks: [
          { field: 'signup_headline', blockType: 'headline', description: 'Email signup headline' },
          { field: 'signup_description', blockType: 'body_text', description: 'Email signup description' },
          { field: 'contact_email', blockType: 'contact_item', description: 'Contact email' },
          { field: 'twitter_handle', blockType: 'contact_item', description: 'Twitter/X handle' },
          { field: 'copyright', blockType: 'body_text', description: 'Copyright text' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------------------
  // SCHEDULE PAGE
  // -------------------------------------------------------------------------
  schedule: {
    id: 'schedule',
    label: 'Schedule page',
    icon: '📅',
    description: 'Session schedule and event program',
    sections: [
      {
        id: 'schedule',
        label: 'Schedule intro',
        description: 'Page header, description, and notices',
        allowedBlocks: ['headline', 'subheadline', 'body_text', 'notice_banner', 'day_header', 'info_card'],
        maxBlocks: 15,
        reorderable: true,
        defaultBlocks: [
          { field: 'page_headline', blockType: 'headline', description: 'Page title' },
          { field: 'page_description', blockType: 'body_text', description: 'Page intro' },
          { field: 'preliminary_label', blockType: 'notice_banner', description: 'Preliminary notice' },
          { field: 'preliminary_notice', blockType: 'body_text', description: 'Notice details' },
          { field: 'monday_label', blockType: 'day_header', description: 'Monday header' },
          { field: 'monday_subtitle', blockType: 'subheadline', description: 'Monday subtitle' },
          { field: 'tuesday_label', blockType: 'day_header', description: 'Tuesday header' },
          { field: 'tuesday_subtitle', blockType: 'subheadline', description: 'Tuesday subtitle' },
          { field: 'inn_days_title', blockType: 'info_card', description: 'INN Days info' },
          { field: 'inn_days_description', blockType: 'body_text', description: 'INN Days details' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------------------
  // SPONSORS PAGE
  // -------------------------------------------------------------------------
  sponsors: {
    id: 'sponsors',
    label: 'Sponsors page',
    icon: '🤝',
    description: 'Partner and sponsor acknowledgments',
    sections: [
      {
        id: 'sponsors',
        label: 'Sponsors section',
        description: 'Thank you message, sponsor info, and packages',
        allowedBlocks: ['headline', 'subheadline', 'body_text', 'info_card', 'sponsor_package', 'cta_button', 'notice_banner'],
        maxBlocks: 30,
        reorderable: true,
        defaultBlocks: [
          { field: 'page_headline', blockType: 'headline', description: 'Page title' },
          { field: 'page_description', blockType: 'body_text', description: 'Page intro' },
          { field: 'open_label', blockType: 'notice_banner', description: 'Sponsorships open notice' },
          { field: 'open_description', blockType: 'body_text', description: 'Notice details' },
          { field: 'why_sponsor_headline', blockType: 'headline', description: 'Why sponsor section' },
          { field: 'milestone_title', blockType: 'info_card', description: 'Milestone event card' },
          { field: 'audience_title', blockType: 'info_card', description: 'Engaged audience card' },
          { field: 'exposure_title', blockType: 'info_card', description: 'Dual-event exposure card' },
          { field: 'cta_headline', blockType: 'headline', description: 'CTA section title' },
          { field: 'cta_description', blockType: 'body_text', description: 'CTA description' },
          { field: 'custom_headline', blockType: 'headline', description: 'Custom sponsorship section' },
          { field: 'custom_description', blockType: 'body_text', description: 'Custom sponsorship details' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------------------
  // CODE OF CONDUCT PAGE
  // -------------------------------------------------------------------------
  conduct: {
    id: 'conduct',
    label: 'Code of conduct',
    icon: '📋',
    description: 'Community guidelines and policies',
    sections: [
      {
        id: 'code_of_conduct',
        label: 'Code of conduct',
        description: 'Community standards, expected behavior, and reporting',
        allowedBlocks: ['headline', 'subheadline', 'body_text', 'bullet_list', 'info_card', 'contact_item'],
        maxBlocks: 30,
        reorderable: true,
        defaultBlocks: [
          { field: 'page_headline', blockType: 'headline', description: 'Page title' },
          { field: 'page_description', blockType: 'body_text', description: 'Page intro' },
          { field: 'intro', blockType: 'body_text', description: 'Introduction paragraph' },
          { field: 'expected_headline', blockType: 'headline', description: 'Expected behavior section' },
          { field: 'expected_items', blockType: 'bullet_list', description: 'Expected behavior list' },
          { field: 'unacceptable_headline', blockType: 'headline', description: 'Unacceptable behavior section' },
          { field: 'unacceptable_items', blockType: 'bullet_list', description: 'Unacceptable behavior list' },
          { field: 'consequences_headline', blockType: 'headline', description: 'Consequences section' },
          { field: 'consequences_text', blockType: 'body_text', description: 'Consequences details' },
          { field: 'reporting_headline', blockType: 'headline', description: 'Reporting section' },
          { field: 'reporting_text', blockType: 'body_text', description: 'How to report' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------------------
  // CONTACT PAGE
  // -------------------------------------------------------------------------
  contact: {
    id: 'contact',
    label: 'Contact page',
    icon: '📞',
    description: 'Contact information and organizer details',
    sections: [
      {
        id: 'contact',
        label: 'Contact information',
        description: 'Email, social media, and organizer info',
        allowedBlocks: ['headline', 'body_text', 'contact_item', 'info_card'],
        maxBlocks: 20,
        reorderable: true,
        defaultBlocks: [
          { field: 'page_headline', blockType: 'headline', description: 'Page title' },
          { field: 'page_description', blockType: 'body_text', description: 'Page intro' },
          { field: 'email_label', blockType: 'contact_item', description: 'Email contact' },
          { field: 'email_description', blockType: 'body_text', description: 'Email info' },
          { field: 'twitter_label', blockType: 'contact_item', description: 'Twitter contact' },
          { field: 'twitter_description', blockType: 'body_text', description: 'Twitter info' },
          { field: 'organizer_headline', blockType: 'headline', description: 'Organizers section' },
          { field: 'ccm_name', blockType: 'info_card', description: 'CCM info' },
          { field: 'inn_name', blockType: 'info_card', description: 'INN info' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------------------
  // AUTH PAGES
  // -------------------------------------------------------------------------
  auth: {
    id: 'auth',
    label: 'Auth pages',
    icon: '🔐',
    description: 'Login, registration, and dashboard messaging',
    sections: [
      {
        id: 'login',
        label: 'Login page',
        description: 'Sign-in form messaging',
        allowedBlocks: ['headline', 'body_text', 'cta_button'],
        maxBlocks: 5,
        reorderable: false,
        defaultBlocks: [
          { field: 'page_headline', blockType: 'headline', description: 'Page title' },
          { field: 'email_label', blockType: 'body_text', description: 'Email field label' },
          { field: 'submit_button', blockType: 'cta_button', description: 'Submit button text' }
        ]
      },
      {
        id: 'register',
        label: 'Registration',
        description: 'Sign-up form messaging',
        allowedBlocks: ['headline', 'body_text', 'cta_button'],
        maxBlocks: 5,
        reorderable: false,
        defaultBlocks: [
          { field: 'email_label', blockType: 'body_text', description: 'Email field label' },
          { field: 'submit_button', blockType: 'cta_button', description: 'Submit button text' },
          { field: 'login_prompt', blockType: 'body_text', description: 'Login link text' }
        ]
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        description: 'User dashboard content',
        allowedBlocks: ['headline', 'body_text'],
        maxBlocks: 5,
        reorderable: false,
        defaultBlocks: [
          { field: 'page_headline', blockType: 'headline', description: 'Page title' },
          { field: 'welcome_message', blockType: 'body_text', description: 'Welcome message' },
          { field: 'signout_button', blockType: 'cta_button', description: 'Sign out button' }
        ]
      }
    ]
  },

  // -------------------------------------------------------------------------
  // GLOBAL ELEMENTS
  // -------------------------------------------------------------------------
  global: {
    id: 'global',
    label: 'Global elements',
    icon: '🌐',
    description: 'Navigation, footer, and shared components',
    sections: [
      {
        id: 'navbar',
        label: 'Navigation bar',
        description: 'Site-wide navigation links',
        allowedBlocks: ['body_text'],
        maxBlocks: 10,
        reorderable: true,
        defaultBlocks: [
          { field: 'brand_text', blockType: 'body_text', description: 'Brand/logo text' },
          { field: 'home_link', blockType: 'body_text', description: 'Home link text' },
          { field: 'schedule_link', blockType: 'body_text', description: 'Schedule link text' },
          { field: 'sponsors_link', blockType: 'body_text', description: 'Sponsors link text' },
          { field: 'contact_link', blockType: 'body_text', description: 'Contact link text' },
          { field: 'code_of_conduct_link', blockType: 'body_text', description: 'Code of conduct link' }
        ]
      },
      {
        id: 'general',
        label: 'General content',
        description: 'Miscellaneous shared content',
        allowedBlocks: ['headline', 'body_text', 'info_card', 'cta_button'],
        maxBlocks: 20,
        reorderable: true,
        defaultBlocks: []
      }
    ]
  }
}

// ============================================================================
// COLOR OPTIONS
// ============================================================================

export const COLOR_OPTIONS = [
  { value: 'teal', label: 'Teal (primary)', class: 'bg-brand-teal', hex: '#2A9D8F' },
  { value: 'cardinal', label: 'Cardinal (accent)', class: 'bg-brand-cardinal', hex: '#9D2A2A' },
  { value: 'ink', label: 'Ink (text)', class: 'bg-brand-ink', hex: '#2C3E50' },
  { value: 'green-dark', label: 'Green', class: 'bg-green-800', hex: '#166534' },
  { value: 'amber', label: 'Amber (warning)', class: 'bg-amber-600', hex: '#D97706' },
  { value: 'gold', label: 'Gold (highlight)', class: 'bg-yellow-600', hex: '#CA8A04' },
  { value: 'cream', label: 'Cream (background)', class: 'bg-brand-cream', hex: '#F5F0E6' }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all sections for a page
 */
export function getPageSections(pageId) {
  const page = PAGE_CONFIGS[pageId]
  return page?.sections || []
}

/**
 * Get allowed block types for a section
 */
export function getAllowedBlocksForSection(pageId, sectionId) {
  const page = PAGE_CONFIGS[pageId]
  const section = page?.sections.find(s => s.id === sectionId)
  if (!section) return []

  return section.allowedBlocks.map(blockId => BLOCK_TYPES[blockId]).filter(Boolean)
}

/**
 * Get block type definition
 */
export function getBlockType(blockTypeId) {
  return BLOCK_TYPES[blockTypeId]
}

/**
 * Get all pages as array
 */
export function getAllPages() {
  return Object.values(PAGE_CONFIGS)
}

/**
 * Find which page/section a field belongs to
 */
export function findFieldLocation(sectionId) {
  for (const page of Object.values(PAGE_CONFIGS)) {
    const section = page.sections.find(s => s.id === sectionId)
    if (section) {
      return { page, section }
    }
  }
  return null
}

/**
 * Get default blocks for a section
 */
export function getDefaultBlocks(pageId, sectionId) {
  const page = PAGE_CONFIGS[pageId]
  const section = page?.sections.find(s => s.id === sectionId)
  return section?.defaultBlocks || []
}

/**
 * Check if section supports reordering
 */
export function isSectionReorderable(pageId, sectionId) {
  const page = PAGE_CONFIGS[pageId]
  const section = page?.sections.find(s => s.id === sectionId)
  return section?.reorderable !== false
}

/**
 * Get max blocks for a section
 */
export function getMaxBlocks(pageId, sectionId) {
  const page = PAGE_CONFIGS[pageId]
  const section = page?.sections.find(s => s.id === sectionId)
  return section?.maxBlocks || 50
}

export default {
  BLOCK_TYPES,
  PAGE_CONFIGS,
  COLOR_OPTIONS,
  getPageSections,
  getAllowedBlocksForSection,
  getBlockType,
  getAllPages,
  findFieldLocation,
  getDefaultBlocks,
  isSectionReorderable,
  getMaxBlocks
}
