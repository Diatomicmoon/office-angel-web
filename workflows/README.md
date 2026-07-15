# Ghost Dispatcher TaskFlow

This directory contains the TaskFlow definitions for Hard Hat Solutions. 

## What is TaskFlow?
Unlike Make.com or Zapier, TaskFlow provides **durable execution** natively inside OpenClaw. This means a script can run, pause for 14 days waiting for a webhook, survive a power outage, and resume exactly where it left off without timing out.

## The Ghost Dispatcher (`ghost-dispatcher.ts`)
This script manages the complete lifecycle of a job:
1. **Ingest:** Takes lead data (e.g., from a Vapi call completion webhook).
2. **Schedule:** Books the job.
3. **Wait for Completion:** Suspends execution completely until the tech marks the job "Done" in the field.
4. **Invoice:** Generates a Stripe payment link and texts it to the customer via GHL.
5. **Dunning (Follow-up) Loop:** Suspends for 48 hours. Wakes up, checks Stripe. If unpaid, texts a reminder. Suspends again. Repeats until paid.

## How it replaces the old stack
Previously, this required 5 different Make.com scenarios passing data back and forth, prone to silent failures. Now, it is one cohesive TypeScript file running on the local OpenClaw Edge Node.

## To Trigger
In your OpenClaw plugin or webhook handler:
```typescript
import { runGhostDispatcher } from './workflows/ghost-dispatcher';

// When Vapi finishes a call:
app.post('/api/vapi-webhook', async (req, res) => {
    const leadData = extractLeadFromVapi(req.body);
    await runGhostDispatcher(openclawContext, leadData);
    res.status(200).send("Flow started");
});
```