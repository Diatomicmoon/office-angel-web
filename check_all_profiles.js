import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  'https://ztknhbilfergfwoxjzvb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4'
);
async function run() {
  const { data: profiles } = await supabase.from("profiles").select("*");
  console.log("Profiles:", profiles);
}
run();
