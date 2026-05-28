import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ztknhbilfergfwoxjzvb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4';
const supabase = createClient(supabaseUrl, supabaseKey);
async function check() {
  const { data } = await supabase.from('companies').select('name, phone_number, forward_to_phone, ai_enabled').limit(1);
  console.log(JSON.stringify(data, null, 2));
}
check();
