const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('companies').insert({
    name: 'Green Glass Co',
    is_trial: true
  }).select().single();
  
  if (error) {
    console.error(error);
  } else {
    console.log('Created:', data.id);
  }
}
run();
