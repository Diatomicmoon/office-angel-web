import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: company } = await supabase.from("companies").select("*").limit(1).single();
  const url = `https://sandbox-quickbooks.api.intuit.com/v3/company/${company.quickbooks_realm_id}/reports/ProfitAndLoss?minorversion=70`;
  const res = await fetch(url, { headers: { "Authorization": `Bearer ${company.quickbooks_access_token}`, "Accept": "application/json" } });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}
run();
