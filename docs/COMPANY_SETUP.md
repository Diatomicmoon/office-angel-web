# Hard Hat Solutions — Company Setup (Demo ↔ Real)

This app supports **two modes**:

- **Demo mode** (fake UI / mock flows where noted)
- **Real mode** (wired to Supabase + external integrations)

It also supports **multi-tenant** operation via a `companies` row in Supabase.

---

## 0) Per-environment switch (Demo ↔ Real)

### Env vars

- `NEXT_PUBLIC_DEMO_MODE`
  - `"true"` → show demo UI on pages that aren’t wired yet
  - unset / `"false"` → hide demo UI and show real/empty states

### Local

Set in `hardhat-solutions-web/.env.local`.

### Vercel (public demo)

Set in Vercel → Project → Settings → Environment Variables.

---

## 1) Company (tenant) selection

We scope reads/writes by one company id:

- `OFFICE_ANGEL_COMPANY_ID` (server-side env var)

### Beta (single-tenant per deployment)

For early beta / single-tenant deployments, we can pin one tenant per deployment via `OFFICE_ANGEL_COMPANY_ID`.

### Production (login selects tenant)

For a single shared Vercel app, we’ll move to **membership-based tenancy**:

- Table: `company_memberships (user_id, company_id, role)`
- On login, user selects a company (if they belong to more than one)
- Selected `company_id` is stored (cookie or DB preference)
- All API reads/writes derive `company_id` from the authenticated user + selection

This removes per-deployment tenant pinning and lets one app serve all companies.

### Create a company in Supabase

Run in Supabase SQL editor:

```sql
insert into public.companies (name, phone_number)
values ('<Company Name>', '<Main Phone>')
returning id;
```

Then set:

```bash
OFFICE_ANGEL_COMPANY_ID="<that id>"
```

**Goal:**
- Public demo points at a “demo company” (seeded fake data)
- Local/dev points at a “dev company” (clean/real)
- Each real customer gets their own `companies` row

---

## 2) Supabase (required for real mode)

Env vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Tables

Core tables live in `supabase/schema.sql`.

Important additional table:

- `technicians` (Live Field Status)
  - migration: `supabase/migrations/2026-05-05_create_technicians.sql`

---

## 3) Call Logs (real)

**What it needs:** Supabase + `call_logs` + `customers`.

**API/UI:**
- `GET /api/call-logs` → returns call logs for `OFFICE_ANGEL_COMPANY_ID`
- `/call-logs` → UI reads from `/api/call-logs`

**Producer:**
- `POST /api/call-finished` (Vapi webhook) writes to `call_logs` + `customers` scoped to `OFFICE_ANGEL_COMPANY_ID`

---

## 4) Dispatch (hybrid)

**Now:**
- Map overlay pulls technicians from `/api/technicians`.
- Day view is demo-only until we wire jobs.

**What it needs next:**
- Persist technician locations (`technicians.last_location = {lat,lng}`)
- Jobs table wiring + “AI parking lot” from real call logs

### Google Maps setup

If you see `ApiProjectMapError`, it usually means the Maps JS API key is missing/invalid, the wrong Google Cloud project is attached, the **Maps JavaScript API** isn’t enabled, or billing isn’t enabled.

Env var:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

Google Cloud Console checklist:

1. Enable **Maps JavaScript API**
2. Create an API key
3. (Recommended) Restrict HTTP referrers (localhost + your domain)
4. Ensure billing is enabled on the GCP project

---

## 5) Co-Pilot (not wired yet)

**Definition:** human answers the call, AI listens/transcribes and drafts the job ticket.

**Decision needed per company:**
- Twilio SIP / Voice (true live call capture) vs Vapi-first.

---

## 6) Material Cost Engine (receipts)

**What it needs:** Supabase `receipts` table.

**API/UI:**
- `GET/POST /api/receipts`
- `/inbox` in real mode shows receipts from `/api/receipts`

**Inbound email webhook:**
- `POST /api/inbound-email`
  - currently does minimal parsing (supplier + biggest $ amount)
  - inserts into `receipts` with status `Action Required`

**Per-company setup still needed:**
- Decide email provider (SendGrid Inbound Parse vs Postmark) and generate a unique inbound alias per company.

---

## 7) Accounting integration (QuickBooks / Jobber / etc.)

**Goal:** zero workflow change. We push invoices/estimates/job costs into whatever they already use.

### Options

- **QuickBooks Online (QBO)**
  - Use Intuit OAuth (per company) + store refresh token in Supabase.
  - Typical objects: Customers, Estimates, Invoices, Payments, Items/Services.

- **Jobber**
  - Use Jobber API + OAuth (per company).
  - Typical objects: Clients, Requests, Quotes, Jobs, Invoices.

- **Other** (ServiceTitan, Housecall Pro, etc.)
  - Add later using the same pattern: OAuth/keys per company + a small “sync adapter”.

### Per-company checklist

1. Confirm accounting system: QBO vs Jobber vs other.
2. Connect OAuth (owner account) and store tokens.
3. Map:
   - Hard Hat Solutions `customers` ↔ external “Customer/Client”
   - Hard Hat Solutions `jobs` ↔ external “Job/Work order”
   - Hard Hat Solutions `receipts`/materials ↔ external “Expense/Job cost/Line items”
4. Decide sync direction:
   - **OA → accounting** (recommended first)
   - or bi-directional.

---

## 8) Phone number (use their existing number)

**Goal:** customer keeps their current published number.

### Strategies

1) **Port-in** (best UX)
- Port their number into Twilio.
- We control the number fully (IVR, routing, Co-Pilot listening, after-hours).

2) **Call forwarding** (fastest)
- Customer forwards their existing number → our Twilio number.
- Works quickly, but caller ID / analytics can be messier.

3) **Parallel number** (fallback)
- Use a new number only for overflow/after-hours.

### Per-company checklist

1. Pick strategy: port-in vs forwarding.
2. If port-in: gather LOA, bill copy, CSR info, schedule cutover.
3. Configure routing rules (business hours vs after-hours).
4. Co-Pilot mode: enable silent listening on live human-answered calls (Twilio SIP/Voice).

---

## 9) Google Business Profile + socials

**Goal:** pull real marketing KPIs + optionally draft/post updates.

### What we’ll connect

- Google Business Profile (GBP)
- Google Analytics (GA4) (optional)
- Google Search Console (optional)
- Facebook Page / Instagram (optional)

### Per-company checklist

1. Confirm which properties: GBP location(s), GA4 property, Search Console site.
2. OAuth connect (owner/admin permissions).
3. Decide permissions:
   - read-only analytics first
   - then enable posting (draft → approval → publish).

---

## 10) Inventory tracker (truck stock) — beta

**Goal:** a simple, universal truck-stock system every company can use immediately.

Supabase tables:

- `inventory_items`
- `inventory_txns`

Recommended beta workflow:

1. Add items (name, unit, reorder_point, reorder_qty, preferred_supplier)
2. Techs log quick transactions:
   - `out` when material is used
   - `in` when restocking
   - `adjust` for corrections
3. Restock view = items where (in - out) is below reorder_point

---

## 11) Financial projections + goals — beta

**Goal:** set targets and see pace-to-goal.

Supabase table:

- `financial_goals` (month/year)

Beta UX:

- Owner sets monthly revenue goal (+ optional gross profit/jobs/leads)
- Dashboard/Financials shows:
  - goal
  - current-to-date (manual at first, then QuickBooks/Jobber)
  - required per-day to hit goal
