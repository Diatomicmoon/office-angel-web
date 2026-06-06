import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL="(.*?)"/);
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY="(.*?)"/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
  const { data: jobs } = await supabase.from('jobs').select('*').limit(1);
  if (jobs && jobs.length > 0) {
    console.log("Columns:", Object.keys(jobs[0]));
  } else {
    console.log("No jobs found");
  }
}
check();
