require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const omyId = 'd335e254-2a5f-4f68-b9e4-4416bd44a67b';
  await supabase.from('jobs').update({
    title: 'Web Lead: i need a lawn cut',
    notes: 'i need a lawn cut'
  }).eq('id', '47e73e17-1a8a-4432-a844-fe698a163cb8');
  console.log('Fixed the recent lead in the DB.');
}
run();
