# Captain’s Log (local buffer)

Source Sheet: https://docs.google.com/spreadsheets/d/1IUN6jvhaIj1H9YO9uMyhd2pGvNhCWV6fUi4HEXBTEmw/edit?gid=0

> This file is the local “buffer” log until Google Sheets write-access is connected.

## 2026-05-05 (America/Chicago)
- Shifted focus away from TradeVolt and into **Office Angel**.
- Confirmed local repo presence: `office-angel-web/` (Next.js + Supabase tooling/scripts).
- Re-stated current Office Angel status (as of 2026-05-04): dashboard mostly built; AI Call Summaries + KPI boxes wired to Supabase; Vapi webhook saving end-of-call transcripts.
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
