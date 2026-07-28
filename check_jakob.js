const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ztknhbilfergfwoxjzvb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4'
);

async function run() {
  const { data: tech } = await supabase.from('technicians').select('id, name, last_location, updated_at').ilike('name', '%Jakob%').single();
  console.log("Tech:", tech);
  
  if (tech) {
    const { data: timesheets } = await supabase.from('timesheets').select('*').eq('technician_id', tech.id).order('clock_in', { ascending: false }).limit(3);
    console.log("Recent timesheets:", timesheets);
  }
}
run();
