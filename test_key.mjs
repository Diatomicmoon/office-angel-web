import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ztknhbilfergfwoxjzvb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4'
);

async function main() {
  const { data, error } = await supabase.from('hennepin_parcels').select('id').limit(1);
  if (error) {
    console.error("Test failed:", error.message);
  } else {
    console.log("Test passed! Key is valid and table exists.");
  }
}
main();
