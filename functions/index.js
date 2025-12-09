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
            "Authorization": `Bearer ${AIRTABLE_API_KEY}`
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
