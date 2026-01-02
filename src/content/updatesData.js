/**
 * Updates/News content for CJS2026
 *
 * Each update has a unique slug for shareable URLs:
 * summit.collaborativejournalism.org/updates/[slug]
 *
 * To add a new update:
 * 1. Add a new object to the updates array
 * 2. Use a unique, URL-friendly slug (lowercase, hyphens)
 * 3. Set featured: true for prominent display on the updates page
 */

export const updates = [
  {
    slug: 'session-pitches-open',
    type: 'announcement',
    featured: true,
    title: 'Session pitches now open for CJS2026',
    summary: 'We\'re accepting proposals for panels, workshops, and lightning talks. Share your collaborative journalism expertise with 150 practitioners, funders, and media leaders.',
    content: `
The 10th anniversary Collaborative Journalism Summit is taking shape, and we need your help to build the program.

**What we're looking for:**
- **Panels** (45-60 min) — Moderated discussions with 3-4 speakers
- **Workshops** (90 min) — Hands-on learning sessions with practical takeaways
- **Lightning talks** (10 min) — Quick case studies or lessons learned

**Topics of interest:**
- Sustainability models for news collaboratives
- Technology and tools that enable collaboration
- Measuring the impact of collaborative journalism
- Building and maintaining trust with partners
- Regional and hyperlocal collaboration strategies
- Collaborative approaches to coverage beats (elections, climate, etc.)

**Who should pitch:**
We welcome proposals from journalists, editors, project managers, funders, technologists, and academics. First-time presenters are encouraged to apply.

**How to pitch:**
Contact us at summit@collaborativejournalism.org with:
- Session title
- Format (panel, workshop, or lightning talk)
- 150-word description
- Speaker names and organizations
- What attendees will learn

**Deadline: January 31, 2026**
    `.trim(),
    date: '2026-01-02',
    category: 'Call for proposals',
    cta: {
      text: 'Contact us to pitch',
      url: '/contact',
      external: false
    },
    color: 'teal'
  },
  {
    slug: 'knight-foundation-presenting-sponsor',
    type: 'announcement',
    featured: true,
    title: 'Knight Foundation joins as presenting sponsor',
    summary: 'We\'re honored to welcome Knight Foundation as the presenting sponsor of CJS2026, continuing their commitment to strengthening journalism through collaboration.',
    content: `
Knight Foundation has joined CJS2026 as the presenting sponsor, marking a decade of their investment in the collaborative journalism movement.

Since the earliest days of the Collaborative Journalism Summit, Knight Foundation has been a champion of the idea that journalism is stronger when newsrooms work together. Their support has helped bring together over 1,500 journalists, editors, funders, and media leaders across 10 summits and 7 cities.

"Collaborative journalism has moved from an experiment to an essential practice," said [Knight Foundation representative]. "CJS2026 represents the maturation of this approach, and we're proud to support the community gathering that makes it possible."

**About Knight Foundation**
Knight Foundation is a national foundation with strong local roots. They invest in journalism, in the arts, and in the success of cities where brothers John S. and James L. Knight once published newspapers.

For information about sponsoring CJS2026, visit the sponsors page or contact summit@collaborativejournalism.org.
    `.trim(),
    date: '2025-12-18',
    category: 'Sponsors',
    cta: {
      text: 'Learn about sponsoring',
      url: '/sponsors',
      external: false
    },
    color: 'cardinal'
  },
  {
    slug: 'pitch-deadline-january-31',
    type: 'deadline',
    title: 'Session pitch deadline: January 31',
    summary: 'Final call for session proposals. Pitch a panel, workshop, or lightning talk to help shape the CJS2026 program.',
    content: `
**The deadline for CJS2026 session pitches is January 31, 2026.**

We're looking for proposals that showcase real-world collaborative journalism — successes, challenges, and lessons learned. Whether you've launched a statewide reporting network or are just starting to explore collaboration, we want to hear from you.

**What makes a strong pitch:**
- Focuses on practical, actionable insights
- Draws from real experience (not just theory)
- Identifies clear learning outcomes for attendees
- Represents diverse perspectives and voices

**Submit your pitch:**
Email summit@collaborativejournalism.org with your proposal by January 31.

Don't wait until the last minute — we'll be reviewing pitches on a rolling basis and may reach out to discuss your ideas before the deadline.
    `.trim(),
    date: '2026-01-31',
    category: 'Deadlines',
    countdown: true,
    cta: {
      text: 'Contact us to pitch',
      url: '/contact',
      external: false
    },
    color: 'cardinal'
  },
  {
    slug: 'decade-of-collaborative-journalism',
    type: 'story',
    title: 'A decade of proving journalism is stronger together',
    summary: 'Since 2017, CJS has grown from 20 attendees in Montclair to 1,500+ practitioners across 7 cities. For our 10th anniversary, we\'re celebrating how far collaborative journalism has come.',
    content: `
In 2017, about 20 people gathered at Montclair State University for an unconventional idea: What if competing newsrooms actually worked together?

Ten years later, that question has been answered. Collaborative journalism has grown from an experiment into standard practice for newsrooms across the country. State journalism collaboratives now exist in nearly every state. Cross-border investigations have exposed corruption on a global scale. And local newsrooms have found that sharing resources — whether data, content, or expertise — makes them all stronger.

**By the numbers:**
- **10** summits since 2017
- **7** cities (plus 2 virtual years)
- **1,500+** total attendees
- **1** mission: journalism is stronger together

**The journey:**
- **2017 Montclair** — The beginning
- **2018 Montclair** — Building bridges
- **2019 Philadelphia** — People over projects
- **2020 Virtual** — Adapting together
- **2021 Virtual** — Removing barriers
- **2022 Chicago** — Building to last
- **2023 Washington, D.C.** — Building frameworks
- **2024 Detroit** — Local focus
- **2025 Denver** — Partnerships with purpose
- **2026 Chapel Hill** — From experiment to ecosystem

For the 10th anniversary summit, we're returning to our roots while looking ahead. Join us in Chapel Hill to celebrate how far we've come and shape where we go next.
    `.trim(),
    date: '2025-12-15',
    category: '10th anniversary',
    cta: {
      text: 'Explore our full history',
      url: '/#history',
      external: false
    },
    color: 'green-dark'
  },
  {
    slug: 'cjs2026-chapel-hill',
    type: 'story',
    title: 'CJS2026 heads to Chapel Hill, North Carolina',
    summary: 'The Southeast is home to innovative collaborative journalism projects. We\'re bringing the summit to UNC Friday Center on June 8-9, 2026.',
    content: `
For the 10th anniversary Collaborative Journalism Summit, we're heading to Chapel Hill, North Carolina.

**Why the Southeast:**
The region is home to some of the most innovative collaborative journalism work in the country:
- The **NC Local News Workshop** is building sustainable models for community journalism
- **Scalawag** and regional partners are reframing Southern storytelling
- **North Carolina public media** newsrooms have pioneered collaborative coverage of elections and environmental issues

Chapel Hill, home to one of the nation's oldest public universities and a vibrant media ecosystem, is the perfect setting for our 10th anniversary gathering.

**Venue: UNC Friday Center**
The William and Ida Friday Center for Continuing Education offers modern conference facilities in a campus setting, with easy access from Raleigh-Durham International Airport (RDU).

**Dates: June 8-9, 2026**
- **Monday, June 8** — Full day of sessions plus evening dinner
- **Tuesday, June 9** — Morning workshops

**Co-located with INN Days**
Stay for INN Days (June 9-11) and get even more value from your trip. Two events, one venue, one amazing week for journalism.
    `.trim(),
    date: '2025-12-10',
    category: 'Location',
    cta: {
      text: 'See venue details',
      url: '/contact',
      external: false
    },
    color: 'teal'
  },
  {
    slug: 'inn-days-colocation',
    type: 'announcement',
    title: 'Co-located with INN Days 2026',
    summary: 'Attend both CJS2026 (June 8-9) and INN Days (June 9-11) at UNC Friday Center. Two events, one trip, maximum value.',
    content: `
Good news for your calendar (and your travel budget): CJS2026 and INN Days 2026 will be co-located at UNC Friday Center in Chapel Hill.

**The lineup:**
- **June 8-9** — Collaborative Journalism Summit (CJS2026)
- **June 9-11** — INN Days

That means Tuesday, June 9 is a crossover day — attend CJS morning workshops, then transition into INN Days programming.

**Why this matters:**
The Institute for Nonprofit News (INN) has been a partner in the collaborative journalism movement since the beginning. Co-locating our events means you can:
- Connect with nonprofit news leaders from across the country
- Explore sustainability strategies for both collaboratives and individual newsrooms
- Build relationships that turn into partnerships
- Get maximum value from one trip

**About INN Days:**
INN Days is the annual gathering of the nonprofit news sector. Attendees include executive directors, editors, development officers, and board members from INN's 400+ member organizations.

Learn more at [inn.org](https://inn.org).
    `.trim(),
    date: '2025-12-01',
    category: 'Events',
    cta: {
      text: 'Learn more about INN',
      url: 'https://inn.org',
      external: true
    },
    color: 'green-dark'
  },
  {
    slug: 'registration-coming-soon',
    type: 'announcement',
    title: 'Registration opens early 2026',
    summary: 'Sign up for email updates to be the first to know when registration opens. Early bird pricing available for the first 50 registrants.',
    content: `
Registration for CJS2026 will open in early 2026. Here's what you need to know:

**Early bird pricing:**
The first 50 registrants will receive early bird pricing. Sign up for our email list to be notified the moment registration opens.

**What's included:**
- Full access to all CJS2026 sessions (June 8-9)
- Monday evening dinner and celebration
- Coffee, snacks, and lunch
- Access to the CJS community Slack workspace
- Materials and resources from sessions

**Scholarships:**
We're committed to making CJS accessible to journalists from all backgrounds. Scholarship information will be announced alongside registration.

**Group rates:**
Bringing a team? Contact us about group registration options.

**Questions?**
Email summit@collaborativejournalism.org with any registration questions.
    `.trim(),
    date: '2025-11-15',
    category: 'Registration',
    cta: {
      text: 'Get email updates',
      url: '/',
      external: false
    },
    color: 'teal'
  }
]

// Helper functions
export function getUpdateBySlug(slug) {
  return updates.find(u => u.slug === slug) || null
}

export function getFeaturedUpdates() {
  return updates.filter(u => u.featured)
}

export function getRecentUpdates(limit = 5) {
  return [...updates]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
}

export function getUpdatesByCategory(category) {
  return updates.filter(u => u.category.toLowerCase() === category.toLowerCase())
}

// Calculate days until a date
export function getDaysUntil(dateString) {
  const target = new Date(dateString)
  const now = new Date()
  const diff = target - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default updates
