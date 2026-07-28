import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  'https://ztknhbilfergfwoxjzvb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4'
);
async function run() {
  // Get all companies to see which one is Hard Hat Solutions
  const { data: companies } = await supabase.from("companies").select("*");
  console.log("Companies:", companies);

  // Update Steve to be Jakob and move him to the correct company
  const { data: updateData, error: updateErr } = await supabase.from("technicians")
    .update({ 
      name: "Jakob", 
      company_id: "5341bfb2-8fce-4c7a-9a30-20e6aba60a8a" // The HHS company ID from memory
    })
    .eq("id", "8dcd18c7-e3d7-4422-9f4b-6bb4e6df2f10");
  
  console.log("Update Error:", updateErr);
  
  // Verify the updated tech
  const { data: tech } = await supabase.from("technicians").select("*").eq("id", "8dcd18c7-e3d7-4422-9f4b-6bb4e6df2f10");
  console.log("Updated Tech:", tech);
}
run();
