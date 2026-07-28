const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ztknhbilfergfwoxjzvb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4'
);

async function fix() {
  const { data: tech } = await supabase.from('technicians').select('id, name').ilike('name', '%Jakob%').single();
  if (tech) {
    const { data: openTimesheets } = await supabase
      .from('timesheets')
      .select('id, clock_in')
      .eq('technician_id', tech.id)
      .is('clock_out', null);
      
    if (openTimesheets && openTimesheets.length > 0) {
      console.log(`Found ${openTimesheets.length} open timesheets for ${tech.name}. Clocking out...`);
      for (const ts of openTimesheets) {
        const { error } = await supabase
          .from('timesheets')
          .update({ 
            clock_out: new Date().toISOString()
          })
          .eq('id', ts.id);
        if (error) console.error("Error updating:", error);
        else console.log(`Clocked out timesheet ${ts.id}`);
      }
    } else {
      console.log("No open timesheets found.");
    }
  }
}
fix();
