const { Client } = require('pg');
require('dotenv').config({ path: '.env' });
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL });
  await client.connect();
  await client.query("ALTER TABLE public.new_build_permits ADD COLUMN IF NOT EXISTS notes TEXT;");
  console.log("Success");
  await client.end();
}
run();
