require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testMatch(searchTerm) {
  console.log(`\nTesting search term: "${searchTerm}"`);
  const safeSearch = searchTerm.trim().substring(0, 15);
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, address')
    .or(`title.ilike.%${safeSearch}%,address.ilike.%${safeSearch}%`);
    
  if (error) console.error(error);
  else console.log('Matches:', data.length ? data : 'None');
}

async function run() {
  await testMatch("144 Huntington");
  await testMatch("Huntington");
  await testMatch("Jacob");
}
run();
