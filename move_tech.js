const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const techId = 'e0d4dddf-035e-46b1-afe9-fc92ca65257c';
  const companyId = 'a293eb4c-6a95-40b8-8324-bc493ec6b227';
  
  // Just update last_location on the technician directly to see if the map updates
  const { error } = await supabase.from('technicians').update({
    status: 'en route',
    last_location_address: '456 Test Ave, Minneapolis, MN',
    last_location: {
      lat: 44.9778 + (Math.random() * 0.02 - 0.01),
      lng: -93.2650 + (Math.random() * 0.02 - 0.01),
      speed: 45
    },
    updated_at: new Date().toISOString()
  }).eq('id', techId);
  
  // also insert into fleet_locations
  await supabase.from('fleet_locations').insert({
    technician_id: techId,
    company_id: companyId,
    latitude: 44.9778,
    longitude: -93.2650,
    speed: 45
  });

  if (error) console.error(error);
  else console.log('Pinged Jake (North Metro)');
}
run();
