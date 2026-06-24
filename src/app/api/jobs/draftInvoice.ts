import { SupabaseClient } from "@supabase/supabase-js";

export async function draftInvoiceForJob(supabase: SupabaseClient, job: any, companyId: string) {
  try {
    if (String(job.status).toLowerCase() !== "completed") return;

    // Check if invoice already exists
    const { data: existing } = await supabase
      .from("invoices")
      .select("id")
      .eq("job_id", job.id)
      .maybeSingle();

    if (existing) return; // already drafted

    // Fetch customer
    const { data: cust } = await supabase
      .from("customers")
      .select("first_name, last_name, email, phone_number")
      .eq("id", job.customer_id)
      .maybeSingle();

    if (!cust) return;

    const customerName = [cust.first_name, cust.last_name].filter(Boolean).join(" ") || "Customer";
    const amount = job.quoted_amount || 0.00;

    // Create draft invoice
    const { data: inv, error: invError } = await supabase
      .from("invoices")
      .insert({
        company_id: companyId,
        job_id: job.id,
        customer_name: customerName,
        customer_email: cust.email,
        customer_phone: cust.phone_number,
        amount: amount,
        status: "pending"
      })
      .select()
      .single();

    if (invError || !inv) return;

    // Insert single line item for the job
    await supabase.from("invoice_items").insert({
      invoice_id: inv.id,
      description: job.title || "Services Rendered",
      quantity: 1,
      rate: amount
    });
  } catch (error) {
    console.error("Auto invoice draft error", error);
  }
}
