# Care Dental — Healthy Smiles Brighter Lives

Single-page dental clinic website with an appointment API. React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · Express 5 · Nodemailer — no UI, icon or animation libraries (all motion is CSS). Requires Node ≥ 22.18 (the server runs TypeScript natively — no build step).

Design: bold black/white editorial system — full-viewport “masked card” mosaics (several cards showing windows into one shared photo), splash counter, floating pill navigation with active-section tracking, full-screen typographic menu, frosted “glass” surfaces for any text placed on photography, seamless 6–8 px gutters between sections.

```bash
npm install
cp .env.example .env   # then fill in SMTP + mail settings (optional in development)

npm run dev            # Vite frontend on :5173 (proxies /api → :8787)
npm run dev:api        # appointment API on :8787, auto-restarts on change
npm run build          # type-check (app + server) + production build → dist/
npm start              # production: serves dist/ + /api from one process
npm run lint           # oxlint
npm run mail:test      # send a sample booking + acknowledgement to verify SMTP
```

Run `dev` and `dev:api` in two terminals during development. Without SMTP settings the API prints each email to its console instead of sending, so the whole flow works locally.

## Before launch — replace every placeholder

All bracketed values (`[+91 00000 00000]`, …) are placeholders. Nothing has been invented; fill in verified clinic data only. The brand (Care Dental, logo in `logo/caredental.png`, resized icons in `public/`) is real.

| What | Where |
| --- | --- |
| Phone, email, address, opening hours, directions link, emergency / same-day flags, social links (name, wordmark, tagline and logo paths live here too) | `src/data/clinic.ts` |
| Trust statistics (years, patients, specialties, rating) | `src/data/clinic.ts` → `stats` (or remove the block in `src/sections/About.tsx`) |
| Photography (hero + gallery mosaics, implant section) | `src/data/clinic.ts` → `images` (reference-template assets, hot-linked). Mosaic images need a plain light background with the subject on the right; update the hero `<link rel="preload">` in `index.html` too |
| Dentist names, qualifications, specialties, experience, bios, portraits | `src/data/doctors.ts` |
| Patient testimonials (consented, genuine) | `src/data/testimonials.ts` |
| FAQ answers (clinic to review; bracketed values inside answers) | `src/data/faqs.ts` |
| Treatment list / descriptions, gallery highlight tiles | `src/data/treatments.ts` |
| Page title, meta description, Open Graph, canonical URL, JSON-LD `Dentist` schema | `index.html` |
| Privacy Policy / Terms links | `src/sections/Footer.tsx` |
| Font | `index.html` (Open Sauce One via the template’s links; bold cut mapped in `src/styles/index.css`) |

Two small on-page notes ("Figures shown are placeholders…", "Sample testimonials…") live in `About.tsx` and `Testimonials.tsx` — delete them once real data is in.

## Appointment API (`server/`)

`POST /api/appointments` (`server/appointments.ts`) does, in order:

1. Coerces the body to strings, strips control characters, enforces length caps.
2. **Honeypot** — if `website` is non-empty, returns a fake `200` and does nothing.
3. Re-validates with the *same* rules as the frontend (`src/lib/validation.ts` is shared) → `400 { ok:false, errors:{field:message} }`, which the form shows inline.
4. **Rate limit** — 5 requests / 15 min per IP (in-memory; `RATE_LIMIT_*` in `.env`) → `429`.
5. Emails the clinic (`MAIL_TO`, Reply-To = patient). If this fails → `502` and the form tells the patient to call.
6. Emails the patient an acknowledgement (best effort, `SEND_PATIENT_CONFIRMATION`). It explicitly says the appointment is **not confirmed** until the clinic calls.
7. Returns `200 { ok:true, reference:"APT-YYYYMMDD-XXXX" }`.

`GET /api/health` → `{ ok:true }` for uptime checks.

### Email / SMTP

Every submission sends two emails: a **booking request to the clinic** (`MAIL_TO`, Reply-To = the patient) and an **acknowledgement to the patient** (Reply-To = the clinic). Without SMTP settings the API prints both to its console instead of sending — that is the development fallback, not a bug.

Any SMTP provider works (Gmail app password, Brevo, Resend, SendGrid, Postmark, Zoho…). Set `SMTP_HOST/PORT/SECURE/USER/PASS`, `MAIL_FROM` (a sender your provider permits) and `MAIL_TO` in `.env` — see `.env.example`.

**Gmail in three steps:** enable 2-Step Verification → create an *App password* (Google Account → Security → App passwords) → put it in `SMTP_PASS` with `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true` and `SMTP_USER` / `MAIL_FROM` set to the Gmail address. Gmail can only send *as* that account. For a clinic domain address (e.g. reception@caredental.in) use that domain's mail provider or a transactional service such as Brevo or Resend.

Then prove delivery without touching the website:

```bash
npm run mail:test                    # clinic copy → MAIL_TO, patient copy → MAIL_TO
npm run mail:test -- you@example.com # patient copy → that address
```

The server also verifies the SMTP connection at startup and logs loudly if it fails. In production (`NODE_ENV=production`) it refuses to start without `SMTP_HOST`, `MAIL_FROM` and `MAIL_TO`, so a misconfigured deploy cannot silently drop requests.

### Deploying

- **Single process** (Render, Railway, Fly, a VPS): `npm run build` then `npm start`; set `NODE_ENV=production` (most hosts do) and the `.env` variables in the host's environment settings. Set `TRUST_PROXY=true` behind a reverse proxy so rate limiting sees real client IPs.
- **Split** (static frontend on a CDN, API elsewhere): deploy `dist/` anywhere, run the server for `/api`, and set `ALLOWED_ORIGIN` to the site's origin. Point the frontend at the API by proxying `/api` at the CDN/edge (or change `APPOINTMENTS_ENDPOINT` in `src/lib/api.ts`).
- Multiple API instances need a shared rate-limit store (swap `server/rateLimit.ts` for Redis).

Never commit `.env`. Secrets live only in the server environment.

## Structure

```
src/
├── components/   Navbar (pill nav + burger), MenuOverlay (full-screen menu), Wordmark,
│                 SplashScreen, MaskedCard, ArrowIcon, FAQAccordion, AppointmentForm
│   └── ui/       DatePicker (calendar popover), Select (listbox), SegmentedControl, Chevron
├── sections/     Hero, SmileGallery, ImplantDentistry, About, Services, Doctors,
│                 PatientJourney, Testimonials, FAQ, Contact, Footer
├── data/         clinic, treatments, doctors, testimonials, faqs
├── lib/          validation (shared with the server), api
├── hooks/        useMaskPositions, useImageSize, useIsMobile, useStaggeredReveal,
│                 useActiveSection, useScrollLock, useOutsideClick
├── context/      BookingContext (treatment pre-select)
└── styles/       index.css — Tailwind v4 theme, pills, fields, section shell
server/
├── index.ts        Express app: /api routes, security headers, static dist/ in production
├── appointments.ts POST /api/appointments handler (validation, honeypot, emails)
├── mailer.ts       Nodemailer transport + clinic / patient email templates
├── rateLimit.ts    in-memory per-IP limiter
└── env.ts          environment parsing, production fail-fast
```

### Masked cards

`useMaskPositions` measures each card’s offset inside its section (from `offsetTop/Left`, so reveal transforms never skew it); `useImageSize` reads the photo’s natural size; `MaskedCard` scales the photo to cover the whole section and offsets it per card, so all cards read as one picture. `focalX` picks which horizontal slice shows when the photo is wider than the section (0.8 desktop / 0.7 mobile).

Breakpoints: stacked below `md` (768), two-column from `md`, multi-column rows from `lg` (1024).
