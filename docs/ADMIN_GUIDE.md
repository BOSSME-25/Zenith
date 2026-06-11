# Zenith Admin Guide

A quick-start manual for managing zenithccprep.org.

---

## 1. Logging in

1. Go to **https://zenithccprep.org/admin**
2. Enter the admin password.
3. You'll land on the **Dashboard**.

You'll stay logged in for ~7 days. Click **Logout** in the bottom-left at any time to sign out.

> **If you forget the password:** contact Emily — it's stored in Vercel and can be reset there.

---

## 2. The Dashboard

The Dashboard is your home screen. It shows:

- **Tile counters** — how many submissions you've received in each category
- **Recent submissions** — the five most recent entries across all forms

Click any tile or any row to drill into the full list.

---

## 3. The six sections

### Families
Parents/guardians who joined the interest list to enroll a student. Includes parent name, email, phone, student name, current grade, expected entry grade, ZIP code, and how they heard about Zenith.

### Community
Community supporters who signed up to back Zenith — neighbors, educators, allies. Shows their role(s), interests, and ZIP code.

### Partners
Organizations interested in partnering (sponsorships, internships, dual enrollment, etc.). Shows the organization, contact person, and a description of what they bring.

### Contacts
Messages submitted through the "Contact us" form on the site. Each entry has a name, email, subject, and message.

### Newsletter
People who signed up on the **Newsletter** page to be notified when the Zenith newsletter launches. Each entry has an optional name and an email. (See section 5b.)

### Updates
The blog/announcements posts that appear on the public **/updates** page. (See section 5.)

---

## 4. What you can do on each submissions page

Inside Families, Community, Partners, Contacts, or Newsletter you can:

- **Search** — type into the search box to filter the table
- **View detail** — every column is visible on the row
- **Export CSV** — click "Export CSV" in the top right. This downloads every entry in that section as a spreadsheet you can open in Excel or Google Sheets
- **Delete** — click the trash icon next to a row to remove it (use sparingly; this is permanent)

---

## 5. Creating Updates (blog posts)

Updates are public announcements that appear at **zenithccprep.org/updates** and are linked from the site header and footer.

### To create a new update:

1. In the admin sidebar, click **Updates**
2. Click **New update** in the top right
3. Fill in:
   - **Title** — what readers see (e.g., "We submitted our charter application")
   - **Slug** — the URL path (e.g., `charter-submitted` — keep it short, no spaces). The site auto-generates one from the title; you can edit it.
   - **Body** — the post content. Plain text or basic Markdown (`**bold**`, `# Heading`, blank lines for paragraphs)
   - **Publish date** — defaults to today
   - **Published** — leave checked to make it visible immediately, or uncheck to save as a draft
4. Click **Publish update**

The post is now live at `zenithccprep.org/updates/your-slug`.

### To edit or unpublish an existing update:

1. Go to **Updates** in the sidebar
2. Click the **Edit** link on the row you want to change
3. Make your changes (or uncheck "Published" to hide it)
4. Click **Save update**

### Good update topics:

- Charter application milestones
- Community engagement moments ("Visited Arizona Educational Foundation today")
- Board appointments or partnership announcements
- Calls to action ("Survey now available in Spanish — please share")
- Behind-the-scenes from school design work

> **Adding pictures:** the Updates editor is text-only right now — there's no image upload yet. If you'd like to add photos to posts, ask your developer to turn on image uploads.

---

## 5b. The Newsletter

The public **Newsletter** page (linked in the top menu) is a "coming soon" page where visitors enter their email to be notified when the first Zenith newsletter goes out.

### How it works

- Visitors enter their name (optional) and email on **zenithccprep.org/newsletter**.
- Every signup is saved automatically and appears under **Newsletter** in the admin sidebar.
- The same person signing up twice will not create a duplicate.

### When you're ready to send your first newsletter

1. In the admin sidebar, click **Newsletter**
2. Click **Export CSV** to download the full subscriber list
3. Import that CSV into your email tool (Mailchimp, Constant Contact, etc.) and send from there

> The website collects and stores the signups; sending the actual newsletter emails is done from a separate email tool once you choose one.

---

## 6. The Community Survey

The community survey lives on **https://zenithccprep.org/get-involved#survey** and is powered by Google Forms (English + Spanish).

- **Responses go to Google**, not the admin panel. View them in your Google Drive in the response spreadsheet linked to the form.
- To update the survey questions, edit the Google Form directly. Changes appear on the site immediately — no redeployment needed.
- The form URL on the site is fixed; if you ever replace the form with a new one, ask Emily to update the embed.

---

## 7. Public site sections

These are the parts of zenithccprep.org that visitors see. Content for these pages is currently maintained by Emily in the codebase — to change copy, photos, or board bios, send the requested changes to Emily.

- **Home** — Hero, what makes Zenith different, core values, community, partners
- **Our Story** — Mission, vision, why-now, community engagement
- **School Model** — Academics, AP-first pathway, advisory, Elevate block, career pathways, financial literacy
- **Our Board** — Founder bio + board members with expandable bios
- **FAQ** — Common questions, grouped by topic
- **Get Involved** — Audience cards (Families / Community / Partners) + survey + sign-up forms
- **Updates** — Blog posts you create (see section 5)
- **Newsletter** — Coming-soon page collecting email signups (see section 5b)
- **Contact** — Reaches the Contacts inbox in admin

---

## 8. Common tasks at a glance

| I want to… | Where to go |
|---|---|
| See how many families have signed up | Dashboard (or click **Families**) |
| Email everyone who joined the interest list | **Families** → Export CSV → mail merge from spreadsheet |
| Post an announcement | **Updates** → New update |
| Download newsletter subscribers | **Newsletter** → Export CSV |
| View survey responses | Google Drive → your Zenith form response sheet |
| Reply to a contact message | **Contacts** → copy their email → reply from your own inbox |
| Add a photo to the site or a post | Email Emily (image upload not built yet) |

---

## 9. Quick troubleshooting

**"Application error" on /admin**
The database may be temporarily unreachable. Wait a minute and reload. If it persists, contact Emily.

**Login keeps failing**
- Check Caps Lock
- Make sure the password matches exactly (no leading/trailing space)
- If you copied it from a message, retype it manually

**Update I published isn't showing on /updates**
- Confirm "Published" is checked
- Confirm the publish date isn't in the future
- Hard-refresh the public page (Cmd+Shift+R)

**CSV export downloads an empty file**
That section genuinely has no submissions yet — not an error.

---

*Last updated: May 2026*
