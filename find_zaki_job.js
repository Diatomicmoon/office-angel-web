import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  'https://ztknhbilfergfwoxjzvb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4'
);
async function run() {
  const { data: jobs } = await supabase.from("jobs").select("*, company_id");
  const zakiJob = jobs.find(j => j.title?.includes("Zaki") || j.customerName?.includes("Zaki") || j.address?.includes("144 Huntington"));
  console.log("Zaki Job:", zakiJob);
  
  if (zakiJob) {
    const { data: company } = await supabase.from("companies").select("*").eq("id", zakiJob.company_id);
    console.log("Company:", company);
    
    const { data: techs } = await supabase.from("technicians").select("*").eq("company_id", zakiJob.company_id);
    console.log("Techs for this company:", techs);
  }
}
run();
