import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://ztknhbilfergfwoxjzvb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4'
);

async function check() {
  const { data: msgs } = await supabase
    .from('messages')
    .select('id, body, created_at, meta')
    .eq('channel', 'email')
    .order('created_at', { ascending: false })
    .limit(1);
  console.log('Messages:', JSON.stringify(msgs, null, 2));
}
check();
