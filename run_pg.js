const { Client } = require('pg');
require('dotenv').config({ path: '.env' });
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL });
  await client.connect();
  await client.query("ALTER TABLE public.timesheets ADD COLUMN IF NOT EXISTS edited_manually BOOLEAN DEFAULT false;");
  console.log("Success");
  await client.end();
}
run();
