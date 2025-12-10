"""
Populate Airtable Site Content table with all website content
"""
import requests
import json
import time
import os
from pathlib import Path

BASE_ID = "appL8Sn87xUotm4jF"
TABLE_ID = "tblTZ0F89UMTO8PO0"

# Load API key from environment or .env file
def load_api_key():
    # Try environment variable first
    if os.environ.get("AIRTABLE_API_KEY"):
        return os.environ.get("AIRTABLE_API_KEY")
    # Try .env file
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                if line.startswith("AIRTABLE_API_KEY="):
                    return line.split("=", 1)[1].strip()
    raise ValueError("AIRTABLE_API_KEY not found in environment or .env file")

API_KEY = load_api_key()
BASE_URL = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# All content records to add
# Format: Section, Field, Content, Page, Component, Color, Order, Visible, Notes
# Section is now a text field so we can use any value

content_records = [
    # ===== HERO SECTION (Home page) =====
    # Note: Some hero content already exists, we'll add what's missing

    # ===== DETAILS SECTION (Home page) =====
    ("details", "when_day1_description", "Full day of sessions + dinner", "Home", "DetailsCard", "teal", 10, True, "Day 1 description"),
    ("details", "when_day2_title", "Tuesday, June 9", "Home", "DetailsCard", "teal", 11, True, "Day 2 title"),
    ("details", "when_day2_description", "Morning workshops", "Home", "DetailsCard", "teal", 12, True, "Day 2 description"),
    ("details", "venue_name", "UNC Friday Center", "Home", "DetailsCard", "teal", 13, True, "Venue name"),
    ("details", "venue_location", "Chapel Hill, North Carolina", "Home", "DetailsCard", "teal", 14, True, "Venue location"),
    ("details", "venue_note", "Co-located with INN Days", "Home", "DetailsCard", "teal", 15, True, "Venue note"),
    ("details", "who_count", "130-150 attendees", "Home", "DetailsCard", "teal", 16, True, "Expected attendees count"),
    ("details", "who_description", "Journalists, media leaders, funders, and academics", "Home", "DetailsCard", "teal", 17, True, "Who attends description"),

    # ===== HISTORY SECTION (Home page) =====
    ("history", "section_headline", "10 years of working together", "Home", "SectionHeadline", "ink", 20, True, "History section headline"),
    ("history", "section_description", "Since 2017, the Collaborative Journalism Summit has brought together practitioners, funders, and innovators. This year, we celebrate a decade of proving that journalism is stronger when we collaborate.", "Home", "SectionDescription", "ink", 21, True, "History section description"),

    # ===== STATS SECTION (Home page - History area) =====
    ("stats", "summits_value", "10", "Home", "StatCard", "teal", 30, True, "Number of summits"),
    ("stats", "summits_label", "Summits", "Home", "StatCard", "teal", 31, True, "Summits label"),
    ("stats", "cities_value", "8", "Home", "StatCard", "teal", 32, True, "Number of cities"),
    ("stats", "cities_label", "Cities", "Home", "StatCard", "teal", 33, True, "Cities label"),
    ("stats", "attendees_value", "1500+", "Home", "StatCard", "teal", 34, True, "Number of attendees"),
    ("stats", "attendees_label", "Attendees", "Home", "StatCard", "teal", 35, True, "Attendees label"),
    ("stats", "mission_value", "1", "Home", "StatCard", "teal", 36, True, "Mission count"),
    ("stats", "mission_label", "Mission", "Home", "StatCard", "teal", 37, True, "Mission label"),

    # ===== TIMELINE SECTION (Home page - History area) =====
    ("timeline", "2017_year", "2017", "Home", "TimelineCard", "teal", 40, True, "2017 summit year"),
    ("timeline", "2017_location", "Montclair, NJ", "Home", "TimelineCard", "teal", 41, True, "2017 summit location"),
    ("timeline", "2017_theme", "The Beginning", "Home", "TimelineCard", "teal", 42, True, "2017 summit theme"),
    ("timeline", "2017_link", "https://www.montclair.edu/college-of-communication-and-media/2017/06/07/18156_collaborative-journalism-summit-highlights-new-ideas-for-impactful-reporting/", "Home", "TimelineCard", "teal", 43, True, "2017 summit link"),

    ("timeline", "2018_year", "2018", "Home", "TimelineCard", "teal", 44, True, "2018 summit year"),
    ("timeline", "2018_location", "Montclair, NJ", "Home", "TimelineCard", "teal", 45, True, "2018 summit location"),
    ("timeline", "2018_theme", "Building Bridges", "Home", "TimelineCard", "teal", 46, True, "2018 summit theme"),
    ("timeline", "2018_link", "https://collaborativejournalism.org/2018summit/", "Home", "TimelineCard", "teal", 47, True, "2018 summit link"),

    ("timeline", "2019_year", "2019", "Home", "TimelineCard", "cardinal", 48, True, "2019 summit year"),
    ("timeline", "2019_location", "Philadelphia, PA", "Home", "TimelineCard", "cardinal", 49, True, "2019 summit location"),
    ("timeline", "2019_theme", "People Over Projects", "Home", "TimelineCard", "cardinal", 50, True, "2019 summit theme"),
    ("timeline", "2019_link", "https://collaborativejournalism.org/cjs2019/", "Home", "TimelineCard", "cardinal", 51, True, "2019 summit link"),

    ("timeline", "2020_year", "2020", "Home", "TimelineCard", "ink", 52, True, "2020 summit year"),
    ("timeline", "2020_location", "Virtual", "Home", "TimelineCard", "ink", 53, True, "2020 summit location"),
    ("timeline", "2020_theme", "Adapting Together", "Home", "TimelineCard", "ink", 54, True, "2020 summit theme"),
    ("timeline", "2020_link", "https://collaborativejournalism.org/cjs2020/", "Home", "TimelineCard", "ink", 55, True, "2020 summit link"),

    ("timeline", "2021_year", "2021", "Home", "TimelineCard", "ink", 56, True, "2021 summit year"),
    ("timeline", "2021_location", "Virtual", "Home", "TimelineCard", "ink", 57, True, "2021 summit location"),
    ("timeline", "2021_theme", "Removing Barriers", "Home", "TimelineCard", "ink", 58, True, "2021 summit theme"),
    ("timeline", "2021_link", "https://collaborativejournalism.org/cjs2021/", "Home", "TimelineCard", "ink", 59, True, "2021 summit link"),

    ("timeline", "2022_year", "2022", "Home", "TimelineCard", "green-dark", 60, True, "2022 summit year"),
    ("timeline", "2022_location", "Chicago, IL", "Home", "TimelineCard", "green-dark", 61, True, "2022 summit location"),
    ("timeline", "2022_theme", "Building to Last", "Home", "TimelineCard", "green-dark", 62, True, "2022 summit theme"),
    ("timeline", "2022_link", "https://collaborativejournalism.org/cjs2022/", "Home", "TimelineCard", "green-dark", 63, True, "2022 summit link"),

    ("timeline", "2023_year", "2023", "Home", "TimelineCard", "teal", 64, True, "2023 summit year"),
    ("timeline", "2023_location", "Washington, D.C.", "Home", "TimelineCard", "teal", 65, True, "2023 summit location"),
    ("timeline", "2023_theme", "Building Frameworks", "Home", "TimelineCard", "teal", 66, True, "2023 summit theme"),
    ("timeline", "2023_link", "https://collaborativejournalism.org/cjs2023/", "Home", "TimelineCard", "teal", 67, True, "2023 summit link"),

    ("timeline", "2024_year", "2024", "Home", "TimelineCard", "cardinal", 68, True, "2024 summit year"),
    ("timeline", "2024_location", "Detroit, MI", "Home", "TimelineCard", "cardinal", 69, True, "2024 summit location"),
    ("timeline", "2024_theme", "Global Impact", "Home", "TimelineCard", "cardinal", 70, True, "2024 summit theme"),
    ("timeline", "2024_link", "https://collaborativejournalism.org/cjs2024/", "Home", "TimelineCard", "cardinal", 71, True, "2024 summit link"),

    ("timeline", "2025_year", "2025", "Home", "TimelineCard", "green-dark", 72, True, "2025 summit year"),
    ("timeline", "2025_location", "Denver, CO", "Home", "TimelineCard", "green-dark", 73, True, "2025 summit location"),
    ("timeline", "2025_theme", "Partnerships with Purpose", "Home", "TimelineCard", "green-dark", 74, True, "2025 summit theme"),
    ("timeline", "2025_link", "https://collaborativejournalism.org/cjs2025/", "Home", "TimelineCard", "green-dark", 75, True, "2025 summit link"),

    ("timeline", "2026_year", "2026", "Home", "TimelineCard", "gold", 76, True, "2026 summit year"),
    ("timeline", "2026_location", "Chapel Hill, NC", "Home", "TimelineCard", "gold", 77, True, "2026 summit location"),
    ("timeline", "2026_theme", "10th Anniversary", "Home", "TimelineCard", "gold", 78, True, "2026 summit theme"),

    # ===== EXPECT SECTION (What to expect - Home page) =====
    ("expect", "section_headline", "What to expect", "Home", "SectionHeadline", "ink", 80, True, "What to expect headline"),
    ("expect", "monday_label", "Monday: Main summit", "Home", "ExpectCard", "teal", 81, True, "Monday label"),
    ("expect", "monday_items", "8 curated sessions with invited speakers\n8 lightning talks from community pitches\nNetworking opportunities throughout\nEvening dinner and celebration", "Home", "ExpectCard", "teal", 82, True, "Monday items (newline separated)"),
    ("expect", "tuesday_label", "Tuesday: Workshops", "Home", "ExpectCard", "cardinal", 83, True, "Tuesday label"),
    ("expect", "tuesday_items", "Track 1: Collaborating 101\nTrack 2: Advanced collaboration\nHands-on learning and skill building", "Home", "ExpectCard", "cardinal", 84, True, "Tuesday items (newline separated)"),

    # ===== FOOTER SECTION (Global) =====
    ("footer", "signup_headline", "Stay connected", "Global", "Footer", "cream", 90, True, "Newsletter signup headline"),
    ("footer", "signup_description", "Get updates on programming, registration, and more.", "Global", "Footer", "cream", 91, True, "Newsletter signup description"),
    ("footer", "contact_email", "summit@collaborativejournalism.org", "Global", "Footer", "cream", 92, True, "Contact email"),
    ("footer", "website_url", "collaborativejournalism.org", "Global", "Footer", "cream", 93, True, "Website URL"),
    ("footer", "twitter_handle", "@CenterCoopMedia", "Global", "Footer", "cream", 94, True, "Twitter handle"),
    ("footer", "copyright", "2026 Center for Cooperative Media at Montclair State University", "Global", "Footer", "cream", 95, True, "Copyright text"),
    ("footer", "ccm_logo_alt", "Center for Cooperative Media logo", "Global", "Footer", "cream", 96, True, "CCM logo alt text"),
    ("footer", "inn_logo_alt", "Institute for Nonprofit News logo", "Global", "Footer", "cream", 97, True, "INN logo alt text"),

    # ===== SCHEDULE PAGE =====
    ("schedule", "page_headline", "Schedule", "Schedule", "PageHeadline", "ink", 100, True, "Schedule page headline"),
    ("schedule", "page_description", "Two days of sessions, workshops, and networking. Programming details will be announced in spring 2026.", "Schedule", "PageDescription", "ink", 101, True, "Schedule page description"),
    ("schedule", "preliminary_label", "Preliminary schedule", "Schedule", "Badge", "teal", 102, True, "Preliminary schedule label"),
    ("schedule", "preliminary_notice", "Session topics and speakers will be announced in spring 2026. Sign up for updates to be the first to know.", "Schedule", "Notice", "ink", 103, True, "Preliminary schedule notice"),
    ("schedule", "monday_label", "Monday, June 8", "Schedule", "DayLabel", "teal", 104, True, "Monday label"),
    ("schedule", "monday_subtitle", "Main summit day", "Schedule", "DaySubtitle", "teal", 105, True, "Monday subtitle"),
    ("schedule", "tuesday_label", "Tuesday, June 9", "Schedule", "DayLabel", "cardinal", 106, True, "Tuesday label"),
    ("schedule", "tuesday_subtitle", "Workshop day", "Schedule", "DaySubtitle", "cardinal", 107, True, "Tuesday subtitle"),
    ("schedule", "inn_days_title", "Co-located with INN Days", "Schedule", "SectionTitle", "green-dark", 108, True, "INN Days co-location title"),
    ("schedule", "inn_days_description", "INN Days runs June 9-11 at the same venue. Attend both events in one trip.", "Schedule", "SectionDescription", "green-dark", 109, True, "INN Days description"),

    # ===== SPONSORS PAGE =====
    ("sponsors", "page_headline", "Sponsors", "Sponsors", "PageHeadline", "ink", 120, True, "Sponsors page headline"),
    ("sponsors", "page_description", "Support the 10th anniversary Collaborative Journalism Summit and connect with 130+ leaders in collaborative journalism.", "Sponsors", "PageDescription", "ink", 121, True, "Sponsors page description"),
    ("sponsors", "open_label", "Sponsorships now open", "Sponsors", "Badge", "teal", 122, True, "Sponsorships open label"),
    ("sponsors", "open_description", "Be among the first to support the 10th anniversary summit. Sponsors will be recognized here as they are confirmed.", "Sponsors", "Notice", "ink", 123, True, "Sponsorships open description"),
    ("sponsors", "why_sponsor_headline", "Why sponsor the summit?", "Sponsors", "SectionHeadline", "ink", 124, True, "Why sponsor headline"),
    ("sponsors", "milestone_title", "Milestone event", "Sponsors", "BenefitCard", "teal", 125, True, "Milestone benefit title"),
    ("sponsors", "milestone_description", "Be part of our 10th anniversary celebration - a landmark moment in the collaborative journalism movement.", "Sponsors", "BenefitCard", "teal", 126, True, "Milestone benefit description"),
    ("sponsors", "audience_title", "Engaged audience", "Sponsors", "BenefitCard", "teal", 127, True, "Audience benefit title"),
    ("sponsors", "audience_description", "Connect with journalists, editors, funders, and media leaders actively working on collaborative projects.", "Sponsors", "BenefitCard", "teal", 128, True, "Audience benefit description"),
    ("sponsors", "exposure_title", "Dual-event exposure", "Sponsors", "BenefitCard", "teal", 129, True, "Exposure benefit title"),
    ("sponsors", "exposure_description", "Co-located with INN Days means additional visibility to the nonprofit news community.", "Sponsors", "BenefitCard", "teal", 130, True, "Exposure benefit description"),
    ("sponsors", "cta_headline", "Ready to sponsor?", "Sponsors", "SectionHeadline", "cardinal", 131, True, "Sponsor CTA headline"),
    ("sponsors", "cta_description", "Contact us to discuss sponsorship opportunities and receive a full prospectus.", "Sponsors", "SectionDescription", "cardinal", 132, True, "Sponsor CTA description"),
    ("sponsors", "custom_headline", "Custom sponsorship opportunities", "Sponsors", "SectionHeadline", "ink", 133, True, "Custom sponsorships headline"),
    ("sponsors", "custom_description", "Interested in sponsoring a specific element of the summit? We offer custom packages for:", "Sponsors", "SectionDescription", "ink", 134, True, "Custom sponsorships description"),

    # ===== CODE OF CONDUCT PAGE =====
    ("code_of_conduct", "page_headline", "Code of conduct", "Code of Conduct", "PageHeadline", "ink", 140, True, "Code of conduct page headline"),
    ("code_of_conduct", "page_description", "The Collaborative Journalism Summit is dedicated to providing a harassment-free experience for everyone.", "Code of Conduct", "PageDescription", "ink", 141, True, "Code of conduct page description"),
    ("code_of_conduct", "intro", "We are committed to creating a welcoming and inclusive environment for all participants, regardless of gender, gender identity and expression, age, sexual orientation, disability, physical appearance, body size, race, ethnicity, religion, or technology choices.", "Code of Conduct", "IntroText", "ink", 142, True, "Code of conduct intro paragraph"),
    ("code_of_conduct", "expected_headline", "Expected behavior", "Code of Conduct", "SectionHeadline", "teal", 143, True, "Expected behavior headline"),
    ("code_of_conduct", "expected_items", "Participate authentically and actively\nExercise consideration and respect in your speech and actions\nAttempt collaboration before conflict\nRefrain from demeaning, discriminatory, or harassing behavior and speech\nBe mindful of your surroundings and fellow participants\nAlert conference organizers if you notice violations or someone in distress", "Code of Conduct", "List", "teal", 144, True, "Expected behaviors list (newline separated)"),
    ("code_of_conduct", "unacceptable_headline", "Unacceptable behavior", "Code of Conduct", "SectionHeadline", "cardinal", 145, True, "Unacceptable behavior headline"),
    ("code_of_conduct", "unacceptable_items", "Intimidating, harassing, abusive, discriminatory, derogatory, or demeaning speech or actions\nHarmful or prejudicial verbal or written comments related to gender, gender identity, sexual orientation, race, religion, disability\nInappropriate use of nudity and/or sexual images\nDeliberate intimidation, stalking, or following\nSustained disruption of talks or other events\nUnwelcome physical contact or sexual attention\nAdvocating for or encouraging any of the above behaviors", "Code of Conduct", "List", "cardinal", 146, True, "Unacceptable behaviors list (newline separated)"),
    ("code_of_conduct", "reporting_headline", "Reporting", "Code of Conduct", "SectionHeadline", "ink", 147, True, "Reporting headline"),
    ("code_of_conduct", "reporting_text", "If you experience or witness unacceptable behavior, or have any other concerns, please notify a conference organizer as soon as possible. You can reach us at summit@collaborativejournalism.org or speak with any staff member at the registration desk.", "Code of Conduct", "BodyText", "ink", 148, True, "Reporting instructions"),
    ("code_of_conduct", "consequences_headline", "Consequences", "Code of Conduct", "SectionHeadline", "ink", 149, True, "Consequences headline"),
    ("code_of_conduct", "consequences_text", "Anyone asked to stop unacceptable behavior is expected to comply immediately. If a participant engages in unacceptable behavior, the conference organizers may take any action they deem appropriate, up to and including a temporary ban or permanent expulsion from the event without warning or refund.", "Code of Conduct", "BodyText", "ink", 150, True, "Consequences text"),

    # ===== CONTACT PAGE =====
    ("contact", "page_headline", "Contact us", "Contact", "PageHeadline", "ink", 160, True, "Contact page headline"),
    ("contact", "page_description", "Have questions about the Collaborative Journalism Summit? We're here to help.", "Contact", "PageDescription", "ink", 161, True, "Contact page description"),
    ("contact", "email_label", "Email", "Contact", "ContactCard", "teal", 162, True, "Email label"),
    ("contact", "email_value", "summit@collaborativejournalism.org", "Contact", "ContactCard", "teal", 163, True, "Contact email address"),
    ("contact", "email_description", "For general inquiries, sponsorship questions, and press requests", "Contact", "ContactCard", "teal", 164, True, "Email description"),
    ("contact", "twitter_label", "Twitter/X", "Contact", "ContactCard", "ink", 165, True, "Twitter label"),
    ("contact", "twitter_value", "@CenterCoopMedia", "Contact", "ContactCard", "ink", 166, True, "Twitter handle"),
    ("contact", "twitter_description", "Follow us for summit updates and collaborative journalism news", "Contact", "ContactCard", "ink", 167, True, "Twitter description"),
    ("contact", "organizer_headline", "About the organizers", "Contact", "SectionHeadline", "ink", 168, True, "Organizer section headline"),
    ("contact", "ccm_name", "Center for Cooperative Media", "Contact", "OrganizerCard", "teal", 169, True, "CCM name"),
    ("contact", "ccm_description", "A grant-funded program of the School of Communication and Media at Montclair State University. The Center grows and strengthens local journalism in New Jersey and beyond.", "Contact", "OrganizerCard", "teal", 170, True, "CCM description"),
    ("contact", "ccm_url", "https://centerforcooperativemedia.org", "Contact", "OrganizerCard", "teal", 171, True, "CCM website URL"),
    ("contact", "inn_name", "Institute for Nonprofit News", "Contact", "OrganizerCard", "cardinal", 172, True, "INN name"),
    ("contact", "inn_description", "A network of more than 450 nonprofit news organizations. INN supports, connects, and champions public service journalism.", "Contact", "OrganizerCard", "cardinal", 173, True, "INN description"),
    ("contact", "inn_url", "https://inn.org", "Contact", "OrganizerCard", "cardinal", 174, True, "INN website URL"),

    # ===== NAVBAR SECTION (Global) =====
    ("navbar", "brand_text", "CJS 2026", "Global", "Navbar", "ink", 180, True, "Navbar brand text"),
    ("navbar", "home_link", "Home", "Global", "NavLink", "ink", 181, True, "Home nav link text"),
    ("navbar", "schedule_link", "Schedule", "Global", "NavLink", "ink", 182, True, "Schedule nav link text"),
    ("navbar", "sponsors_link", "Sponsors", "Global", "NavLink", "ink", 183, True, "Sponsors nav link text"),
    ("navbar", "contact_link", "Contact", "Global", "NavLink", "ink", 184, True, "Contact nav link text"),
    ("navbar", "code_of_conduct_link", "Code of conduct", "Global", "NavLink", "ink", 185, True, "Code of conduct nav link text"),

    # ===== LOGIN PAGE =====
    ("login", "page_headline", "Sign in", "Login", "PageHeadline", "ink", 190, True, "Login page headline"),
    ("login", "email_label", "Email address", "Login", "FormLabel", "ink", 191, True, "Email field label"),
    ("login", "password_label", "Password", "Login", "FormLabel", "ink", 192, True, "Password field label"),
    ("login", "submit_button", "Sign in", "Login", "Button", "teal", 193, True, "Sign in button text"),
    ("login", "forgot_password_link", "Forgot your password?", "Login", "Link", "teal", 194, True, "Forgot password link text"),
    ("login", "register_prompt", "Don't have an account?", "Login", "Text", "ink", 195, True, "Register prompt text"),
    ("login", "register_link", "Create one", "Login", "Link", "teal", 196, True, "Register link text"),

    # ===== REGISTER PAGE =====
    ("register", "page_headline", "Create an account", "Register", "PageHeadline", "ink", 200, True, "Register page headline"),
    ("register", "name_label", "Full name", "Register", "FormLabel", "ink", 201, True, "Name field label"),
    ("register", "email_label", "Email address", "Register", "FormLabel", "ink", 202, True, "Email field label"),
    ("register", "password_label", "Password", "Register", "FormLabel", "ink", 203, True, "Password field label"),
    ("register", "confirm_password_label", "Confirm password", "Register", "FormLabel", "ink", 204, True, "Confirm password field label"),
    ("register", "submit_button", "Create account", "Register", "Button", "teal", 205, True, "Create account button text"),
    ("register", "login_prompt", "Already have an account?", "Register", "Text", "ink", 206, True, "Login prompt text"),
    ("register", "login_link", "Sign in", "Register", "Link", "teal", 207, True, "Login link text"),

    # ===== DASHBOARD PAGE =====
    ("dashboard", "page_headline", "Dashboard", "Dashboard", "PageHeadline", "ink", 210, True, "Dashboard page headline"),
    ("dashboard", "welcome_message", "Welcome back!", "Dashboard", "WelcomeText", "ink", 211, True, "Dashboard welcome message"),
    ("dashboard", "signout_button", "Sign out", "Dashboard", "Button", "cardinal", 212, True, "Sign out button text"),
]

def create_record(section, field, content, page, component, color, order, visible, name):
    """Create a single Airtable record"""
    payload = {
        "fields": {
            "Section": section,
            "Field": field,
            "Content": content,
            "Page": page,
            "Component": component,
            "Color": color,
            "Order": order,
            "Visible": visible,
            "Name": name  # This was renamed from Notes
        }
    }
    return payload

def get_existing_records():
    """Fetch all existing records and return a dict keyed by Field name"""
    existing = {}
    offset = None

    while True:
        url = BASE_URL
        if offset:
            url += f"?offset={offset}"

        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"Error fetching existing records: {response.status_code}")
            break

        data = response.json()
        for record in data.get("records", []):
            field_name = record["fields"].get("Field", "")
            if field_name:
                existing[field_name] = record["id"]

        offset = data.get("offset")
        if not offset:
            break
        time.sleep(0.2)

    return existing

def batch_upsert_records(records_data):
    """Create or update records in batches of 10 (Airtable limit)"""
    # First, get all existing records
    print("Fetching existing records...")
    existing = get_existing_records()
    print(f"Found {len(existing)} existing records")

    # Separate into creates and updates
    to_create = []
    to_update = []

    for record in records_data:
        payload = create_record(*record)
        field_name = payload["fields"]["Field"]

        if field_name in existing:
            # Update existing record - only update editable content fields
            editable_fields = ["Content", "Color", "Visible"]
            update_payload = {
                "id": existing[field_name],
                "fields": {k: v for k, v in payload["fields"].items() if k in editable_fields}
            }
            to_update.append(update_payload)
        else:
            # Create new record
            to_create.append(payload)

    # Deduplicate updates (keep last occurrence if same record appears multiple times)
    seen_ids = {}
    for update in to_update:
        seen_ids[update["id"]] = update
    to_update = list(seen_ids.values())

    print(f"Records to create: {len(to_create)}")
    print(f"Records to update: {len(to_update)}")

    created_count = 0
    updated_count = 0

    # Create new records in batches
    if to_create:
        batches = [to_create[i:i+10] for i in range(0, len(to_create), 10)]
        for i, batch in enumerate(batches):
            print(f"Creating batch {i+1}/{len(batches)} ({len(batch)} records)...")
            response = requests.post(
                BASE_URL,
                headers=headers,
                json={"records": batch}
            )
            if response.status_code == 200:
                result = response.json()
                created_count += len(result.get("records", []))
            else:
                print(f"  Error: {response.status_code} - {response.text}")
            time.sleep(0.25)

    # Update existing records in batches
    if to_update:
        batches = [to_update[i:i+10] for i in range(0, len(to_update), 10)]
        for i, batch in enumerate(batches):
            print(f"Updating batch {i+1}/{len(batches)} ({len(batch)} records)...")
            response = requests.patch(
                BASE_URL,
                headers=headers,
                json={"records": batch}
            )
            if response.status_code == 200:
                result = response.json()
                updated_count += len(result.get("records", []))
            else:
                print(f"  Error: {response.status_code} - {response.text}")
            time.sleep(0.25)

    return created_count, updated_count

def update_existing_records():
    """Update existing records with Page field"""
    # Get all existing records
    response = requests.get(BASE_URL, headers=headers)
    if response.status_code != 200:
        print(f"Error fetching records: {response.status_code}")
        return

    records = response.json().get("records", [])
    updates = []

    for record in records:
        section = record["fields"].get("Section", "")
        # Determine page based on section
        if section in ["hero", "details", "history", "stats", "timeline", "expect"]:
            page = "Home"
        elif section == "footer":
            page = "Global"
        elif section == "schedule":
            page = "Schedule"
        elif section == "sponsors":
            page = "Sponsors"
        elif section == "contact":
            page = "Contact"
        elif section == "code_of_conduct":
            page = "Code of Conduct"
        else:
            page = "Home"  # Default

        updates.append({
            "id": record["id"],
            "fields": {
                "Page": page,
                "Visible": True
            }
        })

    # Update in batches
    batches = [updates[i:i+10] for i in range(0, len(updates), 10)]
    updated_count = 0

    for i, batch in enumerate(batches):
        print(f"Updating batch {i+1}/{len(batches)}...")
        response = requests.patch(
            BASE_URL,
            headers=headers,
            json={"records": batch}
        )
        if response.status_code == 200:
            updated_count += len(batch)
        else:
            print(f"  Error: {response.text}")
        time.sleep(0.25)

    print(f"Updated {updated_count} existing records")

if __name__ == "__main__":
    print("=" * 50)
    print("Populating Airtable Site Content table")
    print("=" * 50)

    # Upsert all records (create if new, update if exists)
    print(f"\nProcessing {len(content_records)} records...")
    created, updated = batch_upsert_records(content_records)

    print("\n" + "=" * 50)
    print(f"Done! Created {created} new records, updated {updated} existing records.")
    print("=" * 50)
