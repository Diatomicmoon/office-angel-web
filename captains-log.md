# Captain’s Log (local buffer)

Source Sheet: https://docs.google.com/spreadsheets/d/1IUN6jvhaIj1H9YO9uMyhd2pGvNhCWV6fUi4HEXBTEmw/edit?gid=0

> This file is the local “buffer” log until Google Sheets write-access is connected.

## 2026-05-05 (America/Chicago)
- Shifted focus away from TradeVolt and into **Hard Hat Solutions**.
- Confirmed local repo presence: `office-angel-web/` (Next.js + Supabase tooling/scripts).
- Re-stated current Hard Hat Solutions status (as of 2026-05-04): dashboard mostly built; AI Call Summaries + KPI boxes wired to Supabase; Vapi webhook saving end-of-call transcripts.
- Re-stated next engineering priorities:
  - Live Field Status → real `technicians` table
  - AI Action Items → trigger from urgency flags/missed invoices
  - Financial Pulse → Stripe/QuickBooks integration
  - Co-Pilot mode → Twilio SIP trunking
- Implemented real dashboard wiring:
  - `/api/dashboard` now returns `technicians` + unified `actionItems` (calls/receipts/permits) and safe-fails if optional tables are missing.
  - `/dashboard` UI now renders **Live Field Status** and **AI Action Items** from the DB (no longer placeholders).
- Added `/api/technicians` (GET/POST) and updated `/dispatch` map overlay to pull live technicians.
- Added Supabase SQL migration to create `public.technicians`:
  - `supabase/migrations/2026-05-05_create_technicians.sql`
  - updated `supabase/schema.sql`
  - updated `seed_db.mjs` to optionally seed technicians
Jakob prompted about RLS. Instructed to click Run and Enable RLS since backend uses service role key.
Jakob wants to build a new house scraper and asked about real heat maps.
Asked Jakob to clarify the target for the new house scraper since it wasn't in MEMORY.md.
Walking Jakob through getting a Mapbox API key for the real heat map.


## CURRENT PENDING TASKS (As of June 5, 2026)
*We have several half-built features that need to be finished before moving on.*

**1. Meta & Google Marketing (Half-Built)**
- **Done:** UI buttons, OAuth endpoints (code), posting logic (code), DB schema updated.
- **Needs Finish:** Create actual Meta/Google Developer apps, get Client IDs, put them in Vercel `.env`, and run a live end-to-end test of an automated post.

**2. GoHighLevel (GHL) Sync & Webhooks (Half-Built)**
- **Done:** Webhook endpoint built to catch inbound texts/appointments, sync endpoint built to pull contacts from GHL V2 API.
- **Needs Finish:** Send a test payload from a GHL account to verify the webhook writes to Supabase, and trigger the manual sync to verify contacts pull correctly.

**3. Material Pricing Catalog / Receipt OCR (Completed!)**
- **Done:** SendGrid email parser successfully reads inbound wholesale receipts, drops line items into the `receipts` table, and upserts live material costs directly into the newly created `material_catalog` table so the AI Estimating engine always has the exact, up-to-the-minute wholesale price.

**4. Google Calendar Two-Way Sync (Half-Built)**
- **Done:** Blueprint JSON exists (`office_angel_calendar_sync_blueprint.json`) for Make.com.
- **Needs Finish:** Actually deploy the Make.com scenario and test that creating a Google Calendar event auto-creates a Job Ticket in the Dispatch board.


**5. Enterprise Fleet Radar & Geofencing (Half-Built)**
- **Done:** UI built for live tracking on the dispatch map. Mock data scripts written.
- **Needs Finish:** Native mobile app build (React Native/Expo) that utilizes background geolocation to trigger 30ft geofence auto clock-in/out, and pushing the live coordinates back to Supabase.

**6. Financials Dashboard / Stripe / QuickBooks (Half-Built)**
- **Done:** Basic UI for the Financials tab exists.
- **Needs Finish:** Wiring live Stripe/QuickBooks API data into the dashboard so it accurately reflects real revenue and material costs.

**7. Native Field App (Half-Built)**
- **Done:** Basic Expo structure exists (`field-os-app` folder).
- **Needs Finish:** Finalizing the mobile UI for the technicians in the field, wiring up the job ticket view, and pushing the TestFlight build to your phone.
