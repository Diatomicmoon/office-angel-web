import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://ztknhbilfergfwoxjzvb.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0a25oYmlsZmVyZ2Z3b3hqenZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3NzY5OSwiZXhwIjoyMDkzMjUzNjk5fQ.t09nd5WOoMblmxBClKdMobESWklh2hADUfFFpRQ1hs4"
);

const carverCities = ['chaska', 'chanhassen', 'carver', 'waconia', 'victoria', 'cologne', 'mayer', 'norwood'];

async function cleanTable(tableName) {
  console.log(`Checking ${tableName}...`);
  const { data, error } = await supabase
    .from(tableName)
    .select('id, property_address, city, latitude, longitude')
    .gt('latitude', 44.9);
    
  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return;
  }

  let count = 0;
  for (const d of data) {
     const addr = (d.property_address || "").toLowerCase();
     const city = (d.city || "").toLowerCase();
     
     const isCarverCounty = carverCities.some(c => addr.includes(c) || city.includes(c));
     
     if (isCarverCounty) {
         console.log(` - Wiping: ${d.property_address}, ${d.city} (Lat: ${d.latitude})`);
         await supabase.from(tableName).update({ latitude: null, longitude: null }).eq('id', d.id);
         count++;
     }
  }
  console.log(`Done wiping ${count} bad pins from ${tableName}.`);
}

async function run() {
  await cleanTable('new_build_permits');
  
  // For leads, we also need to check the 'address' column if property_address is empty
  console.log(`Checking leads...`);
  const { data, error } = await supabase
    .from('leads')
    .select('id, property_address, address, city, latitude, longitude')
    .gt('latitude', 44.9);
    
  if (!error && data) {
    let count = 0;
    for (const d of data) {
       const addr = (d.property_address || d.address || "").toLowerCase();
       const city = (d.city || "").toLowerCase();
       
       const isCarverCounty = carverCities.some(c => addr.includes(c) || city.includes(c));
       
       if (isCarverCounty) {
           console.log(` - Wiping: ${addr}, ${city} (Lat: ${d.latitude})`);
           await supabase.from('leads').update({ latitude: null, longitude: null }).eq('id', d.id);
           count++;
       }
    }
    console.log(`Done wiping ${count} bad pins from leads.`);
  }
}

run();
