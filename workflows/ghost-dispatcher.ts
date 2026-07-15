import { api } from "@openclaw/runtime";

export async function runGhostDispatcher(ctx, leadData) {
  // Bind or create the TaskFlow using the execution context
  const taskFlow = api.runtime.tasks.flow.fromToolContext(ctx);
  
  // 1. Ingest lead and initialize flow
  const created = taskFlow.createManaged({
    controllerId: "hardhat/ghost-dispatcher",
    goal: `Dispatch and track job for ${leadData.customerName}`,
    currentStep: "schedule_job",
    stateJson: {
      lead: leadData,
      jobId: null,
      invoiceId: null,
      followUpCount: 0
    },
  });
  
  if (!created.flowId) throw new Error("Failed to create flow");

  // 2. Schedule the job (Mocking the external API call)
  console.log(`Scheduling job for ${leadData.customerName}...`);
  const jobId = `job_${Date.now()}`;
  
  // 3. Suspend/wait for "job_completed" event
  // Instead of waiting in memory, we serialize state and sleep until an external webhook wakes us.
  const waitingForJob = taskFlow.setWaiting({
    flowId: created.flowId,
    expectedRevision: created.revision,
    currentStep: "await_job_completed",
    stateJson: {
      ...created.stateJson,
      jobId: jobId
    },
    waitJson: {
      kind: "external_event",
      event: "job_completed",
      jobId: jobId
    }
  });

  if (!waitingForJob.applied) throw new Error("Failed to set waiting state");

  // --- At this point, the script goes to sleep and uses NO resources. ---
  // When a webhook fires (e.g., tech marks job complete), the runtime calls:
  // const resumed = taskFlow.resume(...)
  
  /* --- The below logic runs after the flow is resumed --- */
  
  // 4. Generate and send Stripe invoice
  console.log(`Job ${jobId} completed. Generating Stripe invoice...`);
  const invoiceId = `inv_${Date.now()}`;
  
  let currentRevision = waitingForJob.flow.revision; // In reality, this comes from `resumed.flow.revision`
  let currentState = { ...waitingForJob.flow.stateJson, invoiceId };

  // 5. Follow-up loop (Durable While-Loop)
  let isPaid = false;
  
  while (!isPaid && currentState.followUpCount < 3) {
    // Wait 48 hours for payment, OR wake up instantly if 'invoice_paid' event arrives
    const waitingForPayment = taskFlow.setWaiting({
      flowId: waitingForJob.flow.flowId,
      expectedRevision: currentRevision,
      currentStep: "await_payment",
      stateJson: currentState,
      waitJson: {
        kind: "timeout_or_event",
        event: "invoice_paid",
        invoiceId: invoiceId,
        timeoutMs: 48 * 60 * 60 * 1000 // 48 hours in ms
      }
    });
    
    // --- Flow sleeps again here ---
    
    // Check if resumed due to payment or timeout (simulated for logic flow)
    const resumedReason = "timeout"; // or "invoice_paid" from the incoming webhook
    
    if (resumedReason === "invoice_paid") {
      isPaid = true;
      console.log(`Invoice ${invoiceId} paid!`);
    } else {
      currentState.followUpCount += 1;
      console.log(`Invoice unpaid after 48h. Sending SMS follow-up #${currentState.followUpCount} via GHL...`);
      // Trigger GHL SMS API here
    }
    
    currentRevision = waitingForPayment.flow.revision; // update revision for next loop iteration
  }
  
  // 6. Finish the workflow
  taskFlow.finish({
    flowId: waitingForJob.flow.flowId,
    expectedRevision: currentRevision,
    stateJson: currentState
  });
  
  console.log("Ghost Dispatcher workflow complete.");
}
