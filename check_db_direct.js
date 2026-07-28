import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  'https://ztknhbilfergfwoxjzvb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4'
);
async function run() {
  const { data: techs, error: e1 } = await supabase.from("technicians").select("*");
  console.log("Techs:", techs);
  
  const { data: locations, error: e2 } = await supabase.from("fleet_locations").select("*").order('created_at', { ascending: false }).limit(5);
  console.log("Locations:", locations);
}
run();
