import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztknhbilfergfwoxjzvb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('companies').select('id, name, phone_number, forward_to_phone, ai_enabled').limit(1);
  console.log("Company:", JSON.stringify(data[0], null, 2));
}
check();
