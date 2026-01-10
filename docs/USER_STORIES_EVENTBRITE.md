# Eventbrite Integration User Stories

Generated: 2026-01-10
Based on: CJS2026 Eventbrite integration analysis

---

## Overview

The Eventbrite integration synchronizes ticket purchases with user accounts, enabling automatic registration status updates and access control for features like session bookmarking. The system handles real-time webhook events, batch syncing, and graceful handling of edge cases like refunds and unmatched tickets.

**Key workflows:**
- Real-time: Webhook → Auto-match ticket to user → Update registration status
- Delayed: User signs up → Check for unmatched ticket → Auto-match if found
- Manual: Admin triggers batch sync → Match all Eventbrite attendees

---

## User Stories

### US-EVENTBRITE-01: Ticket Purchase Auto-Updates Existing User

**As a** registered user who has already created a CJS2026 account
**I want** my registration status to automatically update when I purchase a ticket on Eventbrite
**So that** I immediately gain access to features like session bookmarking without manual intervention

**Acceptance Criteria:**
- [ ] Given a user with email "user@example.com" exists in Firebase users collection
- [ ] When Eventbrite sends an "order.placed" webhook for a ticket purchased by "user@example.com"
- [ ] Then the webhook handler verifies the HMAC-SHA256 signature before processing
- [ ] And the system fetches the full order details from the Eventbrite API
- [ ] And the user's profile is updated with:
  - `registrationStatus: 'registered'`
  - `eventbriteAttendeeId: <attendee_id>`
  - `eventbriteOrderId: <order_id>`
  - `ticketType: <ticket_class_name>`
  - `ticketPurchasedAt: <created_timestamp>`
  - `updatedAt: <server_timestamp>`
- [ ] And a record is created in `eventbrite_synced` collection with: `{email, userId, syncedAt}`
- [ ] And the user can now bookmark sessions (registrationStatus = 'registered')
- [ ] And the update appears immediately in the user's Dashboard without page refresh

**Edge Cases:**
- Multiple attendees in one order (each matched independently)
- User email case mismatch (system uses case-insensitive matching)
- User purchased ticket before webhook was configured (handle via manual sync)
- Duplicate webhook delivery (idempotent - safe to process multiple times)

**Files:**
- `/home/user/cjs2026/functions/index.js` (eventbriteWebhook, lines 1325-1465)
- `/home/user/cjs2026/src/contexts/AuthContext.jsx` (canBookmarkSessions, lines 1026-1073)
- `/home/user/cjs2026/firestore.rules` (users collection, lines 18-40)

---

### US-EVENTBRITE-02: Ticket Purchase for Non-User Stored as Unmatched

**As a** person who purchased a ticket on Eventbrite but hasn't created a CJS2026 account yet
**I want** my ticket to be stored safely in the system
**So that** it can be automatically linked to my account when I sign up later

**Acceptance Criteria:**
- [ ] Given a ticket is purchased by "newuser@example.com" on Eventbrite
- [ ] When the "order.placed" webhook is received
- [ ] And no Firebase user exists with email "newuser@example.com"
- [ ] Then a document is created in `eventbrite_unmatched` collection with:
  - `email: "newuser@example.com"`
  - `name: <first_name last_name>`
  - `orderId: <order_id>`
  - `attendeeId: <attendee_id>`
  - `ticketType: <ticket_class_name> (default: 'General')`
  - `purchasedAt: <created_timestamp>`
  - `matched: false`
- [ ] And the unmatched ticket persists until a matching user account is created
- [ ] And the webhook responds with 200 OK (successful processing)

**Edge Cases:**
- Email typo in Eventbrite purchase (manual admin intervention needed)
- User creates account with different email than ticket (won't auto-match)
- Multiple unmatched tickets for same email (each stored separately)

**Files:**
- `/home/user/cjs2026/functions/index.js` (eventbriteWebhook, lines 1448-1462)

---

### US-EVENTBRITE-03: New User Account Auto-Matches Unmatched Ticket

**As a** person who purchased a ticket before creating an account
**I want** my ticket to automatically link to my new account when I sign up
**So that** I don't need to manually prove I purchased a ticket

**Acceptance Criteria:**
- [ ] Given an unmatched ticket exists in `eventbrite_unmatched` for "user@example.com" with `matched: false`
- [ ] When a new user creates an account with email "user@example.com"
- [ ] Then `checkEventbriteTicket()` Cloud Function is called automatically (triggered from frontend after signup)
- [ ] And the function queries `eventbrite_unmatched` collection for matching email
- [ ] And the user's profile is updated with ticket data:
  - `registrationStatus: 'registered'`
  - `eventbriteAttendeeId: <attendee_id>`
  - `eventbriteOrderId: <order_id>`
  - `ticketType: <ticket_type>`
  - `ticketPurchasedAt: <purchased_at>`
- [ ] And the unmatched ticket is marked as matched:
  - `matched: true`
  - `matchedUserId: <user_uid>`
  - `matchedAt: <iso_timestamp>`
- [ ] And a record is added to `eventbrite_synced` collection
- [ ] And the function returns: `{matched: true, ticket: {attendeeId, orderId, ticketType}}`
- [ ] And the user immediately has bookmarking permissions

**Edge Cases:**
- Multiple unmatched tickets for same email (matches first one, limit 1 query)
- No unmatched tickets found (returns `{matched: false}`)
- User email case differs from ticket email (case-insensitive query)
- Ticket was refunded after being stored (skip refunded tickets)

**Files:**
- `/home/user/cjs2026/functions/index.js` (checkEventbriteTicket, lines 1809-1895)
- `/home/user/cjs2026/src/contexts/AuthContext.jsx` (calls checkEventbriteTicket after signup)

---

### US-EVENTBRITE-04: Admin Triggers Manual Eventbrite Sync

**As an** admin
**I want to** manually trigger a full sync of all Eventbrite attendees
**So that** I can ensure all ticket purchases are matched, especially for tickets purchased before the webhook was configured

**Acceptance Criteria:**
- [ ] Given I am logged in with `role: 'admin'` or `role: 'super_admin'`
- [ ] When I call the `syncEventbriteAttendees` Cloud Function with `{eventId: <eventbrite_event_id>}`
- [ ] Then the function verifies I have admin permissions (403 if not)
- [ ] And fetches all attendees from Eventbrite API (paginated)
- [ ] And for each attendee:
  - Skip if already exists in `eventbrite_synced` collection (increment `alreadySynced` counter)
  - If Firebase user exists with matching email: Update user profile + add to `eventbrite_synced` (increment `matched` counter)
  - If no matching user: Add to `eventbrite_unmatched` collection (increment `unmatched` counter)
- [ ] And a background job log is created with status 'completed'
- [ ] And the function returns:
  ```json
  {
    "success": true,
    "stats": {
      "total": 150,
      "matched": 120,
      "unmatched": 25,
      "alreadySynced": 5
    }
  }
  ```
- [ ] And the sync completes within reasonable time for large events (performance consideration)

**Edge Cases:**
- Eventbrite API rate limiting (handle 429 responses)
- Network timeout during sync (partial completion, safe to re-run)
- Missing EVENTBRITE_TOKEN secret (500 error with clear message)
- Non-admin tries to call function (403 Unauthorized)
- Invalid eventId parameter (400 Bad Request)

**Files:**
- `/home/user/cjs2026/functions/index.js` (syncEventbriteAttendees, lines 1645-1803)

---

### US-EVENTBRITE-05: Refund Resets Registration Status

**As a** user who requests a refund for my ticket
**I want** my registration status to be reset
**So that** I no longer have access to registered-attendee-only features

**Acceptance Criteria:**
- [ ] Given a user has `registrationStatus: 'registered'` and `eventbriteOrderId: '12345'`
- [ ] When Eventbrite sends an "order.refunded" webhook for order "12345"
- [ ] Then the webhook signature is verified (reject if invalid)
- [ ] And the user's profile is updated to:
  - `registrationStatus: 'pending'`
  - `eventbriteAttendeeId: null`
  - `eventbriteOrderId: null`
- [ ] And the user's record is removed from `eventbrite_synced` collection
- [ ] And if a record exists in `eventbrite_unmatched`, it is marked with:
  - `refunded: true`
  - `refundedAt: <iso_timestamp>`
- [ ] And the user can no longer bookmark sessions (status = 'pending')
- [ ] And a background job log records the refund processing

**Edge Cases:**
- Partial refund (Eventbrite treats as full refund, system follows)
- Refund for never-matched ticket (only marks unmatched entry as refunded)
- User has multiple orders (only affects the refunded order)
- Refund webhook received multiple times (idempotent)

**Files:**
- `/home/user/cjs2026/functions/index.js` (handleRefund, lines 1501-1564)

---

### US-EVENTBRITE-06: Check-In Confirms Registration

**As an** attendee arriving at the physical summit
**I want** my registration status to update to 'confirmed' when I check in
**So that** the system knows I actually attended the event

**Acceptance Criteria:**
- [ ] Given a user has `registrationStatus: 'registered'` and email "user@example.com"
- [ ] When event staff check in the attendee via Eventbrite's check-in system
- [ ] Then Eventbrite sends an "attendee.checked_in" webhook
- [ ] And the webhook signature is verified
- [ ] And the system fetches attendee details from Eventbrite API
- [ ] And the matching Firebase user is found by email
- [ ] And the user's profile is updated with:
  - `registrationStatus: 'confirmed'`
  - `checkedIn: true`
  - `checkedInAt: <iso_timestamp>`
  - `updatedAt: <server_timestamp>`
- [ ] And an activity log entry is created: `type: 'attendee_checked_in', userId, data: {email, attendeeId}`
- [ ] And a background job log records the check-in

**Edge Cases:**
- User checks in but has no Firebase account (logged but no profile update)
- Check-out webhook received (sets `checkedOut: true, checkedOutAt: <timestamp>`)
- Multiple check-ins for same user (updates timestamp, remains idempotent)
- Email mismatch (case-insensitive matching)

**Files:**
- `/home/user/cjs2026/functions/index.js` (handleCheckInOut, lines 1567-1638)

---

### US-EVENTBRITE-07: Webhook Rejects Invalid Signature

**As a** security-conscious system
**I want to** reject webhook requests with invalid or missing HMAC signatures
**So that** attackers cannot spoof Eventbrite webhooks to grant unauthorized access

**Acceptance Criteria:**
- [ ] Given the `EVENTBRITE_WEBHOOK_KEY` secret is configured in Firebase
- [ ] When a webhook request arrives with header `X-Eventbrite-Delivery-Signature`
- [ ] Then the system computes HMAC-SHA256 hash: `crypto.createHmac('sha256', secret).update(rawBody).digest('hex')`
- [ ] And compares the computed signature with the header value using constant-time comparison (`crypto.timingSafeEqual`)
- [ ] And if signatures match: Process the webhook (200 OK)
- [ ] And if signatures don't match:
  - Log error to `system_errors` collection
  - Return 401 Unauthorized with `{error: 'Invalid signature'}`
  - Do NOT process the webhook payload
- [ ] And if `EVENTBRITE_WEBHOOK_KEY` is not configured:
  - Log critical error
  - Return 401 Unauthorized with `{error: 'Webhook signature verification required'}`
  - Reject ALL webhooks (fail-secure)

**Edge Cases:**
- Missing `X-Eventbrite-Delivery-Signature` header (treated as invalid)
- Malformed signature (not hex string - crypto error caught, returns false)
- Timing attack attempts (mitigated by constant-time comparison)
- Environment misconfiguration (secret not set - rejects all webhooks)

**Files:**
- `/home/user/cjs2026/functions/index.js` (verifyEventbriteSignature, lines 1296-1314; eventbriteWebhook signature check, lines 1333-1353)

---

### US-EVENTBRITE-08: View Eventbrite Sync Status in Admin Panel

**As an** admin
**I want to** view statistics about Eventbrite ticket syncing
**So that** I can monitor how many tickets are matched vs unmatched and identify issues

**Acceptance Criteria:**
- [ ] Given I am logged in as admin
- [ ] When I navigate to Admin Panel → Overview or Attendees tab
- [ ] Then I see a "Eventbrite Sync Status" card/section displaying:
  - Total synced tickets: `<count from eventbrite_synced collection>`
  - Unmatched tickets: `<count where eventbrite_unmatched.matched == false>`
  - Last sync timestamp (if manual sync was run)
- [ ] And I see a list of unmatched emails:
  ```
  Unmatched Tickets (25):
  - newuser@example.com (Ticket: General, Purchased: 2026-01-05)
  - another@example.com (Ticket: VIP, Purchased: 2026-01-06)
  ```
- [ ] And I can click "Trigger Manual Sync" button to run `syncEventbriteAttendees()`
- [ ] And after sync completes, I see updated statistics and a success message:
  ```
  Sync completed: 10 matched, 5 unmatched, 15 already synced (30 total)
  ```

**Edge Cases:**
- No unmatched tickets (display "All tickets matched!")
- Sync in progress (disable button, show loading state)
- Sync fails (display error message with details)
- Missing Eventbrite credentials (show configuration error)

**Files:**
- `/home/user/cjs2026/functions/index.js` (getEventbriteSyncStatus, lines 1900-1935)
- `/home/user/cjs2026/src/pages/Admin.jsx` (UI needs to be built - currently missing)

---

### US-EVENTBRITE-09: User Sees "Registered" Status After Ticket Purchase

**As a** user who just purchased a ticket
**I want to** see my registration status update to "Registered" in my Dashboard
**So that** I know the system recognized my ticket purchase

**Acceptance Criteria:**
- [ ] Given I purchased a ticket on Eventbrite using email matching my CJS2026 account
- [ ] When the Eventbrite webhook processes successfully
- [ ] Then my Dashboard shows:
  - Registration status badge: "Registered" (green/success color)
  - Eventbrite ticket info: "Ticket Type: General, Purchased: Jan 5, 2026"
- [ ] And I see a message: "You can now bookmark sessions and build your personal schedule!"
- [ ] And the Save/Bookmark buttons on Schedule page are now enabled
- [ ] And if I was previously viewing the schedule, a toast notification appears: "Your ticket has been linked! You can now bookmark sessions."

**Edge Cases:**
- Status updates while user is on different page (real-time update via Firestore listener)
- User manually refreshes page (shows updated status)
- User hasn't completed profile wizard yet (status updates but wizard prompts remain)

**Files:**
- `/home/user/cjs2026/src/pages/Dashboard.jsx` (displays registration status)
- `/home/user/cjs2026/src/contexts/AuthContext.jsx` (userProfile.registrationStatus)
- `/home/user/cjs2026/src/components/SessionCard.jsx` (bookmark button enabled/disabled based on canBookmarkSessions)

---

### US-EVENTBRITE-10: User Unlocks Bookmarking After Ticket Matched

**As a** user with pending registration status
**I want to** automatically gain the ability to bookmark sessions once my ticket is matched
**So that** I can start planning my summit schedule immediately

**Acceptance Criteria:**
- [ ] Given a user with `registrationStatus: 'pending'` is viewing the schedule
- [ ] When they try to bookmark a session
- [ ] Then they see a message: "Please purchase a ticket to bookmark sessions"
- [ ] And the bookmark buttons are disabled with a lock icon
- [ ] When their Eventbrite ticket is matched (via webhook or signup auto-match)
- [ ] And their `registrationStatus` changes to 'registered'
- [ ] Then the `canBookmarkSessions()` function returns `true`
- [ ] And all bookmark buttons become enabled
- [ ] And they can click to save/unsave sessions to their personal schedule
- [ ] And bookmark counts increment/decrement in Firestore

**Edge Cases:**
- Admin users can bookmark regardless of registration status
- Super admins can bookmark regardless of registration status
- Bootstrap admin emails (hardcoded) can bookmark regardless of status
- User with status 'confirmed' (checked in) can bookmark
- User with status 'approved' (manually approved by admin) can bookmark

**Files:**
- `/home/user/cjs2026/src/contexts/AuthContext.jsx` (canBookmarkSessions, lines 1026-1073)
- `/home/user/cjs2026/src/components/SessionCard.jsx` (bookmark button logic)
- `/home/user/cjs2026/src/pages/Schedule.jsx` (schedule page with bookmarking)

---

### US-EVENTBRITE-11: Unmatched Ticket List Visible to Admins

**As an** admin
**I want to** view a list of all unmatched Eventbrite tickets
**So that** I can proactively reach out to people who purchased tickets but haven't created accounts

**Acceptance Criteria:**
- [ ] Given I am logged in as admin
- [ ] When I navigate to Admin Panel → Attendees tab
- [ ] Then I see a separate section: "Unmatched Tickets (25)"
- [ ] And I see a table with columns:
  - Email
  - Name
  - Ticket Type
  - Purchased Date
  - Order ID
  - Attendee ID
  - Actions
- [ ] And each row shows an unmatched ticket where `matched: false`
- [ ] And I can click "Send Reminder Email" to email the person (future feature)
- [ ] And I can click "Manually Match" to link the ticket to an existing user (future feature)
- [ ] And refunded tickets are visually distinct (grayed out, strikethrough) with "Refunded" badge

**Edge Cases:**
- No unmatched tickets (show empty state: "All tickets matched!")
- Email privacy (only admins can see emails)
- Sorting by purchase date (most recent first)
- Filtering by ticket type
- Exporting unmatched list to CSV

**Files:**
- `/home/user/cjs2026/src/pages/Admin.jsx` (UI needs to be built)
- `/home/user/cjs2026/functions/index.js` (getEventbriteSyncStatus returns unmatched data)
- `/home/user/cjs2026/firestore.rules` (eventbrite_unmatched collection - needs rules)

---

### US-EVENTBRITE-12: Rate Limiting on Batch Sync Operations

**As a** system administrator
**I want** rate limiting on Eventbrite API calls during batch syncs
**So that** we don't hit API rate limits and cause sync failures

**Acceptance Criteria:**
- [ ] Given the `syncEventbriteAttendees()` function is processing 500 attendees
- [ ] When fetching attendees from Eventbrite API
- [ ] Then pagination is used to fetch attendees in batches (Eventbrite default: 50 per page)
- [ ] And between each API call, a delay is introduced (e.g., 100ms) to stay under rate limits
- [ ] And if a 429 (Rate Limited) response is received:
  - Parse `Retry-After` header
  - Wait for specified duration
  - Retry the request (up to 3 attempts)
- [ ] And if rate limit persists after retries:
  - Log error to `system_errors` collection
  - Return partial results with error indication
- [ ] And the function completes within 10 minutes for events with up to 1000 attendees

**Edge Cases:**
- Eventbrite API downtime (return error, retry later)
- Network timeout (catch error, log, return partial results)
- Missing API credentials (fail fast with clear error)
- Concurrent sync requests (use Firestore transaction to prevent duplicate syncs)
- Webhook processing during manual sync (both are idempotent, safe to run concurrently)

**Files:**
- `/home/user/cjs2026/functions/index.js` (syncEventbriteAttendees, lines 1645-1803 - rate limiting logic needs to be added)

---

## Implementation Checklist

### Backend (Functions)
- [x] Webhook endpoint with HMAC-SHA256 verification
- [x] Auto-match ticket to existing user (order.placed)
- [x] Store unmatched tickets (order.placed, no user)
- [x] Handle refunds (order.refunded)
- [x] Handle check-in/check-out (attendee.checked_in/out)
- [x] Auto-match on signup (checkEventbriteTicket)
- [x] Manual batch sync (syncEventbriteAttendees)
- [x] Get sync status (getEventbriteSyncStatus)
- [ ] Rate limiting on batch sync (US-EVENTBRITE-12)
- [ ] Webhook retry logic for failed matches

### Frontend (Admin Panel)
- [x] Display registration status in attendees table
- [x] Display Eventbrite attendee ID (last 8 chars)
- [ ] Eventbrite sync status dashboard (US-EVENTBRITE-08)
- [ ] Manual sync trigger button (US-EVENTBRITE-08)
- [ ] Unmatched tickets table (US-EVENTBRITE-11)
- [ ] Manual ticket matching UI (US-EVENTBRITE-11)

### Frontend (User-Facing)
- [x] Registration status badge in Dashboard (US-EVENTBRITE-09)
- [x] Bookmark permission check (canBookmarkSessions)
- [ ] Ticket purchase info in Dashboard (US-EVENTBRITE-09)
- [ ] Real-time status update notification (US-EVENTBRITE-09)
- [ ] Pending user messaging (US-EVENTBRITE-10)

### Security & Infrastructure
- [x] HMAC-SHA256 signature verification (US-EVENTBRITE-07)
- [x] Admin-only function protection
- [ ] Firestore rules for eventbrite_synced collection
- [ ] Firestore rules for eventbrite_unmatched collection
- [ ] EVENTBRITE_WEBHOOK_KEY secret configuration
- [ ] EVENTBRITE_TOKEN secret configuration
- [ ] Webhook endpoint monitoring/alerting

### Testing & Documentation
- [ ] Unit tests for signature verification
- [ ] Integration tests for webhook handling
- [ ] Test refund scenarios
- [ ] Test unmatched ticket matching on signup
- [ ] Document Eventbrite webhook setup
- [ ] Document manual sync procedures
- [ ] Admin training materials

---

## Technical Notes

### Firestore Collections

**eventbrite_synced**
```javascript
{
  [attendeeId]: {
    email: string,
    userId: string,
    syncedAt: ISO timestamp
  }
}
```

**eventbrite_unmatched**
```javascript
{
  [attendeeId]: {
    email: string,
    name: string,
    orderId: string,
    attendeeId: string,
    ticketType: string,
    purchasedAt: ISO timestamp,
    matched: boolean,
    matchedUserId?: string,
    matchedAt?: ISO timestamp,
    refunded?: boolean,
    refundedAt?: ISO timestamp
  }
}
```

### User Profile Fields (Updated by Integration)
```javascript
{
  registrationStatus: 'pending' | 'registered' | 'confirmed',
  eventbriteAttendeeId: string | null,
  eventbriteOrderId: string | null,
  ticketType: string | null,
  ticketPurchasedAt: ISO timestamp | null,
  checkedIn: boolean,
  checkedInAt: ISO timestamp | null,
  checkedOut: boolean,
  checkedOutAt: ISO timestamp | null
}
```

### Webhook Actions Handled
- `order.placed` → Match ticket to user or store as unmatched
- `order.updated` → Same as order.placed (ticket changes)
- `order.refunded` → Reset registration status, mark as refunded
- `attendee.checked_in` → Set registrationStatus to 'confirmed'
- `attendee.checked_out` → Set checkedOut flag

### API Endpoints
- `eventbriteWebhook` (POST, public with signature verification)
- `checkEventbriteTicket` (POST, authenticated user)
- `syncEventbriteAttendees` (POST, admin-only)
- `getEventbriteSyncStatus` (GET, admin-only)

---

## Priority Ranking

**P0 (Critical - Already Implemented):**
- US-EVENTBRITE-01: Auto-update existing user
- US-EVENTBRITE-02: Store unmatched tickets
- US-EVENTBRITE-03: Auto-match on signup
- US-EVENTBRITE-07: Signature verification

**P1 (High - Implemented, needs UI):**
- US-EVENTBRITE-04: Manual sync (needs admin UI)
- US-EVENTBRITE-08: Sync status dashboard
- US-EVENTBRITE-09: User sees status
- US-EVENTBRITE-10: Unlock bookmarking

**P2 (Medium):**
- US-EVENTBRITE-05: Handle refunds
- US-EVENTBRITE-06: Check-in tracking
- US-EVENTBRITE-11: Unmatched ticket list

**P3 (Low - Nice to have):**
- US-EVENTBRITE-12: Rate limiting improvements

---

## Future Enhancements
- Email reminders to unmatched ticket holders
- Manual ticket matching UI (admin assigns ticket to user)
- Ticket transfer handling (person A buys, person B creates account)
- Integration with registration status badges in public profiles
- Analytics: Conversion rate (ticket purchase → account creation)
- Webhook retry queue for failed processing
- Eventbrite check-in tracking for session attendance
