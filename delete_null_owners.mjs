import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = "https://ztknhbilfergfwoxjzvb.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4";

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { count, error } = await supabase.from('hennepin_parcels').select('*', { count: 'exact', head: true }).is('owner_name', null);
    console.log(`There are ${count} records with null owner_name`);
    
    if (count > 0 && count < 50000) {
        console.log("Deleting null owners to re-insert...");
        const { error: delError } = await supabase.from('hennepin_parcels').delete().is('owner_name', null);
        console.log("Delete result:", delError || "Success");
    }
}
run();
