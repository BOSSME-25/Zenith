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

## 3. The admin sections

### Families
Parents/guardians who joined the interest list to enroll a student. Includes parent name, email, phone, student name, current grade, expected entry grade, ZIP code, and how they heard about Zenith.

### Community
Community supporters who signed up to back Zenith — neighbors, educators, allies. Shows their role(s), interests, and ZIP code.

### Partners
Organizations interested in partnering (sponsorships, internships, dual enrollment, etc.). Shows the organization, contact person, and a description of what they bring.

### Contacts
Messages submitted through the "Contact us" form on the site. Each entry has a name, email, subject, and message.

### Newsletter
The Comet Trail issues — create, edit, publish, and archive the newsletter that appears on the public site. (See section 5b.)

### Subscribers
People who signed up on the Newsletter page. Each entry has an optional name and an email. (See section 5b.)

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

### Adding pictures to a post

1. While writing or editing an update, click your cursor in the **Body** where you want the photo to appear
2. Click the **Add image** button (just above the Body box)
3. Choose a photo from your computer (JPG, PNG, WebP, or GIF, up to 10 MB)
4. It uploads and is inserted automatically as `![caption](link)` — leave that text as-is; it becomes the picture on the published page
5. The text inside the square brackets (the file name by default) shows as a small caption under the photo — you can edit it to whatever caption you like
6. Click **Publish update** (or **Save update**) — the photo appears full-width on the live page

> Photos are stored securely in the site's cloud storage. You can add several images to one post — just repeat the steps for each.

---

## 5b. The Newsletter — "The Comet Trail"

The public **Newsletter** page (zenithccprep.org/newsletter) shows the latest published issue of The Comet Trail. You write and edit issues entirely from the admin — no developer needed.

### Creating or editing an issue

1. In the admin sidebar, click **Newsletter**
2. Click **New issue** (or **Edit** next to an existing one)
3. Fill in the sections — each one maps to a spot in the newsletter layout:
   - **Issue** — issue number and month label (e.g. "September 2027")
   - **Top story** — lead photo, headline, a sentence or two, and an optional button
   - **From Dr. Samant** — a short, warm founder note
   - **Comet Spotlight** — a student/family photo, name, and a few sentences
   - **What's Happening** — up to three events with date, title, details, and link
   - **Inside the Classroom** — a short look at a project
   - **Big number** — one milestone, stated plainly (e.g. "100%" + a sentence)
4. Any section you leave blank is simply hidden on the page — no broken layout
5. Photos: click **Upload photo** in a section to add an image from your computer
6. Check **Published** and click **Save issue** — it's live immediately at zenithccprep.org/newsletter

Leave **Published** unchecked to save a draft only you can see in the admin.

When you publish a newer issue, the previous one automatically moves into the **Past issues** archive at the bottom of the newsletter page.

### Subscribers

People who enter their email on the Newsletter page are saved under **Subscribers** in the admin sidebar (search, export CSV, delete — same as other lists). The same person signing up twice never creates a duplicate.

### Emailing the newsletter

The website publishes the newsletter on the site and collects subscriber emails. To also send it as an email:

1. Click **Subscribers** → **Export CSV**
2. Import the list into your email tool (Mailchimp, Constant Contact, etc.)
3. Send from there — you can link readers to zenithccprep.org/newsletter

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
| Publish or edit the newsletter | **Newsletter** → New issue / Edit |
| Download newsletter subscribers | **Subscribers** → Export CSV |
| View survey responses | Google Drive → your Zenith form response sheet |
| Reply to a contact message | **Contacts** → copy their email → reply from your own inbox |
| Add a photo to an Updates post | **Updates** → New/Edit → **Add image** button |
| Change a homepage photo or hero image | Email Emily |

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
