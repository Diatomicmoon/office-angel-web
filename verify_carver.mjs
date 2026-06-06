import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = "https://ztknhbilfergfwoxjzvb.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4";

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    // Let's check if the map pins (new builds) are there
    const { count: pinCount, error: pinError } = await supabase
       .from('new_build_permits')
       .select('*', { count: 'exact', head: true })
       .ilike('notes', '%County Tax Record%');

    // Let's check a few specific records from the parcel table
    const { data: parcels, error: parcelError } = await supabase
       .from('hennepin_parcels')
       .select('*')
       .ilike('city', '%Chaska%')
       .limit(3);

    console.log("Map Pins from Carver:", pinCount, pinError || "OK");
    console.log("Sample parcels in Chaska:", parcels);
}
run();
