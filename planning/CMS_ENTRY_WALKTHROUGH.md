# CMS content entry walkthrough

**Step-by-step guide for entering launch content**

---

## Before you begin

1. Open https://summit.collaborativejournalism.org/admin
2. Sign in with an admin account (jamditis@gmail.com, murrayst@montclair.edu, or etiennec@montclair.edu)
3. Click the **CMS** tab in the sidebar
4. Select **Site content** from the sub-tabs

---

## Part 1: Hero section updates

### Step 1.1: Update the tagline

1. In the CMS, click on **Home page** card
2. Expand the **Hero banner** section (or **Event details** / **details** section)
3. Find the field labeled **tagline**
4. Click the **pencil icon** (✏️) on the right
5. In the modal:
   - **Content**: Change from "Prepare to partner." to:
     ```
     A decade of working together.
     ```
   - Leave other fields as-is
6. Click **Save**

### Step 1.2: Update registration note

1. Find the field **registration_note**
2. Click the pencil icon
3. Update **Content** to:
   ```
   Registration opens January 2026
   ```
   *(Or "Tickets now available" if Eventbrite is live)*
4. Click **Save**

### Step 1.3: Update section headline

1. Find **section_headline** (currently "Save the date")
2. Click pencil icon
3. Update **Content** to:
   ```
   Mark your calendar
   ```
4. Click **Save**

### Step 1.4: Update section description

1. Find **section_description**
2. Click pencil icon
3. Update **Content** to:
   ```
   What began as an experiment in 2017 has grown into the journalism industry's premier gathering for collaboration. Join us in Pittsburgh as we celebrate ten years of proving that local news is stronger when we work together.
   ```
4. Click **Save**

### Step 1.5: Update venue placeholder

1. Find **venue_name** (currently "Pittsburgh venue TBA")
2. Click pencil icon
3. Update **Content** to:
   ```
   Venue announcement coming soon
   ```
4. Click **Save**

---

## Part 2: "What to expect" section

### Step 2.1: Update Monday items

1. Click on **Home page** card
2. Expand the **What to expect** section (or **expect** section)
3. Find **monday_items**
4. Click pencil icon
5. Update **Content** to (each line becomes a bullet point):
   ```
   Opening keynote celebrating 10 years of collaboration
   Curated sessions on the state of collaborative journalism
   Community-pitched lightning talks
   Afternoon networking breaks
   Evening reception (location TBA)
   ```
6. Click **Save**

### Step 2.2: Update Tuesday items

1. Find **tuesday_items**
2. Click pencil icon
3. Update **Content** to:
   ```
   Morning keynote on the future of local news partnerships
   Deep-dive workshops and skill-building sessions
   Solution-focused breakout discussions
   Collaborative speed networking
   Closing session: What's next for our community
   ```
4. Click **Save**

---

## Part 3: History section

### Step 3.1: Update history description

1. Click on **Home page** card
2. Expand the **Timeline** section (or **history** section)
3. Find **section_description**
4. Click pencil icon
5. Update **Content** to:
   ```
   From a small gathering in Montclair to a movement spanning eight cities, the Collaborative Journalism Summit has connected thousands of journalists, funders, and innovators. Pittsburgh marks our tenth gathering—and a milestone worth celebrating.
   ```
6. Click **Save**

---

## Part 4: Footer updates

### Step 4.1: Update signup description

1. Expand the **Global** page or **Footer** section
2. Find **signup_description**
3. Click pencil icon
4. Update **Content** to:
   ```
   Be part of the 10th anniversary. Registration opens soon.
   ```
   *(Or "Registration is now open!" when Eventbrite is live)*
5. Click **Save**

---

## Part 5: Publish your changes

After making all updates:

1. Look for the **yellow banner** at the top of the CMS that says "Unpublished changes"
2. Click **"Publish now"**
3. Wait approximately 60 seconds for the deployment to complete
4. The banner will turn green when successful
5. Visit https://summit.collaborativejournalism.org to verify your changes

---

## Quick reference: Field locations

| What to update | Page | Section | Field name |
|----------------|------|---------|------------|
| Main tagline | Home page | details | tagline |
| Registration status | Home page | details | registration_note |
| Section headline | Home page | details | section_headline |
| Section description | Home page | details | section_description |
| Venue name | Home page | details | venue_name |
| Monday agenda | Home page | expect | monday_items |
| Tuesday agenda | Home page | expect | tuesday_items |
| History description | Home page | history | section_description |
| Footer CTA | Global | footer | signup_description |

---

## Troubleshooting

### "I can't find the field"
- Try expanding all sections by clicking on them
- Use Ctrl+F (Cmd+F on Mac) to search the page for the field name
- Some fields may be nested under different section names

### "My changes didn't save"
- Check for validation errors (red text below fields)
- Ensure you clicked the "Save" button, not just closed the modal
- Refresh the page and check if the change persisted

### "The site didn't update after publishing"
- Wait a full 60 seconds—the GitHub Actions deployment takes time
- Check the admin panel for any deployment errors
- Try a hard refresh (Ctrl+Shift+R) on the live site

### "I made a mistake"
- Check the **Version history** tab to see previous values
- You can manually revert by editing the field again
- For major issues, contact the development team

---

*Last updated: January 2026*
