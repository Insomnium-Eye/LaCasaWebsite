# La Casa Oaxaca

The website and back office for **La Casa Oaxaca**: private bungalows, a room in the main residence, and the entire home, for rent in San Felipe del Agua, Oaxaca, Mexico. It's live at **[oaxaca-rental.com](https://oaxaca-rental.com)**.

The site does four jobs:

1. **Marketing:** units, amenities, gallery, tours, things to do, FAQ. Everything is in English and Spanish.
2. **Bookings and availability:** live room availability synced with **Airbnb's calendar** (and Booking.com), long-term lease inquiries, and manual bookings by the admin.
3. **A guest portal:** guests log in with their door lock code and a password to request cleaning, transport, stay extensions or maintenance, cancel, leave a review, and manage their profile.
4. **Payments through Stripe:** private transport trips paid by card, and long-term tenants' **rent charged automatically on the 1st of each month**.

> **Working on this repo? Read [Engineering rules](#engineering-rules) and follow the [Commit checklist](#commit-checklist) before and after every commit.**

---

## Contents

- [Tech stack](#tech-stack)
- [How it works](#how-it-works)
  - [Airbnb calendar integration](#airbnb-calendar-integration)
  - [Guest portal and logins](#guest-portal-and-logins)
  - [Payments](#payments)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [Engineering rules](#engineering-rules)
- [Commit checklist](#commit-checklist)
- [Project map](#project-map)
- [Database](#database)
- [To-dos](#to-dos)

---

## Tech stack

| Area | What we use |
|---|---|
| Framework | Next.js 16 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL hosted on Supabase, queried from the server with `postgres` (postgres.js) |
| Payments | Stripe Checkout, Subscriptions and Billing Portal |
| Email | Resend |
| WhatsApp | Twilio |
| Door locks | TTLock Open API (timed passcodes on the front gate) |
| ID checks | Google Cloud Vision (document detection) and OFAC sanctions-list screening |
| Hosting | Vercel, deployed by GitHub Actions; scheduled jobs run as Vercel crons |

---

## How it works

### Airbnb calendar integration

Room availability stays in sync with Airbnb and Booking.com through **iCal feeds** in both directions, so a night booked anywhere is blocked everywhere.

```
Airbnb / Booking.com ──iCal──▶ /api/calendar/import (daily cron) ──▶ external_blocks table
                                                                          │
our reservations + bookings ──────────────────────────────────────────────┤
                                                                          ▼
                              /api/availability/[unit]  ──▶  date pickers on the site
                              /api/calendar/[unit]      ──iCal──▶ Airbnb / Booking.com
```

- **Importing.** Each unit's Airbnb and Booking.com iCal URLs are stored in the `calendar_feeds` table. Every day at 06:00 UTC, the `/api/calendar/import` cron fetches them and saves the blocked dates into `external_blocks`.
- **Exporting.** `/api/calendar/[unitSlug]` publishes an iCal feed of our own reservations. Paste that URL into Airbnb's "Import calendar" setting so that direct and portal bookings block Airbnb's calendar too.
- **Live availability.** `/api/availability/[unitSlug]` merges our bookings with the imported blocks. It adds a **2-day cleaning buffer** after every stay.
- **Live Airbnb lookup.** `/api/airbnb-availability/[slug]` reads a unit's Airbnb iCal directly (from the `AIRBNB_ICAL_*` environment variables). The unit pop-up uses it to show the next free dates, and its "Book" button links to that unit's Airbnb listing.
- **Inbound reservations.** `/api/booking-webhook` (from Make.com or Zapier) and `/api/bookingcom-webhook` record platform reservations in our database and email the admin.

### Guest portal and logins

- Guests log in at `/portal` with their **4-digit door lock code**, plus a **password**. Their email, phone number or a username also work in place of the lock code.
- Every account starts with the shared default password from the `GUEST_DEFAULT_PASSWORD` environment variable. A guest who chooses their own password in **User Profile** gets it stored as an scrypt hash.
- The admin logs into the same portal with the admin code, plus the admin password. The admin can change that password under **User Profile**; its hash is stored in `admin_credentials`.
- After login the server issues a signed session token (a JWT), which lasts `JWT_EXPIRY_HOURS` (default 4).
- Lock codes are generated when a booking is added or confirmed. Confirming a booking request also programs the code into the front gate through TTLock. After checkout, the nightly `/api/cron/expire-checkouts` job retires the lock code by setting it to the sentinel `0000`, which can never log in.

### Payments

All card handling happens on **Stripe-hosted pages**. Card numbers never reach our servers or database.

- **Transport trips.** `/api/transport/checkout` works out the price **on the server** from `lib/transportPricing.ts`, then opens a Stripe Checkout session. When the webhook confirms payment, the trip is recorded and confirmation emails go out.
- **Tenant rent.** The admin adds a tenant at `/admin/tenants`, and the tenant receives a permanent signed link. That link opens Stripe Checkout in "setup" mode to save a card. The webhook then creates a subscription that charges on the 1st of each month at 09:00 Oaxaca time, and cancels itself after the lease's last month. The same link later opens Stripe's billing portal so the tenant can update their card.
- **Webhook.** `/api/stripe/webhook` verifies Stripe's signature on every event. It must be subscribed to `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed` and `customer.subscription.deleted`.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in values (never commit .env.local)
npm run dev                  # http://localhost:3000
```

Other commands:

| Command | What it does |
|---|---|
| `npx tsc --noEmit` | Type-check the project |
| `npm run build` | Production build (also catches Next.js route and page errors) |
| `npm run lint` | Lint |

**Database setup:** run `db/schema.sql`, then each file in `db/migrations/` **in number order**, in the Supabase SQL Editor.

---

## Environment variables

Set these in **Vercel → Settings → Environment Variables** (Production), and in `.env.local` for local development. `.env.example` lists them with placeholder values. **Never put real values in the repo**, because it's public.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (Supabase pooler) |
| `ADMIN_PORTAL_CODE` | Admin code: unlocks `/admin/*` pages and the admin login on `/portal` |
| `ADMIN_TOKEN_SECRET` | Signs one-click booking approve/reject links and tenant rent links. **Changing it breaks links already sent.** |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Basic-auth login for the review moderation API |
| `GUEST_DEFAULT_PASSWORD` | Shared starting password for guest (and admin) portal logins |
| `NEXT_PUBLIC_JWT_SECRET` | Signs guest portal session tokens (see [To-dos](#to-dos): should be renamed) |
| `JWT_EXPIRY_HOURS` | Portal session length (default 4) |
| `RATE_LIMIT_ATTEMPTS`, `RATE_LIMIT_WINDOW_MINUTES` | Portal login rate limit (default 10 attempts per 15 minutes) |
| `STRIPE_SECRET_KEY` | Stripe API key (`sk_test_…` or `sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the Stripe webhook endpoint |
| `RESEND_API_KEY` | Sending email |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | WhatsApp messages |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp contact button |
| `TTLOCK_CLIENT_ID`, `TTLOCK_CLIENT_SECRET`, `TTLOCK_USERNAME`, `TTLOCK_PASSWORD` | Front gate door codes |
| `GOOGLE_CLOUD_VISION_API_KEY` | ID document checks |
| `AIRBNB_ICAL_BUNGALOW_1`, `AIRBNB_ICAL_BUNGALOW_2`, `AIRBNB_ICAL_MAIN_BEDROOM` | Each unit's private Airbnb iCal export URL |
| `BOOKING_WEBHOOK_SECRET` | Shared secret for `/api/booking-webhook` |
| `CRON_SECRET` | Authenticates Vercel cron calls |
| `NEXT_PUBLIC_BASE_URL` | Public site URL used in emailed links |
| `NEXT_PUBLIC_CLEANING_FEE` | Cleaning fee shown in the portal |

Anything prefixed `NEXT_PUBLIC_` can end up in the browser. **Secrets must never use that prefix.**

---

## Deployment

- **Every push to `main` deploys.** It runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which pulls Vercel's Production environment variables, builds, and deploys to Vercel.
- **Vercel's "Redeploy" button doesn't work** for these prebuilt deployments. To redeploy without a code change (for example, after changing an environment variable), go to **GitHub → Actions → Deploy to Vercel → Run workflow**.
- **Database migrations are run by hand** in the Supabase SQL Editor. Run them **before** pushing code that depends on them.
- **Crons** are defined in [`vercel.json`](vercel.json):
  - calendar import at 06:00 UTC
  - expiring checked-out lock codes at 07:00 UTC
  - checkout reminders at 16:00 UTC

---

## Engineering rules

### 1. Protect user data

We hold guests' names, emails, phone numbers, door codes, ID check results and payment status. Assume someone will try to steal them, and assume one layer can fail.

- **Every API route checks who is calling, before doing anything else.**
  - Guest routes verify the session JWT.
  - Admin routes check the admin code, an HMAC link token, or basic auth.
  - Webhooks verify a signature or shared secret.
  - Cron routes check `CRON_SECRET`.
  - A route without a check must be deliberately public, and its code must say so.
- **Guests only see their own data.** Always take the reservation ID from the verified token, never from the request body or URL.
- **Validate every input on the server** with `zod` (or an equivalent strict check). The client-side checks are only for convenience.
- **Only parameterized SQL.** Use postgres.js tagged templates (`` sql`... ${value}` ``). Never build SQL from strings, and never pass user input to `sql.unsafe`.
- **Escape user text placed in HTML emails** with `escapeHtml` from `lib/rent.ts`.
- **Passwords are stored only as scrypt hashes** (`lib/password.ts`) and compared in constant time. Never log, email or return a password or hash.
- **Login errors don't reveal which part was wrong.** Show "Incorrect lock code or password", never "no such lock code".
- **API responses and logs contain the minimum personal data.** Don't send extracted ID data back to the browser, and don't log full payloads containing personal data.
- **Secrets only live in environment variables.** No keys, codes, iCal URLs, personal emails or phone numbers in the code or docs; the repo is public. Secrets never get the `NEXT_PUBLIC_` prefix.
- **Every new database table gets row-level security**, so it can't be reached through Supabase's public API. Put this at the end of every migration that creates a table:

  ```sql
  REVOKE ALL ON <table> FROM anon, authenticated;
  ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
  CREATE POLICY server_only ON <table> FOR ALL USING (true) WITH CHECK (true);
  ```

- **Signed links** (admin approve/reject, tenant rent setup) use HMAC tokens, checked with a constant-time comparison.

### 2. Payment safety

- **Card data never touches our code.** Use only Stripe-hosted pages (Checkout and the Billing Portal).
- **Prices are always worked out on the server** from our own price tables. Never trust an amount sent by the browser.
- **Payment results come only from verified Stripe webhooks**, never from redirect pages or query strings.
- **Webhook handlers must be idempotent**, because Stripe retries events. Claim rows atomically, use unique keys such as the invoice ID, and pass idempotency keys to Stripe create calls. Return a 500 only when a retry should happen.
- **Test in a Stripe sandbox** before changing anything that charges live cards.

### 3. Reuse over repetition

We treat shared modules as reusable objects: one source of truth, used everywhere.

- **Search `lib/`, `hooks/`, `components/` and `data/` before writing something new.** Extend an existing helper rather than copying it.
- **Shared logic goes in `lib/`.** Database queries go in `lib/supabase-helpers.ts`, auth in `lib/guest-auth.ts` and `lib/password.ts`, pricing in `lib/transportPricing.ts`, rent in `lib/rent.ts`.
- **Shared UI goes in `components/`.** Shared types go in `types/`. Static business data, such as units and rates, goes in `data/`.
- **When the same code shows up a second time, extract it into a helper.** When you replace code, delete the old version rather than leaving it unused.
- **Keep files focused.** Route handlers should validate, call helpers, and respond.

### 4. Product conventions

- **Bilingual.** Every visitor- or guest-facing string needs English and Spanish, through `lib/translations.ts` or the `language` value from `useLanguage()`.
- **Dates.** Stay dates are calendar dates (`YYYY-MM-DD`). Do date maths in UTC so the visitor's timezone can't shift a day. Oaxaca is UTC-6 with no daylight saving time.
- **Portal tabs must work for the admin login.** It has no reservation, so its check-in and check-out are empty. Tabs must render without crashing.

---

## Commit checklist

Go through this before and after every commit. AI assistants working on this repo must follow it too (see [`CLAUDE.md`](CLAUDE.md)).

### Before committing

1. **Review the diff** with `git status` and `git diff`. It should contain only the intended changes, with no stray debug code.
2. **Scan for secrets and personal data.** There should be no `.env*` files, `sk_live`/`sk_test`/`whsec_` keys, passwords, admin or lock codes, iCal URLs, real emails or phone numbers.
3. **Security pass** against [rules 1 and 2](#1-protect-user-data). Check that:
   - every new or changed route has an auth check
   - inputs are validated
   - SQL is parameterized
   - text in emails is escaped
   - no personal data appears in responses or logs
   - payment amounts are worked out on the server
   - webhooks are verified and idempotent
4. **Reuse pass** against [rule 3](#3-reuse-over-repetition): no duplicated logic, and replaced code is deleted.
5. **Bilingual and admin check:** new text has both languages, and portal changes render for the admin login.
6. **Type-check and build:** `npx tsc --noEmit` and `npm run build` must both pass.
7. **Database changes:** add a new numbered migration in `db/migrations/`. Use `IF NOT EXISTS` so it can safely run twice, and include the row-level security lines for new tables. Note that it must be run in Supabase **before** deploying.
8. **New environment variables:** add them to `.env.example` (placeholder value only) and to the table above, and set them in Vercel **before** deploying.
9. **Update this README.** Keep the [Project map](#project-map), [Database](#database) and [To-dos](#to-dos) current.
10. **Write a clear commit message:** what changed and why.

### After committing

1. **Run any pending migrations** in Supabase and set any new Vercel environment variables, if you haven't already.
2. **Push to `main`**, then watch **GitHub → Actions** until the deploy shows a green ✓.
3. **Test the changed feature on [oaxaca-rental.com](https://oaxaca-rental.com)**, including a guest login and the admin login if the portal changed.
4. **If payments changed,** check Stripe → Developers → Webhooks: recent deliveries should be **200**.
5. **Check Vercel's logs** for new errors.
6. **Update the [To-dos](#to-dos):** tick off what's done and add anything you found.

---

## Project map

### Pages (`app/`)

| Route | File | What it is |
|---|---|---|
| `/` | `app/page.tsx` | Home page: hero slideshow, unit cards with live availability, entire home, things to do, gallery, contact, lease application |
| `/about` | `app/about/page.tsx` | About the property |
| `/amenities` | `app/amenities/page.tsx` | Amenities |
| `/units` | `app/units/page.tsx` | All units, with details pop-up, availability and lease application |
| `/gallery` | `app/gallery/page.tsx` | Filterable photo gallery |
| `/faq` | `app/faq/page.tsx` | Frequently asked questions |
| `/contact` | `app/contact/page.tsx` | Contact form |
| `/tours` | `app/tours/page.tsx` | Tours and excursions |
| `/transport` | `app/transport/page.tsx` | Private transport: destinations, prices, pay by card |
| `/transport/success` | `app/transport/success/page.tsx` | Shown after a transport payment |
| `/book` | `app/book/page.tsx` | Long-term lease inquiry |
| `/book/confirmation` | `app/book/confirmation/page.tsx` | Shown after an inquiry |
| `/booking` | `app/booking/page.tsx` | Old booking form; not linked anywhere (see [To-dos](#to-dos)) |
| `/portal` | `app/portal/page.tsx` | Guest portal (login, then tabs) |
| `/rent/status` | `app/rent/status/page.tsx` | Result page for tenants' rent autopay links |
| `/approve/[id]/[token]`, `/reject/[id]/[token]` | `app/approve/…`, `app/reject/…` | One-click confirm or deny of a booking request, from the admin email (signed link) |
| `/admin/booking/[id]` | `app/admin/booking/[id]/page.tsx` | Admin view of a booking request, with confirm/deny |
| `/admin/new-booking` | `app/admin/new-booking/page.tsx` | Manually add a booking and generate its door code |
| `/admin/tenants` | `app/admin/tenants/page.tsx` | Add tenants, send rent autopay links, track payments, end leases |
| `/admin/guests` | `app/admin/guests/page.tsx` | Current guests' logins: set or reset portal passwords |
| `/admin/reviews` | `app/admin/reviews/page.tsx` | Approve or reject guest reviews |

`app/layout.tsx` is the root layout (metadata, business info for search engines, providers). The `layout.tsx` files in `about`, `contact` and `units` hold page metadata.

### API routes (`app/api/`)

**Auth and guest portal**

| Route | Auth | What it does |
|---|---|---|
| `POST /api/auth/guest-login` | Lock code (or email/phone/username) + password; rate-limited | Portal login, including the admin login |
| `POST /api/auth/token-login` | Signed JWT from an email link | Logs in from emailed portal links |
| `GET /api/guest/reservation` | Guest JWT | Refreshes the session and reservation details |
| `GET/PATCH /api/guest/profile` | Guest JWT + current password to save | User Profile: name, email, phone, username, password (admin: password only) |
| `POST /api/requests/notify` | Guest JWT | Cleaning, extension, cancellation and maintenance requests, emailed to the admin |
| `POST /api/reviews` | Guest JWT | Submit a review (photo upload not finished) |

**Bookings and calendar**

| Route | Auth | What it does |
|---|---|---|
| `GET /api/availability/[unitSlug]` | Public | Blocked date ranges (our bookings + imported blocks + 2-day buffer) |
| `GET /api/airbnb-availability/[slug]` | Public | Reads the unit's Airbnb iCal to find the next available dates |
| `GET /api/calendar/[unitSlug]` | Public | iCal export of our bookings, for Airbnb and Booking.com to import |
| `GET/POST /api/calendar/import` | `CRON_SECRET` | Daily cron: pulls the `calendar_feeds` iCal URLs into `external_blocks` |
| `POST /api/book` | Public | Direct booking request: saves it to `bookings` and `reservations` and notifies the admin by email and WhatsApp (currently only called by the unused `BookingModal`) |
| `GET /api/booking/[id]` | HMAC admin token | Booking details for the admin page |
| `GET /api/booking/[id]/action`, `POST /api/booking/[id]/confirm`, `GET /api/booking/[id]/approve/[token]`, `GET /api/booking/[id]/reject/[token]` | HMAC admin token | Confirm or deny a request. Confirming creates the TTLock gate code and notifies the guest. |
| `POST /api/booking-webhook` | `BOOKING_WEBHOOK_SECRET` | Make.com/Zapier: records Airbnb and Booking.com reservations |
| `POST /api/bookingcom-webhook` | Public (see [To-dos](#to-dos)) | Booking.com reservation push |
| `POST /api/admin/create-booking` | Admin code | Manual booking from `/admin/new-booking` |

**Payments**

| Route | Auth | What it does |
|---|---|---|
| `POST /api/transport/checkout` | Public or guest JWT | Prices the trip on the server and creates the Stripe Checkout session |
| `POST /api/stripe/webhook` | Stripe signature | Transport payments; rent setup, invoices and lease end |
| `GET /api/rent/setup/[id]/[token]` | HMAC tenant token | Tenant's permanent link: card setup, then the billing portal |

**Admin**

| Route | Auth | What it does |
|---|---|---|
| `GET/POST /api/admin/tenants`, `POST /api/admin/tenants/[id]/cancel` | Admin code | List and add tenants; end a lease |
| `GET /api/admin/guests`, `POST /api/admin/guests/[id]/password` | Admin code | List current guests; set or reset their password |
| `GET /api/admin/reviews`, `PATCH /api/admin/reviews/[id]/[action]` | Basic auth | Review moderation |

**Crons, messaging and verification**

| Route | Auth | What it does |
|---|---|---|
| `GET /api/cron/checkout-reminder` | `CRON_SECRET` | Emails guests checking out tomorrow, with an extension link if the unit is free |
| `GET /api/cron/expire-checkouts` | `CRON_SECRET` | Marks past stays as checked out and retires their lock codes |
| `POST /api/contact` | Public | Contact form, emailed to the admin |
| `POST /api/lease-application` | Public | Long-term lease application, emailed to the admin |
| `POST /api/verify/document` | Public | ID photo check (Google Vision) plus sanctions screening; returns only pass/fail details (used by `/booking`) |
| `POST /api/verify/sanctions` | Public | OFAC sanctions-list name screening (used by `/booking`) |
| `POST /api/whatsapp/incoming` | Twilio (see [To-dos](#to-dos)) | Forwards guests' WhatsApp messages to the admin's email |
| `GET /api/db-check` | Public (see [To-dos](#to-dos)) | Database connectivity probe |
| `/api/requests/cleaning`, `cancellation`, `extend-stay`, `maintenance`, `transport`, `transport/destinations` | Guest JWT | **Unused** older endpoints, replaced by `/api/requests/notify` and Stripe transport |

### Components (`components/`)

| File | What it is |
|---|---|
| `ClientLayout.tsx` | Client-side wrapper: language provider and EN/ES toggle |
| `BackgroundSlideshow.tsx` | Full-screen photo slideshow background |
| `UnitCard.tsx`, `UnitModal.tsx` | Unit card and details pop-up (photos, rates, live Airbnb availability, booking links) |
| `EntireHomeCard.tsx` | "Rent the entire home" card |
| `GalleryModal.tsx`, `GalleryFilters.tsx` | Photo viewer and category filters |
| `ContactModal.tsx` | Contact form pop-up |
| `LeaseApplicationForm.tsx`, `LeaseApplicationModal.tsx` | Long-term lease application (MXN rates, deposit, USD conversion) |
| `IdVerification.tsx` | ID photo upload and check; only used by the unlinked `/booking` page |
| `ThingsToDoSection.tsx`, `ToursPage.tsx` | Local attractions and tours |
| `TransportationServices.tsx`, `TransportBookingModal.tsx`, `TransportQuoteModal.tsx`, `TransportationAddons.tsx` | Transport destinations, booking and payment |
| `DateInput.tsx` | Shared date and date-time picker (bilingual) |
| `LanguageToggle.tsx` | EN/ES switch |
| `GuestPortal.tsx` | Portal shell: login, sidebar, tabs, default-password banner |
| `GuestLoginPanel.tsx` | Portal login form (lock code + password) |
| `PortalSidebar.tsx` | Portal tab navigation |
| `GuestWelcomeBanner.tsx` | Stay summary banner (admin banner for the admin login) |
| `features/CleaningRequestForm.tsx` | Portal tab: schedule a cleaning |
| `features/TransportRequestForm.tsx` | Portal tab: book and pay for transport |
| `features/ExtendStayForm.tsx` | Portal tab: request extra nights (checks the next booking and the cleaning buffer) |
| `features/CancelReservationForm.tsx` | Portal tab: cancellation request |
| `features/MaintenanceRequestForm.tsx` | Portal tab: report an issue (with photo) |
| `features/LeaveReviewForm.tsx` | Portal tab: review (unlocks after checkout) |
| `features/ProfileForm.tsx` | Portal tab: User Profile (guests) and Admin Password (admin) |
| **Unused:** `BookingModal.tsx`, `EscrowModal.tsx`, `DateRangePicker.tsx`, `DisclaimerModal.tsx`, `Navigation.tsx`, `PhoneInput.tsx`, `features/IDVerificationForm.tsx` | Not imported anywhere (see [To-dos](#to-dos)) |

### Libraries (`lib/`)

| File | What it does |
|---|---|
| `db.ts` | Shared Postgres connection (`getSql()`) |
| `supabase-helpers.ts` | Reservation and portal queries; builds portal sessions; `sameGuestReservationIds` |
| `reservation-helpers.ts` | Unique door code generation; returning-guest lookup |
| `guest-auth.ts` | Portal JWT sign/verify; identifier detection (lock code, email, phone, username) |
| `password.ts` | scrypt password hashing and verification (default-password fallback) |
| `adminCredentials.ts` | Read and save the admin portal password hash |
| `adminToken.ts` | HMAC tokens for admin approve/reject links |
| `bookingAction.ts` | Confirm/deny logic for booking requests (TTLock code, notifications) |
| `ttlock.ts` | TTLock API: create and delete timed gate passcodes |
| `stripe.ts` | Shared Stripe client (`getStripe()`) |
| `transportPricing.ts` | Transport destinations and server-side prices (MXN) |
| `transportCheckout.ts` | Browser helper that starts a transport checkout |
| `rent.ts` | Rent schedule maths, tenant link tokens, admin-code check, `escapeHtml`, money formatting |
| `rentWebhook.ts` | Stripe rent events: create subscription, record invoices, lease end |
| `currency.ts` | MXN/USD price formatting |
| `date.ts` | Date formatting |
| `translations.ts` | All English and Spanish site text |
| `google-vision.ts` | ID document detection and name extraction |
| `ofac-sanctions.ts` | Fuzzy name matching against the OFAC sanctions list |
| `deposit.ts` | Deposit and refund types |
| **Unused:** `depositCalculator.ts`, `depositPolicy.ts`, `transportationConfig.ts` | Not imported anywhere |

### Hooks, context, data and types

| File | What it is |
|---|---|
| `hooks/useGuestAuth.ts` | Portal session: login, logout, refresh, update |
| `hooks/useAvailability.ts` | Fetches a unit's Airbnb availability |
| `hooks/useUsdToMxn.ts` | Daily-cached USD→MXN exchange rate |
| `hooks/useGeoDialCode.ts` | Guesses the visitor's phone country code |
| `contexts/LanguageContext.tsx` | EN/ES language state and `t()` translation function |
| `data/units.ts` | **Single source of truth** for units: names, rates, capacity, Airbnb links, lease tiers |
| `data/gallery.ts` | Gallery images and categories |
| `data/attractions.ts` | Things to do near the property |
| `data/countryCodes.ts` | Phone country codes |
| `types/guest-portal.ts` | Portal session, reservation, request and section types |
| `types/booking.ts` | Booking, unit and availability types |

### Other files

| File | What it is |
|---|---|
| `db/schema.sql`, `db/migrations/*.sql` | Database schema and numbered migrations (run in order) |
| `.github/workflows/deploy.yml` | Build and deploy to Vercel on push to `main`, or manually |
| `vercel.json` | Cron schedules |
| `.env.example` | Environment variable names with placeholder values |
| `CLAUDE.md` | Instructions for AI assistants (points to the commit checklist) |
| `public/` | Images, `robots.txt`, `sitemap.xml` |
| `*.md` (other root docs), `deploy.sh`, `CNAME` | Older scaffold-era docs and GitHub Pages leftovers (see [To-dos](#to-dos)) |

---

## Database

PostgreSQL on Supabase. Only the website's server connects (through `DATABASE_URL`); no browser code talks to the database.

| Table | Holds |
|---|---|
| `reservations` | Guest stays: name, contact, unit, dates, door code, portal username and password hash, status |
| `bookings` | Direct booking requests |
| `calendar_feeds` | Airbnb and Booking.com iCal URLs per unit |
| `external_blocks` | Dates blocked by imported calendars |
| `tenants` | Long-term tenants and their rent subscription |
| `rent_payments` | One row per rent charge (paid or failed) |
| `admin_credentials` | The admin portal password hash (single row) |
| `transport_requests`, `cleaning_requests`, `stay_extensions`, `cancellation_requests`, `transport_destinations` | Portal requests (older flow) |
| `reviews`, `review_images` | Guest reviews |

Migrations: `001` booking webhook fields · `002` booking count · `003` tenants and rent payments · `004` guest usernames and passwords · `005` admin credentials · `006` row-level security for the 003 and 005 tables.

---

## To-dos

### Security and privacy (highest priority)

- [ ] **Check row-level security on the older tables.** Run the RLS block from [rule 1](#1-protect-user-data) for `reservations`, `bookings`, `calendar_feeds`, `external_blocks`, `reviews` and the request tables, so that none are reachable through Supabase's public API.
- [ ] **Rename `NEXT_PUBLIC_JWT_SECRET`** to a server-only name (e.g. `GUEST_JWT_SECRET`). The `NEXT_PUBLIC_` prefix risks it being bundled into browser code. Also remove its insecure fallback value.
- [ ] **Remove the insecure fallback values** for `ADMIN_TOKEN_SECRET` and `ADMIN_USERNAME`/`ADMIN_PASSWORD`, so the server refuses to work rather than using a guessable default.
- [ ] **Rate-limit the admin code checks** on `/api/admin/*`. The 4-digit admin code alone unlocks those routes.
- [ ] **Store login rate limits somewhere shared** (database or KV store). The current in-memory limit resets whenever a new server instance starts.
- [ ] **Decide whether emailed portal links** (`/portal?token=…`) should still skip the password.
- [ ] **Protect or remove `/api/db-check`**, which exposes database error details publicly.
- [ ] **Verify the senders of `/api/bookingcom-webhook` and `/api/whatsapp/incoming`** (shared secret and Twilio signature).
- [ ] **Move the hardcoded admin email** out of about 18 files into one environment variable. The repo is public.
- [ ] **Verify a sending domain in Resend.** The `onboarding@resend.dev` test sender only delivers to the account owner, so guest and tenant emails may not arrive.

### Cleanup (rule 3)

- [ ] **Delete unused components:** `BookingModal`, `EscrowModal`, `DateRangePicker`, `DisclaimerModal`, `Navigation`, `PhoneInput`, `features/IDVerificationForm`.
- [ ] **Delete unused libraries:** `depositCalculator`, `depositPolicy`, `transportationConfig`. Also remove the `@supabase/supabase-js` dependency, which nothing uses.
- [ ] **Delete the unused `/api/requests/*` endpoints**: cleaning, cancellation, extend-stay, maintenance, transport, destinations.
- [ ] **Remove or rebuild the `/booking` page**, and decide whether `/api/book` should stay.
- [ ] **Share one iCal parser** between `/api/airbnb-availability` and `/api/calendar/import`, which each have their own.
- [ ] **Move `checkAdminCode` and `escapeHtml`** from `lib/rent.ts` into general-purpose modules, and use one shared admin lock screen for all `/admin/*` pages.
- [ ] **Consolidate or delete the old root docs** (`API_EXAMPLES.md`, `BOOKING_*.md`, `FUTURE_ENHANCEMENTS.md`, `IMPLEMENTATION_SUMMARY.md`, `QUICK_START.md`, `README_VISUAL_GUIDE.md`, `TRANSPORTATION_SERVICES_DOCS.md`, `GITHUB_PAGES_DEPLOYMENT.md`) and the GitHub Pages leftovers (`deploy.sh`, `CNAME`).
- [ ] **Stop committing `tsconfig.tsbuildinfo`**: add it to `.gitignore`.

### Features

- [ ] **Create Airbnb guests automatically.** When an Airbnb booking is confirmed, automatically add the guest to `reservations`, with **Airbnb's suggested lock code** as their door code. Save their name, email, phone, unit and dates where available, so they can log into the portal right away.
  - **Starting point:** `POST /api/booking-webhook` already creates a reservation from a Make.com/Zapier payload (name, email, dates, unit). But it generates its own lock code; extend it to accept the lock code and phone.
  - **Source of the data:** Airbnb's iCal feed only has dates (and sometimes the last 4 digits of the guest's phone), not names or emails. A Make.com/Zapier scenario that reads Airbnb's "Reservation confirmed" email is the practical source. Airbnb's official API is limited to approved partners.
  - **Must hold:** codes stay unique (reject or flag a clash with a current guest), sending to the webhook requires `BOOKING_WEBHOOK_SECRET`, and the same booking delivered twice creates only one guest (key on Airbnb's confirmation code).
- [ ] **Finish review photo uploads** (Cloudinary or S3); they currently return a placeholder.
- [ ] **Charge a prorated first month** or deposit through Stripe when adding a tenant mid-month.
- [ ] **Carry a guest's own password and username** over to their next stay.
- [ ] **Show the admin's rent and payment history** in one dashboard.
