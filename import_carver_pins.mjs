import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = "https://ztknhbilfergfwoxjzvb.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4";

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const newBuilds = JSON.parse(fs.readFileSync('/home/jakob/.openclaw/workspace/office-angel-web/carver_new_builds.json'));

async function run() {
    const { data: companies } = await supabase.from('companies').select('id').limit(1);
    const companyId = companies?.[0]?.id;

    // To prevent total duplication, let's fetch existing addresses first
    const { data: existing } = await supabase.from('new_build_permits').select('property_address');
    const existingAddresses = new Set(existing.map(e => e.property_address));

    const permitsToInsert = newBuilds.map(b => {
           return {
             company_id: companyId,
             property_address: b.address || 'Unknown',
             city: b.city || 'Unknown',
             zip_code: b.zip || '',
             contractor_name: b.owner_name || 'Owner / Unknown',
             status: 'foundation',
             estimated_completion_date: '2026-09-01',
             permit_date: '2026-01-01',
           };
    }).filter(p => p.property_address !== 'Unknown' && p.property_address.length > 3 && !existingAddresses.has(p.property_address));

    console.log(`Ready to insert ${permitsToInsert.length} valid new builds (after checking duplicates)`);
    
    const batchSize = 100;
    let successCount = 0;
    for (let i = 0; i < permitsToInsert.length; i += batchSize) {
        const batch = permitsToInsert.slice(i, i + batchSize);
        const { error } = await supabase.from('new_build_permits').insert(batch);
        if (error) {
           console.log("DB Insert Error on batch:", error.message);
        } else {
           successCount += batch.length;
        }
    }
    console.log(`Successfully pushed ${successCount} Carver new builds to Supabase for the map!`);
}
run();
