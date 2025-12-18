const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
const db = admin.firestore();

// Airtable config
const AIRTABLE_BASE_ID = "appL8Sn87xUotm4jF";
const AIRTABLE_TABLE_NAME = "Email signups";
const AIRTABLE_SITE_CONTENT_TABLE = "tblTZ0F89UMTO8PO0";

// Define the secrets (will be accessed at runtime)
const airtableApiKey = defineSecret("AIRTABLE_API_KEY");
const eventbriteToken = defineSecret("EVENTBRITE_TOKEN");
const sendgridApiKey = defineSecret("SENDGRID_API_KEY");

// Eventbrite config
const EVENTBRITE_EVENT_ID = "1977919688031";

// Cache for site content (in-memory, refreshes on function cold start)
let contentCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

/**
 * Check if user has admin role in Firestore
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} True if user is admin or super_admin
 */
async function isAdmin(uid) {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) return false;

  const role = userDoc.data().role;
  return role === 'admin' || role === 'super_admin';
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
  const adminStatus = await isAdmin(user.uid);

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

    if (!email || !email.includes("@")) {
      res.status(400).json({ error: "Valid email required" });
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
 * Get all pending edit requests (for Joe to review)
 */
exports.getEditRequests = onRequest({ cors: true }, async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    try {
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
      res.status(500).json({ error: "Failed to fetch edit requests" });
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
      const resolved = req.query.resolved === 'true';

      let query = db.collection('system_errors')
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (resolved !== undefined) {
        query = query.where('resolved', '==', resolved);
      }

      const snapshot = await query.get();
      const errors = [];

      snapshot.forEach(doc => {
        errors.push({ id: doc.id, ...doc.data() });
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

// ============================================
// Eventbrite Integration
// ============================================

/**
 * Webhook endpoint for Eventbrite order notifications
 * Set up in Eventbrite: Settings > Webhooks > Add webhook
 * URL: https://us-central1-cjs2026.cloudfunctions.net/eventbriteWebhook
 * Actions: order.placed, order.updated
 */
exports.eventbriteWebhook = onRequest({ cors: true, secrets: [eventbriteToken] }, async (req, res) => {
  // Eventbrite sends POST requests for webhooks
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
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
