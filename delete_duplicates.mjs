import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = "https://ztknhbilfergfwoxjzvb.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4";

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
async function run() {
   const { data, error } = await supabase.from('new_build_permits').select('id, property_address');
   
   const seen = new Set();
   const toDelete = [];
   
   for (let row of data) {
      if (seen.has(row.property_address)) {
         toDelete.push(row.id);
      } else {
         seen.add(row.property_address);
      }
   }
   
   console.log(`Found ${toDelete.length} duplicate IDs to delete.`);
   
   if (toDelete.length > 0) {
      // Chunk deletions
      for (let i = 0; i < toDelete.length; i += 100) {
          const chunk = toDelete.slice(i, i + 100);
          await supabase.from('new_build_permits').delete().in('id', chunk);
          console.log(`Deleted chunk of ${chunk.length}`);
      }
   }
}
run();
