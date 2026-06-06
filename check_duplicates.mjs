import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = "https://ztknhbilfergfwoxjzvb.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4";

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
async function run() {
   const { data, error } = await supabase.from('new_build_permits').select('property_address');
   const counts = {};
   for (let row of data) {
      counts[row.property_address] = (counts[row.property_address] || 0) + 1;
   }
   const duplicates = Object.entries(counts).filter(([addr, count]) => count > 1);
   console.log(`Found ${duplicates.length} duplicate addresses`);
   if (duplicates.length > 0) {
       console.log("Sample duplicates:", duplicates.slice(0, 5));
   }
}
run();
