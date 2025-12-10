const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// Airtable config
const AIRTABLE_BASE_ID = "appL8Sn87xUotm4jF";
const AIRTABLE_TABLE_NAME = "Email signups";
const AIRTABLE_SITE_CONTENT_TABLE = "tblTZ0F89UMTO8PO0";

// Define the secret (will be accessed at runtime)
const airtableApiKey = defineSecret("AIRTABLE_API_KEY");

// Cache for site content (in-memory, refreshes on function cold start)
let contentCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

// Admin email addresses (can edit this list as needed)
const ADMIN_EMAILS = [
  "amditisj@montclair.edu",
  "jamditis@gmail.com",
  "murrays@montclair.edu", // Stefanie
];

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

    // Check admin authorization via query param (simple auth for internal use)
    // In production, you'd use Firebase Auth tokens
    const adminEmail = req.query.adminEmail;
    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      res.status(403).json({ error: "Unauthorized. Admin access required." });
      return;
    }

    try {
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
      res.status(500).json({ error: "Failed to export attendees", details: error.message });
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

    const adminEmail = req.body.adminEmail;
    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      res.status(403).json({ error: "Unauthorized. Admin access required." });
      return;
    }

    try {
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

      res.status(200).json({
        success: true,
        message: `Synced ${synced} profiles, ${errors} errors`,
        synced,
        errors
      });
    } catch (error) {
      console.error("Error in batch sync:", error);
      res.status(500).json({ error: "Batch sync failed", details: error.message });
    }
  });
});
