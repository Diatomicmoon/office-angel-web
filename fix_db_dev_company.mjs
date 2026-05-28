import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ztknhbilfergfwoxjzvb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4';
const supabase = createClient(supabaseUrl, supabaseKey);
async function check() {
  await supabase.from('companies').update({ ai_enabled: true, forward_to_phone: null }).eq('id', '5341bfb2-8fce-4c7a-9a30-20e6aba60a8a');
  console.log("Updated Office Angel Dev to AI Enabled = true, forward = null");
}
check();
