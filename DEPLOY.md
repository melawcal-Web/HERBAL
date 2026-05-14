# Go-Live Checklist — The Center for Herbal Therapists

> Hebrew “click-by-click” beginner guide: see `SETUP-SIMPLE-HE.md` in this folder.

This guide is written for a **non-technical** owner or office manager. Follow the steps in order. If you hire a developer for one day, they can complete the technical sections marked **(Tech)**.

---

## 1. What you are deploying

- **App**: Next.js (Node.js) web application in this repository (`herbal-platform/`).
- **Database**: MySQL (cloud or managed server).
- **Files**: User-uploaded clinical note images are stored on the server disk in `public/uploads/notes` by default. For production, plan **object storage** (Amazon S3, Cloudflare R2, Google Cloud Storage, etc.) — see section 8.

---

## 2. Accounts and API keys you will need

Create accounts (free or paid tiers as you prefer) for:

| Service | Why you need it |
| --- | --- |
| **Domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.) | Your public web address, e.g. `herbal-center.co.il`. |
| **DNS / CDN** (often Cloudflare) | Point the domain to hosting; optional caching and security. |
| **Hosting for Node.js** | Runs the Next.js app (Vercel, Railway, Render, Fly.io, AWS, Azure, etc.). |
| **MySQL hosting** | PlanetScale (MySQL-compatible), AWS RDS, Google Cloud SQL, Azure Database for MySQL, DigitalOcean Managed DB, etc. |
| **AUTH_SECRET** | Random secret so login sessions are secure — no third-party account; you generate it locally (section 5). |
| **Payment gateway (later)** | Stripe, PayPal, or a local Israeli processor — for courses/workshops checkout and membership. |
| **Video / webinar (optional)** | Zoom, Google Meet, or Vimeo for paid “Zoom” products — links can live inside product descriptions until native integration is added. |
| **Email provider (recommended)** | SendGrid, Postmark, Amazon SES, or Resend — for password reset and notifications (not wired in MVP; plan ahead). |
| **Google Cloud (optional, for Google Docs export)** | Only if you want **one-click** creation of Google Docs via API. The app already supports **copy to clipboard** and **PDF** without Google. |

You do **not** need all optional items on day one. Minimum to go live: **hosting + MySQL + domain + AUTH_SECRET**.

---

## 3. Local test on a computer **(Tech)**

1. Install **Node.js 20+** from [https://nodejs.org](https://nodejs.org).
2. Open a terminal in the `herbal-platform` folder.
3. Copy environment file:

   ```bash
   copy .env.example .env
   ```

   On macOS/Linux use `cp .env.example .env`.

4. Set `DATABASE_URL` in `.env` to your MySQL connection string (from your cloud provider).
5. Install and prepare the database:

   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   ```

6. (Optional) Load demo data — **change default passwords immediately**:

   ```bash
   set ADMIN_EMAIL=you@yourdomain.com
   set ADMIN_PASSWORD=YourStrongPasswordHere
   npx prisma db seed
   ```

7. Start the site:

   ```bash
   npm run dev
   ```

8. Open `http://localhost:3000` and log in with the seeded admin or therapist accounts (see console output from seed).

---

## 4. Production environment variables (`.env` on the host)

On your hosting dashboard, add these variables (names must match exactly):

| Variable | Example | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://user:pass@host:3306/herbal_center` | MySQL connection |
| `AUTH_SECRET` | long random string | Session encryption |
| `NEXTAUTH_URL` | `https://www.yourdomain.com` | Public URL of the site |
| `AUTH_URL` | same as `NEXTAUTH_URL` | Some hosts expect this for Auth.js v5 |

**Generate AUTH_SECRET (Windows PowerShell):**

```powershell
[Convert]::ToBase64String([byte[]](1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Optional (later):**

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — payments.
- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_BASE_URL` — durable uploads.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — Google OAuth for Docs API integration.

Never commit `.env` to git. It is listed in `.gitignore`.

---

## 5. Connect your domain

1. In your **hosting** panel, create a new project from this repository and run the build command:

   ```bash
   npm run build
   ```

   Start command:

   ```bash
   npm run start
   ```

2. The host will show you a **temporary URL** (e.g. `*.vercel.app`). Confirm the site loads.
3. In your **DNS** provider, create a **CNAME** (recommended) or **A** record:

   - **Subdomain** `www` → target given by host (e.g. `cname.vercel-dns.com` or similar).
   - Apex/root domain (`@`) → use your host’s apex instructions (often ALIAS/ANAME or A records).

4. In the hosting panel, attach **custom domain** `www.yourdomain.com` and enable **HTTPS** (automatic on most modern hosts).
5. Update `NEXTAUTH_URL` and `AUTH_URL` to `https://www.yourdomain.com` and redeploy.

Propagation can take **5 minutes to 48 hours** depending on DNS TTL.

---

## 6. Go-live checklist (printable)

- [ ] MySQL instance created; backups enabled.
- [ ] `DATABASE_URL` tested with `npx prisma db push` from a secure machine.
- [ ] `AUTH_SECRET` set to a strong random value.
- [ ] `NEXTAUTH_URL` / `AUTH_URL` match the final public HTTPS URL.
- [ ] `npm run build` succeeds on the host.
- [ ] Default seeded passwords changed (if you used `prisma db seed`).
- [ ] Admin can open `/admin` and see audit entries.
- [ ] Therapist can edit profile at `/dashboard/profile` and public page `/t/...` loads.
- [ ] Client can register, sign in, and browse `/therapists` and `/herbal-index`.
- [ ] Legal: privacy policy + terms + clinician disclaimers published (add pages when your lawyer is ready).
- [ ] Cookie banner if required in your jurisdiction.

---

## 7. Payments and “verify payments” in the Admin Center

The Admin page includes a **payments** panel placeholder. To activate:

1. Create a **Stripe** account (or another processor).
2. Add **API keys** to the host environment.
3. Ask your developer to connect **Checkout** or **Payment Links** to `products` in the database and to record successful charges (e.g. new `payments` table + Stripe webhooks).

Until then, mark bank transfers manually in your office spreadsheet.

---

## 8. File uploads (clinical note photos)

- **Development**: files save under `public/uploads/notes`.
- **Production serverless** (e.g. Vercel): disk is **ephemeral** — uploads should go to **S3-compatible storage** and store the public URL in `clinical_logs.notes_image`.

Plan this before heavy clinical use.

---

## 9. Google Docs vs PDF

- **PDF**: works in the browser today from the clinical log screen (therapist/admin).
- **Google Docs “one tap”**: requires OAuth consent screen + Google Drive/Docs API — schedule with a developer; until then use **Copy for Google Docs** (clipboard) in the UI.

---

## 10. Support handover

Keep a **password manager** entry for:

- Hosting login
- Database login
- Domain registrar
- Stripe (when enabled)
- Email DNS (SPF/DKIM) when you add transactional email

Document who is allowed to create **admin** users (`role = admin` in the database).

---

## 11. Useful commands reference **(Tech)**

```bash
npm run dev          # local development
npm run build        # production build
npm run start        # production server
npx prisma studio    # visual database browser
npx prisma migrate dev  # when you add migrations (optional; db push is simpler early on)
```

---

**Branding reminder:** therapist profile photos use a **black & white** CSS filter on public landing pages (`therapist-photo-bw`).

If anything in this checklist is unclear, bring this file to any web developer; they can align hosting and DNS with your chosen vendors.
