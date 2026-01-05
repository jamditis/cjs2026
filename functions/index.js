const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const crypto = require("crypto");
const Busboy = require("busboy");

// CORS configuration - restrict to known origins in production
const ALLOWED_ORIGINS = [
  "https://summit.collaborativejournalism.org",
  "https://cjs2026.web.app",
  "https://cjs2026.firebaseapp.com",
  // Allow localhost for development
  /^http:\/\/localhost:\d+$/
];

const cors = require("cors")({
  origin: function (origin, callback) {
    // In production, require origin header for security
    // Server-to-server requests should use Cloud Function internal auth, not CORS
    if (!origin) {
      // Allow only in development (functions emulator sets no origin)
      if (process.env.FUNCTIONS_EMULATOR === 'true') {
        return callback(null, true);
      }
      console.warn('CORS blocked: missing origin header');
      return callback(new Error("Origin header required"));
    }

    // Check against allowed origins
    const isAllowed = ALLOWED_ORIGINS.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  }
});

admin.initializeApp();
const db = admin.firestore();

// Airtable config
const AIRTABLE_BASE_ID = "appL8Sn87xUotm4jF";
const AIRTABLE_TABLE_NAME = "Email signups";
const AIRTABLE_SITE_CONTENT_TABLE = "tblTZ0F89UMTO8PO0";
const AIRTABLE_SCHEDULE_TABLE = "Schedule";

// Define the secrets (will be accessed at runtime)
const airtableApiKey = defineSecret("AIRTABLE_API_KEY");
const eventbriteToken = defineSecret("EVENTBRITE_TOKEN");
const eventbriteWebhookKey = defineSecret("EVENTBRITE_WEBHOOK_KEY");

// Eventbrite config
const EVENTBRITE_EVENT_ID = "1977919688031";

// Cache for site content (in-memory, refreshes on function cold start)
let contentCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate email address format
 * Uses a practical regex that catches most invalid emails without being overly strict
 * @param {string} email - Email to validate
 * @returns {boolean} True if email appears valid
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;

  // Trim whitespace and check length
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length < 5 || trimmed.length > 254) return false;

  // RFC 5322 practical email regex
  // Matches: local-part@domain where domain has at least one dot
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  return emailRegex.test(trimmed);
}

// ============================================
// Security & Auth Helpers
// ============================================

/**
 * Verify Firebase Auth token and return user
 * @param {string} authHeader - Authorization header from request
 * @returns {Promise<{uid: string, email: string}>} Verified user
 */
async function verifyAuthToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);

  return {
    uid: decodedToken.uid,
    email: decodedToken.email
  };
}

// Admin emails - fallback for users who should have admin access
// This must match the ADMIN_EMAILS in Dashboard.jsx
const ADMIN_EMAILS = [
  "jamditis@gmail.com",
  "murrayst@montclair.edu",
  "etiennec@montclair.edu",
];

/**
 * Check if user has admin role in Firestore OR is in ADMIN_EMAILS list
 * @param {string} uid - User ID
 * @param {string} email - User email (optional, for email-based fallback)
 * @returns {Promise<boolean>} True if user is admin or super_admin
 */
async function isAdmin(uid, email = null) {
  // First check email-based admin list (fast, no DB read needed)
  if (email && ADMIN_EMAILS.includes(email)) {
    return true;
  }

  // Then check Firestore role field
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) return false;

  const userData = userDoc.data();

  // Check role field
  if (userData.role === 'admin' || userData.role === 'super_admin') {
    return true;
  }

  // Check email from Firestore if not provided
  if (!email && userData.email && ADMIN_EMAILS.includes(userData.email)) {
    return true;
  }

  return false;
}

/**
 * Check if user has super_admin role
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} True if user is super_admin
 */
async function isSuperAdmin(uid) {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) return false;

  return userDoc.data().role === 'super_admin';
}

/**
 * Verify user is admin (throws if not)
 * @param {object} req - Request object
 * @returns {Promise<{uid: string, email: string}>} Verified admin user
 */
async function requireAdmin(req) {
  const user = await verifyAuthToken(req.headers.authorization);
  const adminStatus = await isAdmin(user.uid, user.email);

  if (!adminStatus) {
    throw new Error('Unauthorized: Admin access required');
  }

  return user;
}

/**
 * Verify user is super admin (throws if not)
 */
async function requireSuperAdmin(req) {
  const user = await verifyAuthToken(req.headers.authorization);
  const superAdminStatus = await isSuperAdmin(user.uid);

  if (!superAdminStatus) {
    throw new Error('Unauthorized: Super admin access required');
  }

  return user;
}

// ============================================
// Logging Helpers
// ============================================

/**
 * Log user activity
 */
async function logActivity(type, userId, details = {}) {
  try {
    await db.collection('activity_logs').add({
      type,
      userId,
      details,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

/**
 * Log system error
 */
async function logError(source, error, context = {}) {
  try {
    await db.collection('system_errors').add({
      source,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      context,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString(),
      resolved: false
    });
  } catch (err) {
    console.error('Failed to log error:', err);
  }
}

/**
 * Log admin action for audit trail
 */
async function logAdminAction(adminUid, action, targetUid = null, details = {}) {
  try {
    await db.collection('admin_logs').add({
      adminUid,
      action,
      targetUid,
      details,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
}

/**
 * Log background job execution
 */
async function logBackgroundJob(jobType, status, details = {}) {
  try {
    await db.collection('background_jobs').add({
      jobType,
      status, // 'started', 'completed', 'failed'
      details,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log background job:', err);
  }
}

/**
 * Save email signup to both Firestore and Airtable
 */
exports.saveEmailSignup = onRequest({ cors: true, secrets: [airtableApiKey] }, async (req, res) => {
  // Handle CORS
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const { email, source = "CJS 2026 Website" } = req.body;

    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Please enter a valid email address" });
      return;
    }

    const timestamp = new Date().toISOString();

    try {
      // Save to Firestore
      await db.collection("email_signups").add({
        email,
        source,
        signedUp: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: timestamp
      });

      // Save to Airtable
      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${airtableApiKey.value()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            records: [{
              fields: {
                "Email": email,
                "Source": source,
                "Signed up": timestamp
              }
            }]
          })
        }
      );

      if (!airtableResponse.ok) {
        console.error("Airtable save failed:", await airtableResponse.text());
        // Don't fail the request - Firestore save succeeded
      }

      res.status(200).json({ success: true, message: "Email saved successfully" });
    } catch (error) {
      console.error("Error saving email:", error);
      res.status(500).json({ error: "Failed to save email" });
    }
  });
});

/**
 * Health check endpoint
 */
exports.health = onRequest((req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * Trigger CMS sync via GitHub Actions (admin only)
 * This triggers a repository_dispatch event to run the deploy workflow
 */
exports.triggerCMSSync = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const caller = await verifyAuthToken(req.headers.authorization);
      const isAdminUser = await isAdmin(caller.uid, caller.email);

      if (!isAdminUser) {
        res.status(403).json({ error: 'Unauthorized: Admin access required' });
        return;
      }

      // Note: To actually trigger GitHub Actions, you would need:
      // 1. A GitHub Personal Access Token stored as a secret
      // 2. A repository_dispatch endpoint in the workflow
      //
      // For now, this just logs the request and returns success
      // The actual sync happens via Airtable's "Update website" button
      // which triggers the GitHub webhook directly

      console.log(`CMS sync triggered by ${caller.email} at ${new Date().toISOString()}`);

      // Log the sync request to Firestore (will be picked up by the admin panel)
      await db.collection('cms_sync_logs').add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        triggeredBy: caller.email,
        status: 'initiated',
        message: 'Manual sync requested from admin panel. Use Airtable "Update website" button to trigger actual deploy.'
      });

      res.status(200).json({
        success: true,
        message: 'Sync request logged. For full deploy, use the "Update website" button in Airtable.',
        note: 'GitHub Actions will run automatically when triggered from Airtable.'
      });
    } catch (error) {
      console.error('Error triggering CMS sync:', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to trigger sync' });
    }
  });
});

/**
 * Save edit request to Firestore
 * For internal use - allows team to request copy edits via web form
 */
exports.saveEditRequest = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const {
      name,
      section,
      priority,
      currentText,
      requestedChange,
      additionalNotes,
      submittedAt
    } = req.body;

    if (!name || !section || !requestedChange) {
      res.status(400).json({ error: "Name, section, and requested change are required" });
      return;
    }

    try {
      const docRef = await db.collection("edit_requests").add({
        name,
        section,
        priority: priority || "medium",
        currentText: currentText || "",
        requestedChange,
        additionalNotes: additionalNotes || "",
        submittedAt: submittedAt || new Date().toISOString(),
        status: "pending", // pending, in_progress, completed, rejected
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        success: true,
        message: "Edit request saved successfully",
        requestId: docRef.id
      });
    } catch (error) {
      console.error("Error saving edit request:", error);
      res.status(500).json({ error: "Failed to save edit request" });
    }
  });
});

/**
 * Get all pending edit requests (admin only)
 */
exports.getEditRequests = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      // Require admin authentication
      await requireAdmin(req);

      const snapshot = await db.collection("edit_requests")
        .orderBy("createdAt", "desc")
        .get();

      const requests = [];
      snapshot.forEach(doc => {
        requests.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json({ success: true, requests });
    } catch (error) {
      console.error("Error fetching edit requests:", error);
      if (error.message.includes('Unauthorized')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to fetch edit requests" });
      }
    }
  });
});

/**
 * Fetch all site content from Airtable
 * Returns content organized by section and field for easy access
 * Caches results for 5 minutes to reduce API calls
 */
exports.getSiteContent = onRequest({ cors: true, secrets: [airtableApiKey] }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // Check cache
    const now = Date.now();
    if (contentCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
      res.set("X-Cache", "HIT");
      res.status(200).json({ success: true, content: contentCache, cached: true });
      return;
    }

    try {
      // Fetch all records from Site Content table
      // Using pagination in case there are more than 100 records
      let allRecords = [];
      let offset = null;

      do {
        const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_SITE_CONTENT_TABLE}`);
        url.searchParams.append("pageSize", "100");
        if (offset) {
          url.searchParams.append("offset", offset);
        }

        const response = await fetch(url.toString(), {
          headers: {
            "Authorization": `Bearer ${airtableApiKey.value()}`
          }
        });

        if (!response.ok) {
          throw new Error(`Airtable API error: ${response.status}`);
        }

        const data = await response.json();
        allRecords = allRecords.concat(data.records);
        offset = data.offset;
      } while (offset);

      // Transform records into a more usable format
      // Organized by section, then by field name
      const content = {};
      const byPage = {};
      const timeline = [];
      const stats = [];

      for (const record of allRecords) {
        const fields = record.fields;
        const section = fields.Section || "unknown";
        const fieldName = fields.Field || "";
        const value = fields.Content || "";
        const page = fields.Page || "Home";
        const color = fields.Color || "ink";
        const order = fields.Order || 0;
        const visible = fields.Visible !== false; // Default to true
        const component = fields.Component || "";
        const link = fields.Link || "";

        // Skip invisible items
        if (!visible) continue;

        // Initialize section if needed
        if (!content[section]) {
          content[section] = {};
        }

        // Store the content with metadata
        content[section][fieldName] = {
          value,
          color,
          order,
          component,
          link,
          page
        };

        // Also organize by page for easier page-specific queries
        if (!byPage[page]) {
          byPage[page] = {};
        }
        if (!byPage[page][section]) {
          byPage[page][section] = {};
        }
        byPage[page][section][fieldName] = {
          value,
          color,
          order,
          component,
          link
        };

        // Build timeline array for easier rendering
        if (section === "timeline" && fieldName.endsWith("_year")) {
          const year = fieldName.replace("_year", "");
          timeline.push({
            year: value,
            location: content.timeline?.[`${year}_location`]?.value || "",
            theme: content.timeline?.[`${year}_theme`]?.value || "",
            link: content.timeline?.[`${year}_link`]?.value || "",
            color,
            order
          });
        }

        // Build stats array
        if (section === "stats" && fieldName.endsWith("_value")) {
          const stat = fieldName.replace("_value", "");
          stats.push({
            id: stat,
            value,
            label: "",  // Will be filled in second pass
            color,
            order
          });
        }
      }

      // Second pass for timeline and stats to get all related fields
      // Update timeline with full data
      for (const item of timeline) {
        const year = item.year;
        item.location = content.timeline?.[`${year}_location`]?.value || "";
        item.theme = content.timeline?.[`${year}_theme`]?.value || "";
        item.link = content.timeline?.[`${year}_link`]?.value || "";
      }

      // Update stats with labels
      for (const stat of stats) {
        stat.label = content.stats?.[`${stat.id}_label`]?.value || stat.id;
      }

      // Sort timeline and stats by order
      timeline.sort((a, b) => a.order - b.order);
      stats.sort((a, b) => a.order - b.order);

      // Build final response
      const result = {
        sections: content,
        byPage,
        timeline,
        stats,
        lastUpdated: new Date().toISOString()
      };

      // Update cache
      contentCache = result;
      cacheTimestamp = now;

      res.set("X-Cache", "MISS");
      res.status(200).json({ success: true, content: result, cached: false });

    } catch (error) {
      console.error("Error fetching site content:", error);
      res.status(500).json({ error: "Failed to fetch site content", details: error.message });
    }
  });
});

/**
 * Invalidate the content cache (for manual refresh)
 */
exports.invalidateCache = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    contentCache = null;
    cacheTimestamp = null;

    res.status(200).json({ success: true, message: "Cache invalidated" });
  });
});

// ============================================
// Attendee Profile Management
// ============================================

const AIRTABLE_ATTENDEES_TABLE = "Attendees";

/**
 * Sync a single user profile to Airtable
 * Called when a user updates their profile
 */
exports.syncProfileToAirtable = onRequest({ cors: true, secrets: [airtableApiKey] }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const { uid } = req.body;

    if (!uid) {
      res.status(400).json({ error: "User ID required" });
      return;
    }

    try {
      // Get user profile from Firestore
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const profile = userDoc.data();

      // Check if record already exists in Airtable (by uid)
      const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_ATTENDEES_TABLE)}?filterByFormula={uid}="${uid}"`;
      const searchResponse = await fetch(searchUrl, {
        headers: {
          "Authorization": `Bearer ${airtableApiKey.value()}`
        }
      });

      if (!searchResponse.ok) {
        throw new Error(`Airtable search failed: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const existingRecord = searchData.records?.[0];

      // Prepare fields for Airtable
      const airtableFields = {
        "uid": uid,
        "Email": profile.email || "",
        "Name": profile.displayName || "",
        "Organization": profile.organization || "",
        "Role": profile.role || "",
        "Photo URL": profile.photoURL || "",
        "Website": profile.website ? `https://${profile.website}` : "",
        "Instagram": profile.instagram || "",
        "LinkedIn": profile.linkedin || "",
        "Bluesky": profile.bluesky || "",
        "Badges": JSON.stringify(profile.badges || []),
        "Attended Summits": JSON.stringify(profile.attendedSummits || []),
        "Custom Badges": JSON.stringify(profile.customBadges || {}),
        "Registration Status": profile.registrationStatus || "pending",
        "Notify When Tickets Available": profile.notifyWhenTicketsAvailable || false,
        "Updated At": new Date().toISOString(),
      };

      let airtableResponse;

      if (existingRecord) {
        // Update existing record
        airtableResponse = await fetch(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_ATTENDEES_TABLE)}/${existingRecord.id}`,
          {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${airtableApiKey.value()}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ fields: airtableFields })
          }
        );
      } else {
        // Create new record
        airtableFields["Created At"] = new Date().toISOString();
        airtableResponse = await fetch(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_ATTENDEES_TABLE)}`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${airtableApiKey.value()}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ records: [{ fields: airtableFields }] })
          }
        );
      }

      if (!airtableResponse.ok) {
        const errorText = await airtableResponse.text();
        console.error("Airtable sync failed:", errorText);
        throw new Error(`Airtable sync failed: ${airtableResponse.status}`);
      }

      res.status(200).json({ success: true, message: "Profile synced to Airtable" });
    } catch (error) {
      console.error("Error syncing profile:", error);
      res.status(500).json({ error: "Failed to sync profile", details: error.message });
    }
  });
});

/**
 * Export all user profiles (admin only)
 * Returns all profiles with badge data for networking purposes
 */
exports.exportAttendees = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const admin = await requireAdmin(req);
      await logAdminAction(admin.uid, 'export_attendees');

      const snapshot = await db.collection("users").get();
      const attendees = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        attendees.push({
          uid: doc.id,
          email: data.email || "",
          displayName: data.displayName || "",
          organization: data.organization || "",
          role: data.role || "",
          photoURL: data.photoURL || "",
          website: data.website || "",
          instagram: data.instagram || "",
          linkedin: data.linkedin || "",
          bluesky: data.bluesky || "",
          badges: data.badges || [],
          attendedSummits: data.attendedSummits || [],
          customBadges: data.customBadges || {},
          registrationStatus: data.registrationStatus || "pending",
          notifyWhenTicketsAvailable: data.notifyWhenTicketsAvailable || false,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        });
      });

      // Sort by name
      attendees.sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));

      res.status(200).json({
        success: true,
        count: attendees.length,
        attendees,
        exportedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error exporting attendees:", error);
      await logError('exportAttendees', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || "Failed to export attendees" });
    }
  });
});

/**
 * Sync ALL user profiles to Airtable (admin batch operation)
 * Use sparingly - for initial sync or recovery
 */
exports.syncAllProfilesToAirtable = onRequest({ cors: true, secrets: [airtableApiKey] }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const adminUser = await requireAdmin(req);
      await logAdminAction(adminUser.uid, 'sync_all_profiles_to_airtable');
      await logBackgroundJob('airtable_sync_all', 'started', { initiatedBy: adminUser.uid });

      const snapshot = await db.collection("users").get();
      let synced = 0;
      let errors = 0;

      for (const doc of snapshot.docs) {
        const profile = doc.data();
        const uid = doc.id;

        try {
          // Check if record exists
          const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_ATTENDEES_TABLE)}?filterByFormula={uid}="${uid}"`;
          const searchResponse = await fetch(searchUrl, {
            headers: { "Authorization": `Bearer ${airtableApiKey.value()}` }
          });
          const searchData = await searchResponse.json();
          const existingRecord = searchData.records?.[0];

          const airtableFields = {
            "uid": uid,
            "Email": profile.email || "",
            "Name": profile.displayName || "",
            "Organization": profile.organization || "",
            "Role": profile.role || "",
            "Photo URL": profile.photoURL || "",
            "Website": profile.website ? `https://${profile.website}` : "",
            "Instagram": profile.instagram || "",
            "LinkedIn": profile.linkedin || "",
            "Bluesky": profile.bluesky || "",
            "Badges": JSON.stringify(profile.badges || []),
            "Attended Summits": JSON.stringify(profile.attendedSummits || []),
            "Custom Badges": JSON.stringify(profile.customBadges || {}),
            "Registration Status": profile.registrationStatus || "pending",
            "Notify When Tickets Available": profile.notifyWhenTicketsAvailable || false,
            "Updated At": new Date().toISOString(),
          };

          if (existingRecord) {
            await fetch(
              `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_ATTENDEES_TABLE)}/${existingRecord.id}`,
              {
                method: "PATCH",
                headers: {
                  "Authorization": `Bearer ${airtableApiKey.value()}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ fields: airtableFields })
              }
            );
          } else {
            airtableFields["Created At"] = new Date().toISOString();
            await fetch(
              `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_ATTENDEES_TABLE)}`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${airtableApiKey.value()}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ records: [{ fields: airtableFields }] })
              }
            );
          }

          synced++;
          // Rate limit: Airtable allows 5 requests/second
          await new Promise(resolve => setTimeout(resolve, 250));
        } catch (err) {
          console.error(`Error syncing ${uid}:`, err);
          errors++;
        }
      }

      await logBackgroundJob('airtable_sync_all', 'completed', { synced, errors });

      res.status(200).json({
        success: true,
        message: `Synced ${synced} profiles, ${errors} errors`,
        synced,
        errors
      });
    } catch (error) {
      console.error("Error in batch sync:", error);
      await logError('syncAllProfilesToAirtable', error);
      await logBackgroundJob('airtable_sync_all', 'failed', { error: error.message });
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || "Batch sync failed" });
    }
  });
});

// ============================================
// Admin Panel Endpoints
// ============================================

/**
 * Get system statistics for admin dashboard
 */
exports.getSystemStats = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      await requireAdmin(req);

      // Get various stats
      const now = new Date();
      const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

      // Total users
      const usersSnapshot = await db.collection('users').get();
      const totalUsers = usersSnapshot.size;

      // Registration status breakdown
      let pending = 0, registered = 0, confirmed = 0;
      let profileComplete = 0;
      let ticketsPurchased = 0;
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        const status = data.registrationStatus || 'pending';
        if (status === 'pending') pending++;
        else if (status === 'registered') registered++;
        else if (status === 'confirmed') confirmed++;

        // Profile completion check (has required fields)
        if (data.displayName && data.organization && data.role && data.badges?.length > 0) {
          profileComplete++;
        }

        if (data.ticketsPurchased) {
          ticketsPurchased++;
        }
      });

      // Recent signups (24h, 7d, 30d)
      const signups24h = usersSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt?.toDate?.();
        return createdAt && createdAt > oneDayAgo;
      }).length;

      const signups7d = usersSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt?.toDate?.();
        return createdAt && createdAt > sevenDaysAgo;
      }).length;

      const signups30d = usersSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt?.toDate?.();
        return createdAt && createdAt > thirtyDaysAgo;
      }).length;

      // Email signups
      const emailSignupsSnapshot = await db.collection('email_signups').get();
      const totalEmailSignups = emailSignupsSnapshot.size;

      // Recent errors (24h)
      const errorsSnapshot = await db.collection('system_errors')
        .where('createdAt', '>', oneDayAgo.toISOString())
        .get();
      const recentErrors = errorsSnapshot.size;

      // Recent activity (24h)
      const activitySnapshot = await db.collection('activity_logs')
        .where('createdAt', '>', oneDayAgo.toISOString())
        .get();
      const recentActivity = activitySnapshot.size;

      // Background jobs (last 10)
      const jobsSnapshot = await db.collection('background_jobs')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      const recentJobs = [];
      jobsSnapshot.forEach(doc => {
        recentJobs.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json({
        success: true,
        stats: {
          users: {
            total: totalUsers,
            pending,
            registered,
            confirmed,
            profileComplete,
            ticketsPurchased,
            profileCompletionRate: totalUsers > 0 ? Math.round((profileComplete / totalUsers) * 100) : 0
          },
          signups: {
            last24h: signups24h,
            last7d: signups7d,
            last30d: signups30d
          },
          emailSignups: totalEmailSignups,
          activity: {
            recentErrors,
            recentActivity
          },
          recentJobs
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting system stats:', error);
      await logError('getSystemStats', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to get system stats' });
    }
  });
});

/**
 * Get recent activity logs
 */
exports.getActivityLogs = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      await requireAdmin(req);

      const limit = parseInt(req.query.limit) || 50;
      const type = req.query.type || null;

      let query = db.collection('activity_logs')
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (type) {
        query = query.where('type', '==', type);
      }

      const snapshot = await query.get();
      const logs = [];

      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json({
        success: true,
        logs,
        count: logs.length
      });
    } catch (error) {
      console.error('Error getting activity logs:', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to get activity logs' });
    }
  });
});

/**
 * Get recent system errors
 */
exports.getSystemErrors = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      await requireAdmin(req);

      const limit = parseInt(req.query.limit) || 50;
      // Only filter by resolved if explicitly specified in query
      const filterByResolved = req.query.resolved !== undefined;
      const resolvedValue = req.query.resolved === 'true';

      let query = db.collection('system_errors');

      // Apply resolved filter first (must come before orderBy for composite index)
      if (filterByResolved) {
        query = query.where('resolved', '==', resolvedValue);
      }

      query = query.orderBy('createdAt', 'desc').limit(limit);

      const snapshot = await query.get();
      const errors = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        errors.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamps to ISO strings for JSON
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          resolvedAt: data.resolvedAt?.toDate?.()?.toISOString() || data.resolvedAt
        });
      });

      res.status(200).json({
        success: true,
        errors,
        count: errors.length
      });
    } catch (error) {
      console.error('Error getting system errors:', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to get system errors' });
    }
  });
});

/**
 * Mark error as resolved
 */
exports.resolveError = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const admin = await requireAdmin(req);
      const { errorId } = req.body;

      if (!errorId) {
        res.status(400).json({ error: 'Error ID required' });
        return;
      }

      await db.collection('system_errors').doc(errorId).update({
        resolved: true,
        resolvedBy: admin.uid,
        resolvedAt: new Date().toISOString()
      });

      await logAdminAction(admin.uid, 'resolve_error', null, { errorId });

      res.status(200).json({ success: true, message: 'Error marked as resolved' });
    } catch (error) {
      console.error('Error resolving error:', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to resolve error' });
    }
  });
});

/**
 * Get background jobs
 */
exports.getBackgroundJobs = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      await requireAdmin(req);

      const limit = parseInt(req.query.limit) || 50;
      const jobType = req.query.jobType || null;

      let query = db.collection('background_jobs')
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (jobType) {
        query = query.where('jobType', '==', jobType);
      }

      const snapshot = await query.get();
      const jobs = [];

      snapshot.forEach(doc => {
        jobs.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json({
        success: true,
        jobs,
        count: jobs.length
      });
    } catch (error) {
      console.error('Error getting background jobs:', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to get background jobs' });
    }
  });
});

/**
 * Get admin audit logs
 */
exports.getAdminLogs = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      await requireAdmin(req);

      const limit = parseInt(req.query.limit) || 100;

      const snapshot = await db.collection('admin_logs')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const logs = [];

      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json({
        success: true,
        logs,
        count: logs.length
      });
    } catch (error) {
      console.error('Error getting admin logs:', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to get admin logs' });
    }
  });
});

/**
 * Grant admin role to user (super admin only)
 */
exports.grantAdminRole = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const superAdmin = await requireSuperAdmin(req);
      const { targetEmail, role } = req.body;

      if (!targetEmail || !role) {
        res.status(400).json({ error: 'Target email and role required' });
        return;
      }

      if (role !== 'admin' && role !== 'super_admin') {
        res.status(400).json({ error: 'Invalid role. Must be "admin" or "super_admin"' });
        return;
      }

      // Find user by email
      const usersSnapshot = await db.collection('users')
        .where('email', '==', targetEmail)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        res.status(404).json({ error: 'User not found with that email' });
        return;
      }

      const targetUserDoc = usersSnapshot.docs[0];
      const targetUid = targetUserDoc.id;

      // Update user role
      await db.collection('users').doc(targetUid).update({
        role,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Log admin action
      await logAdminAction(superAdmin.uid, 'grant_admin_role', targetUid, { role, targetEmail });

      res.status(200).json({
        success: true,
        message: `Granted ${role} role to ${targetEmail}`,
        targetUid
      });
    } catch (error) {
      console.error('Error granting admin role:', error);
      await logError('grantAdminRole', error, { targetEmail: req.body.targetEmail });
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to grant admin role' });
    }
  });
});

/**
 * Revoke admin role from user (super admin only)
 */
exports.revokeAdminRole = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const superAdmin = await requireSuperAdmin(req);
      const { targetEmail } = req.body;

      if (!targetEmail) {
        res.status(400).json({ error: 'Target email required' });
        return;
      }

      // Prevent revoking own admin access
      if (targetEmail === superAdmin.email) {
        res.status(400).json({ error: 'Cannot revoke your own admin access' });
        return;
      }

      // Find user by email
      const usersSnapshot = await db.collection('users')
        .where('email', '==', targetEmail)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        res.status(404).json({ error: 'User not found with that email' });
        return;
      }

      const targetUserDoc = usersSnapshot.docs[0];
      const targetUid = targetUserDoc.id;

      // Update user role to regular user
      await db.collection('users').doc(targetUid).update({
        role: admin.firestore.FieldValue.delete(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Log admin action
      await logAdminAction(superAdmin.uid, 'revoke_admin_role', targetUid, { targetEmail });

      res.status(200).json({
        success: true,
        message: `Revoked admin role from ${targetEmail}`,
        targetUid
      });
    } catch (error) {
      console.error('Error revoking admin role:', error);
      await logError('revokeAdminRole', error, { targetEmail: req.body.targetEmail });
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to revoke admin role' });
    }
  });
});

/**
 * Get list of all admin users
 */
exports.getAdminUsers = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const caller = await verifyAuthToken(req.headers.authorization);
      const isAdminUser = await isAdmin(caller.uid, caller.email);

      if (!isAdminUser) {
        res.status(403).json({ error: 'Unauthorized: Admin access required' });
        return;
      }

      // Query users with admin or super_admin role
      const adminSnapshot = await db.collection('users')
        .where('role', 'in', ['admin', 'super_admin'])
        .get();

      const admins = [];

      // Add users with role field
      adminSnapshot.forEach((doc) => {
        const data = doc.data();
        admins.push({
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          role: data.role
        });
      });

      // Also add hardcoded admin emails if they're not already in the list
      for (const email of ADMIN_EMAILS) {
        if (!admins.find(a => a.email === email)) {
          // Try to find the user by email
          const userSnapshot = await db.collection('users')
            .where('email', '==', email)
            .limit(1)
            .get();

          if (!userSnapshot.empty) {
            const doc = userSnapshot.docs[0];
            const data = doc.data();
            admins.push({
              uid: doc.id,
              email: data.email,
              displayName: data.displayName,
              photoURL: data.photoURL,
              role: data.role || 'admin (hardcoded)'
            });
          } else {
            // User hasn't signed up yet but is in admin list
            admins.push({
              uid: null,
              email,
              displayName: null,
              photoURL: null,
              role: 'admin (pending signup)'
            });
          }
        }
      }

      // Sort by role (super_admin first) then by email
      admins.sort((a, b) => {
        if (a.role === 'super_admin' && b.role !== 'super_admin') return -1;
        if (b.role === 'super_admin' && a.role !== 'super_admin') return 1;
        return (a.email || '').localeCompare(b.email || '');
      });

      res.status(200).json({
        success: true,
        admins,
        count: admins.length
      });
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to fetch admin users' });
    }
  });
});

// ============================================
// Eventbrite Integration
// ============================================

/**
 * Verify Eventbrite webhook signature
 * Eventbrite uses HMAC-SHA256 for webhook verification
 * @param {string} signature - X-Eventbrite-Delivery-Signature header
 * @param {string} body - Raw request body
 * @param {string} secret - Webhook signing secret
 * @returns {boolean} True if signature is valid
 */
function verifyEventbriteSignature(signature, body, secret) {
  if (!signature || !secret) return false;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

/**
 * Webhook endpoint for Eventbrite order notifications
 * Set up in Eventbrite: Settings > Webhooks > Add webhook
 * URL: https://us-central1-cjs2026.cloudfunctions.net/eventbriteWebhook
 * Actions: order.placed, order.updated
 *
 * SECURITY: Validates webhook signature using HMAC-SHA256
 * Set EVENTBRITE_WEBHOOK_KEY secret in Firebase with your Eventbrite webhook key
 */
exports.eventbriteWebhook = onRequest({ cors: true, secrets: [eventbriteToken, eventbriteWebhookKey] }, async (req, res) => {
  // Eventbrite sends POST requests for webhooks
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    // Verify webhook signature if secret is configured
    const webhookSecret = eventbriteWebhookKey.value();
    if (webhookSecret) {
      const signature = req.headers['x-eventbrite-delivery-signature'];
      const rawBody = JSON.stringify(req.body);

      if (!verifyEventbriteSignature(signature, rawBody, webhookSecret)) {
        console.warn('Invalid Eventbrite webhook signature');
        await logError('eventbriteWebhook', new Error('Invalid signature'), {
          hasSignature: !!signature,
          action: req.body?.config?.action
        });
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
    } else {
      // Log warning if signature validation is disabled
      console.warn('EVENTBRITE_WEBHOOK_KEY not configured - signature validation disabled');
    }

    const payload = req.body;
    console.log('Eventbrite webhook received:', JSON.stringify(payload));

    // Eventbrite webhook payload structure
    const action = payload.config?.action;
    const apiUrl = payload.api_url;

    if (!apiUrl) {
      console.log('No api_url in webhook payload');
      res.status(200).json({ success: true, message: 'Acknowledged (no api_url)' });
      return;
    }

    // Handle refunds separately
    if (action === 'order.refunded') {
      await handleRefund(apiUrl);
      res.status(200).json({ success: true, message: 'Refund processed' });
      return;
    }

    // Handle attendee check-in/check-out
    if (action === 'attendee.checked_in' || action === 'attendee.checked_out') {
      await handleCheckInOut(apiUrl, action);
      res.status(200).json({ success: true, message: `${action} processed` });
      return;
    }

    // For order.placed and order.updated - process ticket purchase
    // Fetch the full order details from Eventbrite
    const orderResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${eventbriteToken.value()}`
      }
    });

    if (!orderResponse.ok) {
      throw new Error(`Failed to fetch order: ${orderResponse.status}`);
    }

    const order = await orderResponse.json();
    console.log('Order details:', JSON.stringify(order));

    // Get attendee emails from the order
    const attendeesUrl = `${apiUrl}/attendees/`;
    const attendeesResponse = await fetch(attendeesUrl, {
      headers: {
        'Authorization': `Bearer ${eventbriteToken.value()}`
      }
    });

    if (!attendeesResponse.ok) {
      throw new Error(`Failed to fetch attendees: ${attendeesResponse.status}`);
    }

    const attendeesData = await attendeesResponse.json();
    const attendees = attendeesData.attendees || [];

    let matched = 0;
    let unmatched = 0;

    for (const attendee of attendees) {
      const email = attendee.profile?.email?.toLowerCase();
      const name = attendee.profile?.name || `${attendee.profile?.first_name || ''} ${attendee.profile?.last_name || ''}`.trim();

      if (!email) continue;

      // Look for matching Firebase user
      const usersSnapshot = await db.collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (!usersSnapshot.empty) {
        // Found matching user - update their registration status
        const userDoc = usersSnapshot.docs[0];
        await db.collection('users').doc(userDoc.id).update({
          registrationStatus: 'registered',
          ticketsPurchased: true,
          eventbriteOrderId: order.id,
          eventbriteAttendeeId: attendee.id,
          ticketType: attendee.ticket_class_name || 'General',
          ticketPurchasedAt: new Date().toISOString(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await logActivity('ticket_purchased', userDoc.id, {
          email,
          orderId: order.id,
          ticketType: attendee.ticket_class_name
        });

        matched++;
        console.log(`Matched and updated user: ${email}`);
      } else {
        // No matching user - store for later matching
        await db.collection('eventbrite_unmatched').doc(attendee.id).set({
          email,
          name,
          orderId: order.id,
          attendeeId: attendee.id,
          ticketType: attendee.ticket_class_name || 'General',
          purchasedAt: new Date().toISOString(),
          matched: false
        });

        unmatched++;
        console.log(`No matching user for: ${email} - stored for later`);
      }
    }

    await logBackgroundJob('eventbrite_webhook', 'completed', {
      action,
      orderId: order.id,
      matched,
      unmatched
    });

    res.status(200).json({
      success: true,
      message: `Processed ${matched + unmatched} attendees (${matched} matched, ${unmatched} unmatched)`
    });

  } catch (error) {
    console.error('Eventbrite webhook error:', error);
    await logError('eventbriteWebhook', error, { body: req.body });
    // Return 200 to prevent Eventbrite from retrying
    res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * Handle refund - reset user's registration status
 */
async function handleRefund(apiUrl) {
  try {
    // Fetch the order details
    const orderResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${eventbriteToken.value()}`
      }
    });

    if (!orderResponse.ok) {
      throw new Error(`Failed to fetch order for refund: ${orderResponse.status}`);
    }

    const order = await orderResponse.json();
    const orderId = order.id;

    console.log(`Processing refund for order: ${orderId}`);

    // Find users with this order ID and reset their status
    const usersSnapshot = await db.collection('users')
      .where('eventbriteOrderId', '==', orderId)
      .get();

    let refundedCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      await db.collection('users').doc(userDoc.id).update({
        registrationStatus: 'pending',
        ticketsPurchased: false,
        ticketRefunded: true,
        ticketRefundedAt: new Date().toISOString(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      await logActivity('ticket_refunded', userDoc.id, {
        orderId,
        email: userDoc.data().email
      });

      refundedCount++;
      console.log(`Reset registration for user: ${userDoc.data().email}`);
    }

    // Also remove from eventbrite_synced if present
    const syncedSnapshot = await db.collection('eventbrite_synced')
      .where('orderId', '==', orderId)
      .get();

    for (const doc of syncedSnapshot.docs) {
      await db.collection('eventbrite_synced').doc(doc.id).delete();
    }

    // Mark any unmatched entries as refunded
    const unmatchedSnapshot = await db.collection('eventbrite_unmatched')
      .where('orderId', '==', orderId)
      .get();

    for (const doc of unmatchedSnapshot.docs) {
      await db.collection('eventbrite_unmatched').doc(doc.id).update({
        refunded: true,
        refundedAt: new Date().toISOString()
      });
    }

    await logBackgroundJob('eventbrite_refund', 'completed', {
      orderId,
      refundedCount
    });

    console.log(`Refund processed: ${refundedCount} users reset`);

  } catch (error) {
    console.error('Refund handling error:', error);
    await logError('handleRefund', error);
    throw error;
  }
}

/**
 * Handle check-in/check-out at the summit
 */
async function handleCheckInOut(apiUrl, action) {
  try {
    // Fetch the attendee details
    const attendeeResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${eventbriteToken.value()}`
      }
    });

    if (!attendeeResponse.ok) {
      throw new Error(`Failed to fetch attendee: ${attendeeResponse.status}`);
    }

    const attendee = await attendeeResponse.json();
    const email = attendee.profile?.email?.toLowerCase();
    const attendeeId = attendee.id;
    const isCheckIn = action === 'attendee.checked_in';

    console.log(`Processing ${action} for attendee: ${email}`);

    // Find matching Firebase user
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];

      if (isCheckIn) {
        await db.collection('users').doc(userDoc.id).update({
          registrationStatus: 'confirmed',
          checkedIn: true,
          checkedInAt: new Date().toISOString(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await logActivity('attendee_checked_in', userDoc.id, {
          email,
          attendeeId
        });
      } else {
        // Check-out (rare, but handle it)
        await db.collection('users').doc(userDoc.id).update({
          checkedOut: true,
          checkedOutAt: new Date().toISOString(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await logActivity('attendee_checked_out', userDoc.id, {
          email,
          attendeeId
        });
      }

      console.log(`${action} recorded for: ${email}`);
    } else {
      console.log(`No Firebase user found for check-in: ${email}`);
    }

    await logBackgroundJob(`eventbrite_${action}`, 'completed', {
      email,
      attendeeId
    });

  } catch (error) {
    console.error('Check-in/out handling error:', error);
    await logError('handleCheckInOut', error);
    throw error;
  }
}

/**
 * Sync all Eventbrite attendees with Firebase users
 * Can be called manually by admin or scheduled
 */
exports.syncEventbriteAttendees = onRequest({ cors: true, secrets: [eventbriteToken] }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const adminUser = await requireAdmin(req);
      const { eventId } = req.body;

      const targetEventId = eventId || EVENTBRITE_EVENT_ID;

      if (!targetEventId) {
        res.status(400).json({
          error: 'Event ID required. Pass eventId in body or set EVENTBRITE_EVENT_ID in code.',
          hint: 'Find your event ID in the Eventbrite URL: eventbrite.com/e/EVENT_ID'
        });
        return;
      }

      await logBackgroundJob('eventbrite_sync', 'started', { eventId: targetEventId, initiatedBy: adminUser.uid });

      // Fetch all attendees from Eventbrite
      let allAttendees = [];
      let continuation = null;
      let page = 1;

      do {
        const url = new URL(`https://www.eventbriteapi.com/v3/events/${targetEventId}/attendees/`);
        url.searchParams.append('status', 'attending');
        if (continuation) {
          url.searchParams.append('continuation', continuation);
        }

        console.log(`Fetching attendees page ${page}...`);
        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${eventbriteToken.value()}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Eventbrite API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        allAttendees = allAttendees.concat(data.attendees || []);
        continuation = data.pagination?.continuation;
        page++;

        // Rate limit protection
        await new Promise(resolve => setTimeout(resolve, 100));
      } while (continuation);

      console.log(`Total attendees from Eventbrite: ${allAttendees.length}`);

      let matched = 0;
      let unmatched = 0;
      let alreadySynced = 0;

      for (const attendee of allAttendees) {
        const email = attendee.profile?.email?.toLowerCase();
        const name = attendee.profile?.name || `${attendee.profile?.first_name || ''} ${attendee.profile?.last_name || ''}`.trim();

        if (!email) continue;

        // Check if already synced
        const existingSync = await db.collection('eventbrite_synced').doc(attendee.id).get();
        if (existingSync.exists) {
          alreadySynced++;
          continue;
        }

        // Look for matching Firebase user
        const usersSnapshot = await db.collection('users')
          .where('email', '==', email)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];

          // Update user's registration status
          await db.collection('users').doc(userDoc.id).update({
            registrationStatus: 'registered',
            ticketsPurchased: true,
            eventbriteAttendeeId: attendee.id,
            eventbriteOrderId: attendee.order_id,
            ticketType: attendee.ticket_class_name || 'General',
            ticketPurchasedAt: attendee.created ? new Date(attendee.created).toISOString() : new Date().toISOString(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Mark as synced
          await db.collection('eventbrite_synced').doc(attendee.id).set({
            email,
            userId: userDoc.id,
            syncedAt: new Date().toISOString()
          });

          matched++;
        } else {
          // Store for later matching (when user creates account)
          await db.collection('eventbrite_unmatched').doc(attendee.id).set({
            email,
            name,
            orderId: attendee.order_id,
            attendeeId: attendee.id,
            ticketType: attendee.ticket_class_name || 'General',
            purchasedAt: attendee.created ? new Date(attendee.created).toISOString() : new Date().toISOString(),
            matched: false
          });

          unmatched++;
        }

        // Rate limit for Firestore
        if ((matched + unmatched) % 50 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      await logBackgroundJob('eventbrite_sync', 'completed', {
        eventId: targetEventId,
        total: allAttendees.length,
        matched,
        unmatched,
        alreadySynced
      });

      await logAdminAction(adminUser.uid, 'sync_eventbrite', null, {
        eventId: targetEventId,
        matched,
        unmatched,
        alreadySynced
      });

      res.status(200).json({
        success: true,
        message: `Synced ${allAttendees.length} attendees`,
        stats: {
          total: allAttendees.length,
          matched,
          unmatched,
          alreadySynced
        }
      });

    } catch (error) {
      console.error('Eventbrite sync error:', error);
      await logError('syncEventbriteAttendees', error);
      await logBackgroundJob('eventbrite_sync', 'failed', { error: error.message });
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Sync failed' });
    }
  });
});

/**
 * Check for unmatched Eventbrite tickets when a new user signs up
 * Call this from the frontend after user creates account
 */
exports.checkEventbriteTicket = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const user = await verifyAuthToken(req.headers.authorization);

      // Get user's email
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        res.status(404).json({ error: 'User profile not found' });
        return;
      }

      const userEmail = userDoc.data().email?.toLowerCase();
      if (!userEmail) {
        res.status(400).json({ error: 'User email not found' });
        return;
      }

      // Check for unmatched Eventbrite ticket
      const unmatchedSnapshot = await db.collection('eventbrite_unmatched')
        .where('email', '==', userEmail)
        .where('matched', '==', false)
        .limit(1)
        .get();

      if (unmatchedSnapshot.empty) {
        res.status(200).json({
          success: true,
          hasTicket: false,
          message: 'No Eventbrite ticket found for this email'
        });
        return;
      }

      // Found a matching ticket - update user
      const ticketDoc = unmatchedSnapshot.docs[0];
      const ticketData = ticketDoc.data();

      await db.collection('users').doc(user.uid).update({
        registrationStatus: 'registered',
        ticketsPurchased: true,
        eventbriteAttendeeId: ticketData.attendeeId,
        eventbriteOrderId: ticketData.orderId,
        ticketType: ticketData.ticketType || 'General',
        ticketPurchasedAt: ticketData.purchasedAt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Mark ticket as matched
      await db.collection('eventbrite_unmatched').doc(ticketDoc.id).update({
        matched: true,
        matchedUserId: user.uid,
        matchedAt: new Date().toISOString()
      });

      // Also add to synced collection
      await db.collection('eventbrite_synced').doc(ticketData.attendeeId).set({
        email: userEmail,
        userId: user.uid,
        syncedAt: new Date().toISOString()
      });

      await logActivity('ticket_matched', user.uid, {
        email: userEmail,
        attendeeId: ticketData.attendeeId,
        matchedVia: 'account_creation'
      });

      res.status(200).json({
        success: true,
        hasTicket: true,
        message: 'Found your Eventbrite ticket! Registration status updated.',
        ticketType: ticketData.ticketType
      });

    } catch (error) {
      console.error('Check Eventbrite ticket error:', error);
      res.status(error.message.includes('Missing') ? 401 : 500)
        .json({ error: error.message || 'Failed to check ticket' });
    }
  });
});

/**
 * Get Eventbrite sync status (admin only)
 */
exports.getEventbriteSyncStatus = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      await requireAdmin(req);

      // Count synced tickets
      const syncedSnapshot = await db.collection('eventbrite_synced').get();
      const syncedCount = syncedSnapshot.size;

      // Count unmatched tickets
      const unmatchedSnapshot = await db.collection('eventbrite_unmatched')
        .where('matched', '==', false)
        .get();
      const unmatchedCount = unmatchedSnapshot.size;

      // Get unmatched emails for display
      const unmatchedEmails = [];
      unmatchedSnapshot.forEach(doc => {
        const data = doc.data();
        unmatchedEmails.push({
          email: data.email,
          name: data.name,
          ticketType: data.ticketType,
          purchasedAt: data.purchasedAt
        });
      });

      // Get last sync job
      const lastSyncSnapshot = await db.collection('background_jobs')
        .where('jobType', '==', 'eventbrite_sync')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      let lastSync = null;
      if (!lastSyncSnapshot.empty) {
        lastSync = lastSyncSnapshot.docs[0].data();
      }

      res.status(200).json({
        success: true,
        stats: {
          synced: syncedCount,
          unmatched: unmatchedCount,
          total: syncedCount + unmatchedCount
        },
        unmatchedEmails,
        lastSync
      });

    } catch (error) {
      console.error('Get Eventbrite sync status error:', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to get sync status' });
    }
  });
});

// ============================================
// Email Notifications - BACKLOG
// ============================================
// TODO: Implement email notifications for account approval using one of:
// - Zapier trigger connected to Airtable Attendees table
// - Airtable Automations (built-in, no extra service needed)
// When registrationStatus changes from "pending" to "registered",
// trigger an email via Zapier/Airtable automation.
//
// Original SendGrid-based implementation was removed - see git history if needed.

// ============================================
// Bookmark Count Sync to Airtable
// ============================================

/**
 * Automatically sync bookmark counts to Airtable when they change
 * Triggers on any write to sessionBookmarks/{sessionId}
 */
exports.syncBookmarkCountToAirtable = onDocumentWritten(
  {
    document: "sessionBookmarks/{sessionId}",
    secrets: [airtableApiKey]
  },
  async (event) => {
    const sessionId = event.params.sessionId;
    const data = event.data?.after?.data();
    const count = data?.count || 0;

    console.log(`Syncing bookmark count for session ${sessionId}: ${count}`);

    try {
      // Find the Airtable record by session_id field
      const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_SCHEDULE_TABLE)}?filterByFormula={session_id}="${sessionId}"`;

      const searchResponse = await fetch(searchUrl, {
        headers: {
          "Authorization": `Bearer ${airtableApiKey.value()}`
        }
      });

      if (!searchResponse.ok) {
        console.error(`Airtable search failed: ${searchResponse.status}`);
        return;
      }

      const searchData = await searchResponse.json();

      if (!searchData.records || searchData.records.length === 0) {
        console.log(`No Airtable record found for session_id: ${sessionId}`);
        return;
      }

      const recordId = searchData.records[0].id;

      // Update the Bookmarks field
      const updateResponse = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_SCHEDULE_TABLE)}/${recordId}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${airtableApiKey.value()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fields: {
              "Bookmarks": count
            }
          })
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error(`Airtable update failed: ${updateResponse.status} - ${errorText}`);
        return;
      }

      console.log(`Successfully synced bookmark count (${count}) for session ${sessionId} to Airtable record ${recordId}`);
    } catch (error) {
      console.error(`Error syncing bookmark count for ${sessionId}:`, error);
    }
  }
);

// ============================================
// Custom CMS Functions
// ============================================

// Define GitHub PAT secret for triggering GitHub Actions
const githubPat = defineSecret("GITHUB_PAT");

// CMS validation schemas
const CMS_SCHEMAS = {
  cmsContent: {
    required: ['field', 'section', 'content'],
    optional: ['page', 'component', 'color', 'order', 'visible', 'link']
  },
  cmsSchedule: {
    required: ['sessionId', 'title', 'type', 'day', 'startTime'],
    optional: ['endTime', 'description', 'room', 'speakers', 'speakerOrgs', 'track', 'order', 'visible', 'isBookmarkable', 'color']
  },
  cmsOrganizations: {
    required: ['name'],
    optional: ['logoUrl', 'logoPath', 'website', 'isSponsor', 'sponsorTier', 'sponsorOrder', 'description', 'type', 'visible']
  },
  cmsTimeline: {
    required: ['year', 'location'],
    optional: ['theme', 'link', 'emoji', 'order', 'visible']
  }
};

/**
 * Validate CMS data against schema
 */
function validateCMSData(collection, data, isPartialUpdate = false) {
  const schema = CMS_SCHEMAS[collection];
  if (!schema) return { valid: false, error: 'Unknown collection' };

  if (!isPartialUpdate) {
    for (const field of schema.required) {
      if (data[field] === undefined || data[field] === '') {
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }
  }

  // Validate field types
  if (data.order !== undefined && typeof data.order !== 'number') {
    return { valid: false, error: 'Order must be a number' };
  }
  if (data.visible !== undefined && typeof data.visible !== 'boolean') {
    return { valid: false, error: 'Visible must be boolean' };
  }

  return { valid: true };
}

/**
 * Sanitize CMS data (basic profanity check on text fields)
 */
function sanitizeCMSData(data) {
  const sanitized = { ...data };
  // Note: For full profanity filtering, the frontend profanityFilter.js should be used
  // Cloud Functions can do basic sanitization like trimming whitespace
  const textFields = ['content', 'title', 'description', 'name', 'theme', 'speakers', 'speakerOrgs'];
  for (const field of textFields) {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitized[field].trim();
    }
  }
  return sanitized;
}

/**
 * Log CMS version history
 */
async function logCMSVersionHistory(collection, documentId, previousValue, newValue, action, user) {
  try {
    await db.collection('cmsVersionHistory').add({
      collection,
      documentId,
      field: previousValue?.field || newValue?.field || null,
      previousValue: previousValue || null,
      newValue: newValue || null,
      action,
      userId: user.uid,
      userEmail: user.email,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    console.error('Failed to log CMS version history:', err);
  }
}

/**
 * Create CMS content (admin only)
 */
exports.cmsCreateContent = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const user = await requireAdmin(req);
      const { collection, data } = req.body;

      // Validate collection name
      const validCollections = ['cmsContent', 'cmsSchedule', 'cmsOrganizations', 'cmsTimeline'];
      if (!validCollections.includes(collection)) {
        res.status(400).json({ error: 'Invalid collection' });
        return;
      }

      // Validate required fields
      const validation = validateCMSData(collection, data);
      if (!validation.valid) {
        res.status(400).json({ error: validation.error });
        return;
      }

      // Sanitize content
      const sanitizedData = sanitizeCMSData(data);

      // Add metadata
      const docData = {
        ...sanitizedData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: user.uid,
        version: 1
      };

      // Create document
      const docRef = await db.collection(collection).add(docData);

      // Log to version history
      await logCMSVersionHistory(collection, docRef.id, null, docData, 'create', user);

      // Log admin action
      await logAdminAction(user.uid, 'cms_create', null, { collection, documentId: docRef.id });

      res.status(200).json({ success: true, id: docRef.id });
    } catch (error) {
      console.error('CMS create error:', error);
      await logError('cmsCreateContent', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to create content' });
    }
  });
});

/**
 * Update CMS content (admin only)
 */
exports.cmsUpdateContent = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const user = await requireAdmin(req);
      const { collection, documentId, data } = req.body;

      // Validate collection
      const validCollections = ['cmsContent', 'cmsSchedule', 'cmsOrganizations', 'cmsTimeline'];
      if (!validCollections.includes(collection)) {
        res.status(400).json({ error: 'Invalid collection' });
        return;
      }

      if (!documentId) {
        res.status(400).json({ error: 'Document ID required' });
        return;
      }

      // Get existing document
      const docRef = db.collection(collection).doc(documentId);
      const existing = await docRef.get();
      if (!existing.exists) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // Validate and sanitize
      const validation = validateCMSData(collection, data, true);  // true = partial update
      if (!validation.valid) {
        res.status(400).json({ error: validation.error });
        return;
      }
      const sanitizedData = sanitizeCMSData(data);

      // Update with metadata
      const updateData = {
        ...sanitizedData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: user.uid,
        version: admin.firestore.FieldValue.increment(1)
      };

      await docRef.update(updateData);

      // Log to version history
      await logCMSVersionHistory(collection, documentId, existing.data(), updateData, 'update', user);

      // Log admin action
      await logAdminAction(user.uid, 'cms_update', null, { collection, documentId });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('CMS update error:', error);
      await logError('cmsUpdateContent', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to update content' });
    }
  });
});

/**
 * Delete CMS content (super admin only)
 */
exports.cmsDeleteContent = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const user = await requireSuperAdmin(req);  // Super admin only
      const { collection, documentId } = req.body;

      // Validate collection
      const validCollections = ['cmsContent', 'cmsSchedule', 'cmsOrganizations', 'cmsTimeline'];
      if (!validCollections.includes(collection)) {
        res.status(400).json({ error: 'Invalid collection' });
        return;
      }

      if (!documentId) {
        res.status(400).json({ error: 'Document ID required' });
        return;
      }

      // Get existing document for history
      const docRef = db.collection(collection).doc(documentId);
      const existing = await docRef.get();
      if (!existing.exists) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      // If organization with logo, note it for potential cleanup
      // (Actual Storage deletion would require the Storage SDK)
      const existingData = existing.data();
      if (collection === 'cmsOrganizations' && existingData.logoPath) {
        console.log(`Note: Logo at ${existingData.logoPath} may need cleanup`);
      }

      // Delete document
      await docRef.delete();

      // Log to version history
      await logCMSVersionHistory(collection, documentId, existingData, null, 'delete', user);

      // Log admin action
      await logAdminAction(user.uid, 'cms_delete', null, { collection, documentId });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('CMS delete error:', error);
      await logError('cmsDeleteContent', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to delete content' });
    }
  });
});

/**
 * Get CMS version history (admin only)
 */
exports.cmsGetVersionHistory = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      await requireAdmin(req);
      const { collection, documentId, limit = '20' } = req.query;

      let query = db.collection('cmsVersionHistory')
        .orderBy('timestamp', 'desc')
        .limit(parseInt(limit));

      if (collection) {
        query = query.where('collection', '==', collection);
      }
      // Note: Can't combine multiple where clauses with orderBy on different fields
      // without a composite index. For documentId filtering, do it in memory.

      const snapshot = await query.get();
      let history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()?.toISOString()
      }));

      // Filter by documentId in memory if provided
      if (documentId) {
        history = history.filter(h => h.documentId === documentId);
      }

      res.status(200).json({ success: true, history });
    } catch (error) {
      console.error('Version history error:', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to get version history' });
    }
  });
});

/**
 * Trigger CMS publish via GitHub Actions (admin only)
 * Creates a publish queue entry and triggers the deploy workflow
 */
exports.cmsPublish = onRequest({ cors: true, secrets: [githubPat] }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const user = await requireAdmin(req);
      const { changes = [] } = req.body;

      // Create publish queue entry
      const queueRef = await db.collection('cmsPublishQueue').add({
        status: 'pending',
        triggeredBy: user.uid,
        triggeredByEmail: user.email,
        triggeredAt: admin.firestore.FieldValue.serverTimestamp(),
        completedAt: null,
        error: null,
        changes
      });

      // Check if GitHub PAT is configured
      const token = githubPat.value();
      if (!token) {
        // If no GitHub PAT, just log and return success
        // The admin can manually trigger via Airtable or GitHub
        await db.collection('cmsPublishQueue').doc(queueRef.id).update({
          status: 'manual_required',
          error: 'GITHUB_PAT not configured. Trigger deploy manually via GitHub Actions.'
        });

        res.status(200).json({
          success: true,
          queueId: queueRef.id,
          message: 'Publish queued. GitHub PAT not configured - trigger deploy manually.',
          manualRequired: true
        });
        return;
      }

      // Trigger GitHub Actions workflow via repository dispatch
      const response = await fetch(
        'https://api.github.com/repos/jamditis/cjs2026/dispatches',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            event_type: 'cms_publish',
            client_payload: {
              queueId: queueRef.id,
              triggeredBy: user.email
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        await db.collection('cmsPublishQueue').doc(queueRef.id).update({
          status: 'failed',
          error: `GitHub trigger failed: ${response.status} - ${errorText}`
        });
        res.status(500).json({ error: 'Failed to trigger GitHub Actions' });
        return;
      }

      // Update status to publishing
      await db.collection('cmsPublishQueue').doc(queueRef.id).update({
        status: 'publishing'
      });

      // Log admin action
      await logAdminAction(user.uid, 'cms_publish', null, { queueId: queueRef.id, changesCount: changes.length });

      res.status(200).json({
        success: true,
        queueId: queueRef.id,
        message: 'Publish triggered. Site will update in ~60 seconds.'
      });
    } catch (error) {
      console.error('Publish error:', error);
      await logError('cmsPublish', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to trigger publish' });
    }
  });
});

/**
 * Get CMS publish queue (admin only)
 */
exports.cmsGetPublishQueue = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      await requireAdmin(req);
      const limit = parseInt(req.query.limit) || 20;

      const snapshot = await db.collection('cmsPublishQueue')
        .orderBy('triggeredAt', 'desc')
        .limit(limit)
        .get();

      const queue = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        triggeredAt: doc.data().triggeredAt?.toDate()?.toISOString(),
        completedAt: doc.data().completedAt?.toDate()?.toISOString()
      }));

      res.status(200).json({ success: true, queue });
    } catch (error) {
      console.error('Get publish queue error:', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to get publish queue' });
    }
  });
});

/**
 * Update publish queue status (called by GitHub Actions)
 * This endpoint is called from the deploy workflow to update the queue status
 */
exports.cmsUpdatePublishStatus = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      // This endpoint can be called by GitHub Actions with a secret key
      // For now, just check that request has valid data
      const { queueId, status, error: errorMsg, commitSha } = req.body;

      if (!queueId || !status) {
        res.status(400).json({ error: 'Queue ID and status required' });
        return;
      }

      const validStatuses = ['pending', 'publishing', 'success', 'failed'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const updateData = {
        status,
        completedAt: status === 'success' || status === 'failed'
          ? admin.firestore.FieldValue.serverTimestamp()
          : null
      };

      if (errorMsg) updateData.error = errorMsg;
      if (commitSha) updateData.gitCommitSha = commitSha;

      await db.collection('cmsPublishQueue').doc(queueId).update(updateData);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Update publish status error:', error);
      res.status(500).json({ error: error.message || 'Failed to update status' });
    }
  });
});

/**
 * Upload image for CMS (admin only)
 * Handles multipart form uploads for sponsor logos, etc.
 *
 * Expects:
 * - FormData with 'file' field (image file)
 * - FormData with 'category' field (e.g., 'sponsors', 'timeline')
 * - Authorization header with Bearer token
 *
 * Returns:
 * - { url: string, path: string } on success
 */
exports.cmsUploadImage = onRequest({ cors: true }, async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    // Set CORS headers for preflight
    const origin = req.headers.origin;
    const isAllowed = ALLOWED_ORIGINS.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
      return;
    } else {
      res.status(403).send('Not allowed by CORS');
      return;
    }
  }

  // Set CORS headers for actual request
  const origin = req.headers.origin;
  const isAllowed = ALLOWED_ORIGINS.some(allowed => {
    if (allowed instanceof RegExp) return allowed.test(origin);
    return allowed === origin;
  });

  if (isAllowed) {
    res.set('Access-Control-Allow-Origin', origin);
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    // Verify admin authentication
    const user = await requireAdmin(req);

    // Parse multipart form data
    const busboy = Busboy({ headers: req.headers });

    let fileBuffer = null;
    let fileName = null;
    let mimeType = null;
    let category = 'general';

    const parsePromise = new Promise((resolve, reject) => {
      busboy.on('file', (fieldname, file, info) => {
        const { filename, mimeType: mime } = info;

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(mime)) {
          reject(new Error(`Invalid file type: ${mime}. Allowed: PNG, JPEG, GIF, WebP, SVG`));
          return;
        }

        fileName = filename;
        mimeType = mime;

        const chunks = [];
        file.on('data', (chunk) => {
          chunks.push(chunk);
        });

        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);

          // Validate file size (2MB max)
          if (fileBuffer.length > 2 * 1024 * 1024) {
            reject(new Error('File too large. Maximum size is 2MB.'));
            return;
          }
        });
      });

      busboy.on('field', (fieldname, value) => {
        if (fieldname === 'category') {
          // Sanitize category to prevent path traversal
          category = value.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase() || 'general';
        }
      });

      busboy.on('finish', () => {
        if (!fileBuffer || !fileName) {
          reject(new Error('No file provided'));
          return;
        }
        resolve();
      });

      busboy.on('error', (err) => {
        reject(err);
      });
    });

    // Pipe request to busboy
    if (req.rawBody) {
      // In Firebase Functions v2, raw body is available directly
      busboy.end(req.rawBody);
    } else {
      req.pipe(busboy);
    }

    await parsePromise;

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `cms-images/${category}/${timestamp}_${sanitizedFileName}`;

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(storagePath);

    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          uploadedBy: user.uid,
          uploadedByEmail: user.email,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    // Make file publicly readable
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // Log the upload
    await logActivity({
      type: 'cms_upload',
      description: `Uploaded ${category} image: ${sanitizedFileName}`,
      userId: user.uid,
      userEmail: user.email,
      metadata: {
        path: storagePath,
        category,
        size: fileBuffer.length,
        mimeType
      }
    });

    console.log(`CMS image uploaded by ${user.email}: ${storagePath}`);

    res.status(200).json({
      success: true,
      url: publicUrl,
      path: storagePath
    });

  } catch (error) {
    console.error('CMS upload error:', error);

    // Determine appropriate status code
    let status = 500;
    if (error.message.includes('Unauthorized') || error.message.includes('Admin')) {
      status = 403;
    } else if (error.message.includes('Invalid file') || error.message.includes('too large') || error.message.includes('No file')) {
      status = 400;
    }

    res.status(status).json({
      error: error.message || 'Failed to upload image'
    });
  }
});

/**
 * Sync CMS content from Firestore to Airtable (admin only)
 *
 * This allows admins to push changes made in the admin dashboard
 * back to Airtable for backup/visibility purposes.
 *
 * POST /syncCMSToAirtable
 * Body: { collection: 'cmsContent' | 'cmsTimeline' | 'cmsOrganizations' | 'cmsSchedule' }
 *
 * Returns: { success: true, created: N, updated: N, skipped: N }
 */
exports.syncCMSToAirtable = onRequest({ cors: true, secrets: [airtableApiKey] }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const user = await requireAdmin(req);
      const { collection = 'cmsContent' } = req.body;

      // Map Firestore collections to Airtable tables
      const collectionToTable = {
        'cmsContent': AIRTABLE_SITE_CONTENT_TABLE,
        'cmsTimeline': 'Summit History',
        'cmsOrganizations': 'Organizations',
        'cmsSchedule': AIRTABLE_SCHEDULE_TABLE
      };

      const airtableTable = collectionToTable[collection];
      if (!airtableTable) {
        res.status(400).json({ error: `Invalid collection: ${collection}` });
        return;
      }

      console.log(`Starting sync from Firestore ${collection} to Airtable ${airtableTable}...`);

      // 1. Fetch all documents from Firestore
      const firestoreSnapshot = await db.collection(collection).get();
      const firestoreDocs = firestoreSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Found ${firestoreDocs.length} documents in Firestore ${collection}`);

      // 2. Fetch all records from Airtable to find existing ones
      const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(airtableTable)}`;
      const apiKey = airtableApiKey.value();

      const existingRecords = [];
      let offset = null;
      do {
        const url = offset
          ? `${airtableUrl}?offset=${offset}&pageSize=100`
          : `${airtableUrl}?pageSize=100`;

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Airtable fetch error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        existingRecords.push(...data.records);
        offset = data.offset;
      } while (offset);

      console.log(`Found ${existingRecords.length} existing records in Airtable`);

      // 3. Build lookup map for existing Airtable records
      // Key format depends on collection type
      const getKey = (record) => {
        if (collection === 'cmsContent') {
          return `${record.fields.Section || ''}_${record.fields.Field || ''}`;
        } else if (collection === 'cmsTimeline') {
          return record.fields.Year?.toString() || '';
        } else if (collection === 'cmsOrganizations') {
          return record.fields.Name || '';
        } else if (collection === 'cmsSchedule') {
          return record.fields['session_id'] || record.fields['Session title'] || '';
        }
        return '';
      };

      const existingByKey = new Map();
      for (const record of existingRecords) {
        const key = getKey(record);
        if (key) {
          existingByKey.set(key, record);
        }
      }

      // 4. Prepare batches for create/update
      const toCreate = [];
      const toUpdate = [];
      let skipped = 0;

      for (const doc of firestoreDocs) {
        let key, fields;

        if (collection === 'cmsContent') {
          key = `${doc.section || ''}_${doc.field || ''}`;
          fields = {
            'Field': doc.field,
            'Content': doc.content,
            'Section': doc.section,
            'Page': doc.page || 'Home',
            'Color': doc.color || 'ink',
            'Order': doc.order || 0,
            'Visible': doc.visible !== false,
            'Component': doc.component || '',
            'Link': doc.link || ''
          };
        } else if (collection === 'cmsTimeline') {
          key = doc.year?.toString() || '';
          fields = {
            'Year': doc.year,
            'Location': doc.location,
            'Theme': doc.theme || '',
            'Link': doc.link || '',
            'Emoji': doc.emoji || '',
            'Order': doc.order || 0,
            'Visible': doc.visible !== false
          };
        } else if (collection === 'cmsOrganizations') {
          key = doc.name || '';
          fields = {
            'Name': doc.name,
            'Description': doc.description || '',
            'Website': doc.website || '',
            'Sponsor': doc.sponsor === true,
            'Sponsor tier': doc.sponsorTier || '',
            'Sponsor order': doc.sponsorOrder || 0,
            'Type': doc.type || '',
            'Visible': doc.visible !== false
            // Note: Logo not synced (handled separately via Storage)
          };
        } else if (collection === 'cmsSchedule') {
          key = doc.session_id || doc.title || '';
          fields = {
            'Session title': doc.title,
            'Type': doc.type || 'session',
            'Day': doc.day,
            'Start time': doc.startTime,
            'End time': doc.endTime || '',
            'Description': doc.description || '',
            'Room': doc.room || '',
            'Speakers': doc.speakers || '',
            'Speaker orgs': doc.speakerOrgs || '',
            'Track': doc.track || '',
            'Order': doc.order || 0,
            'Visible': doc.visible !== false,
            'session_id': doc.session_id || ''
          };
        }

        if (!key) {
          skipped++;
          continue;
        }

        const existingRecord = existingByKey.get(key);
        if (existingRecord) {
          toUpdate.push({ id: existingRecord.id, fields });
        } else {
          toCreate.push({ fields });
        }
      }

      // 5. Execute batch creates (Airtable allows 10 at a time)
      let created = 0;
      for (let i = 0; i < toCreate.length; i += 10) {
        const batch = toCreate.slice(i, i + 10);
        const response = await fetch(airtableUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ records: batch, typecast: true })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Airtable create error: ${errorText}`);
          // Continue with other batches
        } else {
          const data = await response.json();
          created += data.records.length;
        }
      }

      // 6. Execute batch updates (Airtable allows 10 at a time)
      let updated = 0;
      for (let i = 0; i < toUpdate.length; i += 10) {
        const batch = toUpdate.slice(i, i + 10);
        const response = await fetch(airtableUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ records: batch, typecast: true })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Airtable update error: ${errorText}`);
          // Continue with other batches
        } else {
          const data = await response.json();
          updated += data.records.length;
        }
      }

      // Log the sync action
      await logAdminAction(user.uid, 'cms_sync_to_airtable', null, {
        collection,
        airtableTable,
        created,
        updated,
        skipped
      });

      console.log(`Sync complete: ${created} created, ${updated} updated, ${skipped} skipped`);

      res.status(200).json({
        success: true,
        collection,
        airtableTable,
        created,
        updated,
        skipped,
        total: firestoreDocs.length
      });

    } catch (error) {
      console.error('CMS sync to Airtable error:', error);
      await logError('syncCMSToAirtable', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500)
        .json({ error: error.message || 'Failed to sync to Airtable' });
    }
  });
});
