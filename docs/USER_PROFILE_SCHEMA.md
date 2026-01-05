# CJS2026 User Profile Schema

This document defines the complete data schema for user profile documents stored in Firestore.

**Collection:** `users`
**Document ID:** Firebase Auth UID (unique per user)

---

## Field Reference

### Core Identity

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `email` | string | Yes | "" | User's email address (from auth provider) |
| `displayName` | string | Yes | "" | User's full name |
| `photoURL` | string | No | "" | Profile photo URL (Firebase Storage or external) |

### Professional Info

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `organization` | string | No | "" | Employer/organization name |
| `jobTitle` | string | No | "" | User's job title/position |

### Social Links

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `website` | string | No | "" | Personal/org website (without `https://`) |
| `instagram` | string | No | "" | Instagram username (without `@`) |
| `linkedin` | string | No | "" | LinkedIn username (just the slug after `/in/`) |
| `bluesky` | string | No | "" | Bluesky handle (e.g., `user.bsky.social`) |

### Registration & Status

| Field | Type | Required | Default | Valid Values |
|-------|------|----------|---------|--------------|
| `registrationStatus` | string | Yes | `"pending"` | `pending`, `registered`, `confirmed` |
| `role` | string/null | No | `null` | `null`, `admin`, `super_admin` |
| `notifyWhenTicketsAvailable` | boolean | No | `false` | `true`, `false` |

**Status definitions:**
- `pending` - Awaiting ticket purchase or admin approval
- `registered` - Has purchased a ticket or been approved by admin
- `confirmed` - Additional confirmation (typically for staff/speakers)

**Role definitions:**
- `null` - Regular user (no special permissions)
- `admin` - Can access admin panel, manage users
- `super_admin` - Full system access, can grant/revoke admin roles

### Eventbrite Integration

These fields are automatically set by the Eventbrite webhook when a user purchases a ticket.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `eventbriteAttendeeId` | string/null | No | `null` | Eventbrite attendee ID |
| `eventbriteOrderId` | string/null | No | `null` | Eventbrite order ID |

### Schedule Features

| Field | Type | Required | Default | Valid Values |
|-------|------|----------|---------|--------------|
| `savedSessions` | array | No | `[]` | Array of session IDs |
| `scheduleVisibility` | string | No | `"private"` | `private`, `attendees_only`, `public` |

**Visibility definitions:**
- `private` - Only the user can see their schedule
- `attendees_only` - Other registered attendees can view
- `public` - Anyone with the link can view

### Summit History

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `attendedSummits` | array | No | `[]` | Array of years attended |

**Valid years:** `2017`, `2018`, `2019`, `2020`, `2021`, `2022`, `2023`, `2024`, `2025`

**Summit locations:**
| Year | Location | Notes |
|------|----------|-------|
| 2017 | Montclair, NJ | Inaugural summit |
| 2018 | Montclair, NJ | |
| 2019 | Philadelphia, PA | |
| 2020 | Virtual | Pandemic |
| 2021 | Virtual | Pandemic |
| 2022 | Chicago, IL | |
| 2023 | Washington, D.C. | |
| 2024 | Detroit, MI | |
| 2025 | Denver, CO | |

### Badges

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `badges` | array | No | `[]` | Array of predefined badge IDs |
| `customBadges` | object | No | `{}` | Custom badges by category |

**Custom badges structure:**
```javascript
{
  philosophy: [
    { id: 'custom-phil-1', label: 'my custom badge', emoji: '🎯' }
  ],
  misc: [
    { id: 'custom-misc-1', label: 'another badge', emoji: '⚡' }
  ]
}
```

### Timestamps

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `createdAt` | timestamp | Yes | `serverTimestamp()` | When profile was created |
| `updatedAt` | timestamp | Yes | `serverTimestamp()` | Last profile update |

---

## Badge Reference

### Experience Badges (pick 1)

| ID | Label | Emoji | Description |
|----|-------|-------|-------------|
| `collab-curious` | collab curious | 🌱 | new to collaborative journalism |
| `collab-practitioner` | practitioner | 🤝 | actively collaborating |
| `collab-veteran` | veteran | 🎖️ | 3+ collaborations under my belt |
| `collab-evangelist` | evangelist | 📣 | spreading the collab gospel |

### Role Badges (pick 1, or 2 if "personality hire" selected)

| ID | Label | Emoji | Description |
|----|-------|-------|-------------|
| `role-reporter` | reporter | 📝 | on the ground |
| `role-editor` | editor | ✂️ | making it better |
| `role-leadership` | leadership | 🧭 | setting direction |
| `role-funder` | funder | 💰 | supporting the work |
| `role-academic` | academic | 🎓 | research & teaching |
| `role-technologist` | technologist | 💻 | building tools |
| `role-organizer` | organizer | 🗂️ | bringing people together |
| `role-personality-hire` | personality hire | ✨ | here for the vibes |

### Philosophy Badges (pick 1 + up to 3 custom)

| ID | Label | Emoji | Description |
|----|-------|-------|-------------|
| `value-cooperation` | cooperation > competition | 🤲 | rising tides lift all boats |
| `value-public-good` | public good | 🌍 | journalism as public service |
| `value-indie` | indie spirit | 🏴 | independent & nonprofit |
| `value-local-first` | local first | 🏘️ | community journalism advocate |
| `value-open-source` | open source | 🔓 | share the tools |
| `value-solidarity` | solidarity | ✊ | workers unite |
| `value-disruptor` | disruptor | 💥 | break the old models |
| `value-bridge-builder` | bridge builder | 🌉 | connecting communities |

### Misc Badges (pick 1 + up to 3 custom)

| ID | Label | Emoji | Description |
|----|-------|-------|-------------|
| `misc-deadline-driven` | deadline driven | ⏰ | best under pressure |
| `misc-data-hound` | data hound | 🔍 | FOIA is my love language |
| `misc-rural-beat` | rural beat | 🌾 | covering where others don't |
| `misc-audio-first` | audio first | 🎙️ | podcast or bust |
| `misc-newsletter-brain` | newsletter brain | 📧 | inbox zero? never heard of it |
| `misc-grant-writer` | grant writer | 📋 | theory of change enthusiast |
| `misc-cms-survivor` | CMS survivor | 🖥️ | i've seen things |
| `misc-source-whisperer` | source whisperer | 🤫 | people tell me things |
| `misc-j-school` | j-school | 🏫 | Mizzou/Northwestern/Columbia/etc |
| `misc-self-taught` | self-taught | 📚 | learned in the field |
| `misc-bilingual` | bilingual | 🗣️ | reporting across languages |
| `misc-visual-thinker` | visual thinker | 📐 | charts, maps, graphics |

### Attendance Badges (auto-generated from `attendedSummits`)

These badges are automatically calculated based on the user's `attendedSummits` array.

| ID Pattern | Label | Condition |
|------------|-------|-----------|
| `cjs-first-timer` | first timer | Never attended any summit |
| `cjs-og` | OG | Attended inaugural 2017 summit |
| `cjs-zoom-veteran` | zoom veteran | Attended both 2020 AND 2021 |
| `cjs-pandemic-pioneer` | pandemic pioneer | Attended 2020 only |
| `cjs-lockdown-loyalist` | lockdown loyalist | Attended 2021 only |
| `cjs-streak-2` | back-to-back | 2 consecutive years |
| `cjs-streak-3` | three-peat | 3 consecutive years |
| `cjs-streak` | N-year streak | 4+ consecutive years |
| `cjs-{city}` | {city} | Single in-person attendance (e.g., `cjs-detroit`) |
| `cjs-{N}x` | {N}x attendee | 3-5 total summits attended |
| `cjs-super-fan` | super fan | 6+ total summits attended |

### Available Emojis for Custom Badges

When creating custom badges, users can choose from these emojis:

`💡` `🎯` `🚀` `⚡` `🌟` `💪` `🎨` `📰` `🗞️` `✍️` `🔗` `🌐` `💬` `🎤` `📸` `🎬`

---

## Example Document

```javascript
{
  // Core identity
  "email": "jane.smith@newsorg.com",
  "displayName": "Jane Smith",
  "photoURL": "https://storage.googleapis.com/cjs2026.appspot.com/profile-photos/abc123/photo.jpg",

  // Professional info
  "organization": "Local News Initiative",
  "jobTitle": "Managing Editor",

  // Social links
  "website": "localnews.org",
  "instagram": "janesmith_news",
  "linkedin": "janesmith",
  "bluesky": "janesmith.bsky.social",

  // Registration & status
  "registrationStatus": "registered",
  "role": null,
  "notifyWhenTicketsAvailable": false,

  // Eventbrite integration
  "eventbriteAttendeeId": "1234567890",
  "eventbriteOrderId": "9876543210",

  // Schedule features
  "savedSessions": ["mon-keynote", "mon-session-2", "tue-workshop-1"],
  "scheduleVisibility": "attendees_only",

  // Summit history & badges
  "attendedSummits": [2022, 2023, 2024],
  "badges": ["collab-practitioner", "role-editor", "value-local-first", "misc-rural-beat"],
  "customBadges": {
    "philosophy": [],
    "misc": [
      { "id": "custom-misc-1", "label": "small town advocate", "emoji": "🏘️" }
    ]
  },

  // Timestamps
  "createdAt": "2024-12-15T10:30:00Z",
  "updatedAt": "2024-12-18T15:45:00Z"
}
```

---

## Related Files

- `src/contexts/AuthContext.jsx` - Profile creation/update logic
- `src/pages/Dashboard.jsx` - Badge definitions and profile editing
- `src/pages/Admin.jsx` - Admin user management
- `scripts/create-test-user.cjs` - Script to create test user with all fields

---

*Last updated: January 2026*
