# Hard Hat Solutions — Company Setup Procedure (Scalable)

This is the standardized onboarding checklist to get a new contractor/company live on Hard Hat Solutions.

## Core principles
- **Scale cleanly:** one Twilio subaccount + one phone number per company.
- Store company phone in **E.164** (e.g. `+16123245110`) in `companies.phone_number`.
- Preferred deployment mode for scale: `OFFICE_ANGEL_TENANT_MODE="auth"` (multi-tenant). 
  - Inbound SMS/Voice routes by Twilio **To** number → `companies.phone_number`.
- Pinned mode (single tenant): `OFFICE_ANGEL_TENANT_MODE != "auth"` + `OFFICE_ANGEL_COMPANY_ID`.

---

## The 7 things we need from the company
1) **Company name** (legal/DBA)
2) **Service area** (city/state or coverage region)
3) **Scheduling hours** (Mon–Fri start/end; after-hours emergencies yes/no)
4) **Dispatcher contact**
   - Dispatcher name
   - Dispatcher phone (for Co‑Pilot mode forwarding)
5) **Phone number plan**
   - Port existing business number into Twilio (recommended)
   - Or buy a new Twilio number (fastest)
6) **Website intake**
   - Website URL
   - Where to place widget (site-wide vs contact page)
7) **Users**
   - Name + email + role (owner/dispatcher/tech)

Optional (premium feel): tech list/crew names, lunch block, min notice buffer, texting tone.

---

## Recommended number strategy (best long-term): Port into Twilio
Porting their existing business number into Twilio keeps their brand consistent.

### Port-in pack (what to request)
1) Phone number(s) to port
2) Current carrier
3) Service address on the carrier account (must match exactly)
4) Account holder name / legal business name
5) Account number
6) Port-out PIN / passcode (if required)
7) Recent bill (PDF/screenshot) showing number + account info

### Bridge while port is pending (recommended)
- Buy/provision a temporary Twilio number.
- Have the company enable call forwarding from their current number → temporary Twilio number.
- Once port completes, swap routing to the ported number.

---

## Twilio configuration (post-port or temporary number)
- Voice webhook: `https://www.hardhat-solutions.com/api/twilio-voice`
- SMS webhook: `https://www.hardhat-solutions.com/api/inbound-sms`
- A2P 10DLC compliance may be required for long-code SMS.

---

## Website widget configuration
- Pinned tenant mode (simple embed):
  ```html
  <script src="https://www.hardhat-solutions.com/hardhat-solutions-widget.js"></script>
  ```

- Multi-tenant (auth mode): include company_id + webhook secret
  ```html
  <script
    src="https://www.hardhat-solutions.com/hardhat-solutions-widget.js"
    data-company-id="YOUR_COMPANY_UUID"
    data-secret="YOUR_COMPANY_WEBHOOK_SECRET"
  ></script>
  ```

Endpoint: `POST https://www.hardhat-solutions.com/api/inbound-web`

---

## Internal setup steps (Hard Hat Solutions)
1) Create company row in `companies` (set `phone_number` E.164)
2) Set scheduling hours (`schedule_start_minute`, `schedule_end_minute`)
3) Set `forward_to_phone` for Co‑Pilot mode
4) Add techs (if using dispatch grid)
5) Create user memberships + invite emails
6) Verify inbound tests:
   - SMS → job in AI Parking Lot + messages thread
   - Book & Assign → outbound confirmation (when Twilio SMS is active)
   - YES/NO reply → Confirmed / Reschedule Requested
   - Reschedule window ("tomorrow 9-11am") → suggested schedule prefill

