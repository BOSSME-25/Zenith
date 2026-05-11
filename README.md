# Zenith College and Career Prep — Website

A Next.js 15 (App Router) marketing + admin site for **Zenith College and Career Prep**, an early-college STEAM high school being designed with the Maryvale community of Phoenix, currently in the application phase with the Arizona State Board for Charter Schools.

## Stack

- **Framework**: Next.js 15 (App Router, React 19, Server Components)
- **Styling**: Tailwind CSS 4 (CSS-based `@theme` in `app/globals.css`)
- **Typography**: Montserrat via `next/font/google` (Light/Regular/Medium/SemiBold/Bold)
- **Database**: Postgres via `@vercel/postgres` *(see "Database driver migration" below)*
- **Email**: Resend (`resend` npm package)
- **Forms**: Server Actions + Zod validation
- **Admin auth**: HMAC-signed httpOnly cookie gated on `ADMIN_PASSWORD`
- **Icons**: lucide-react

## Local setup

```bash
npm install
cp .env.local.example .env.local
# Fill in real values for at least ADMIN_PASSWORD (everything else is optional
# for local dev — DB and email gracefully no-op when unset).
npm run dev
```

Open <http://localhost:3000>.

### Graceful fallbacks

The site is designed to **build and run with zero env vars set**:

- If `POSTGRES_URL` is not set, every database call is a no-op. Submissions return success messages but are **not persisted**. Admin lists render empty states.
- If `RESEND_API_KEY` is not set, emails are logged to the dev console instead of sent. Form submissions still succeed.
- If `ADMIN_PASSWORD` is not set, the admin login is **disabled** (intentional).

When you're ready to wire things up, add the variables to `.env.local` and restart `npm run dev`.

## Initializing the database

After `POSTGRES_URL` and `ADMIN_PASSWORD` are set:

```bash
# locally
curl -X POST "http://localhost:3000/api/init?password=YOUR_ADMIN_PASSWORD"

# in production (after deploy)
curl -X POST "https://zenithprep.org/api/init?password=YOUR_ADMIN_PASSWORD"
```

You can also visit the URL in a browser. The route is idempotent — it uses `CREATE TABLE IF NOT EXISTS` for all six tables (`families`, `community`, `partners`, `surveys`, `contacts`, `updates`).

## Admin

- Sign in at `/admin/login` with `ADMIN_PASSWORD`.
- Dashboard, per-table list views, CSV export, and updates CRUD all live under `/admin/*`.
- Sign out clears the auth cookie.

CSV exports stream from `/api/admin/export/{families|community|partners|surveys|contacts}` and require an authenticated admin session.

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the project on Vercel.
3. Set environment variables in **Project → Settings → Environment Variables**:
   - `POSTGRES_URL` (provision a Postgres integration from the Vercel Marketplace, e.g. Neon)
   - `RESEND_API_KEY`, `EMAIL_FROM`, `NOTIFICATION_EMAIL`
   - `ADMIN_PASSWORD`, optionally `AUTH_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
4. Deploy.
5. Run `POST /api/init?password=…` once to create tables.

## Project structure

```
app/
  layout.tsx                     # Root: <html>, fonts, metadata
  globals.css                    # Tailwind theme (brand colors, typography)
  (site)/                        # Public site (header + footer)
    layout.tsx
    page.tsx                     # Home
    our-story/page.tsx
    our-board/page.tsx
    faq/page.tsx
    get-involved/page.tsx
    contact/page.tsx
    updates/page.tsx
    updates/[slug]/page.tsx
  admin/
    login/page.tsx               # Public-facing login
    (panel)/                     # Auth-gated admin shell
      layout.tsx
      page.tsx                   # Dashboard
      families/page.tsx
      community/page.tsx
      partners/page.tsx
      surveys/page.tsx
      contacts/page.tsx
      updates/page.tsx           # Manage posts
      updates/new/page.tsx
      updates/[id]/edit/page.tsx
  actions/                       # Server actions
    family.ts community.ts partner.ts survey.ts contact.ts update.ts
  api/
    init/route.ts                # DB initialization (password-gated)
    admin/login/route.ts
    admin/logout/route.ts
    admin/export/[type]/route.ts # CSV export
components/                      # Shared UI
  Header.tsx Footer.tsx Logo.tsx Section.tsx CometBackdrop.tsx BoardSilhouette.tsx
  forms/                         # FamilyForm, CommunityForm, PartnerForm, SurveyForm, ContactForm, FormStatus, SubmitButton
  admin/                         # SubmissionTable, UpdateForm, LoginForm, LogoutButton, DeleteUpdateButton
lib/
  db.ts                          # Postgres client + safeSql/safeQuery + initDatabase
  email.ts                       # Resend wrapper + branded HTML templates
  auth.ts                        # HMAC cookie auth
  validators.ts                  # Zod schemas + ActionState helpers
  cn.ts
middleware.ts                    # Gates /admin/* (admin/login excluded)
public/brand/                    # Logo PNGs (full-dark, full-light, mark, wordmark variants, shield variants)
_source/                         # Original source materials (brand guidelines, strategy memo, punch list) — git-ignored
```

## Brand specs (applied)

| Token | Value | Use |
| --- | --- | --- |
| `midnight` | `#06243F` | Primary navy |
| `ion` | `#BEE5EE` | Light blue accent |
| `eventide` | `#42778C` | Mid teal-blue |
| `aurora` | `#6AAD8D` | Green-blue accent |
| `ion-soft` | `#EFF8FB` | Near-white background |
| `midnight-soft` | `#C1C8CF` | Functional grey |
| `--font-sans` | Montserrat | Body + headings |

Tailwind 4 generates utilities from these tokens (e.g. `bg-midnight`, `text-eventide`, `border-ion`). Expanded tints (`*-75`, `*-50`, `*-25`) follow the guideline's percentage scale.

## Content gaps (team to provide)

Items the site is rendering with placeholder treatments:

1. **Board headshots** — currently rendered as branded silhouettes. Drop final headshots into `/public/board/{firstname-lastname}.jpg`, then wire them into `app/(site)/our-board/page.tsx`.
2. **Full founder + board bios** — currently render "Full bio coming soon." Provide bio copy and we'll switch the placeholder text out.
3. **Hero photography** — intentionally **not** included (no AI imagery, no unlicensed photography). Currently using a brand-colored SVG comet motif. Replace with licensed photography of Maryvale or community work when available.
4. **Charter timeline milestones** — `/updates` is empty until the first post is published from `/admin/updates/new`.
5. **Specific opening date** — the FAQ says "Target opening: Fall 2027". Tighten this once authorization timeline is firm.
6. **Verified Resend sender domain** — `EMAIL_FROM` needs to point to a domain verified on your Resend account.

## Database driver migration

`@vercel/postgres` is marked deprecated as of early 2026. It still works against any standard Postgres connection string. When you're ready to swap, the canonical Vercel migration target is **`@neondatabase/serverless`** (one-click via `vercel integration add neon`). The query surface in `lib/db.ts` is intentionally narrow — `safeSql` (template tag) and `safeQuery` (positional params) — so the driver swap should be a single-file change.

## Acceptance checklist

- [x] Responsive on mobile, tablet, desktop
- [x] All five forms submit through Server Actions (Family, Community, Partner, Survey, Contact)
- [x] Submissions persist to Postgres when configured, no-op safely when not
- [x] Notification + confirmation emails sent via Resend when configured
- [x] Admin login → httpOnly cookie → middleware protects `/admin/*`
- [x] CSV export per submission type
- [x] Updates CRUD (create / edit / delete) from `/admin/updates`
- [x] Brand colors + Montserrat applied via Tailwind config
- [x] No AI-generated or unlicensed photography
- [x] TypeScript strict mode (no `any` in app code)
- [x] `npm run build` succeeds with zero errors

## Scripts

```bash
npm run dev      # local dev with HMR
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint
```
