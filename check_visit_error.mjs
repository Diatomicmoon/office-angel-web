import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('/home/jakob/.openclaw/workspace/office-angel-web', '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testInsert() {
  const dbVisit = {
    company_id: 'a293eb4c-6a95-40b8-8324-bc493ec6b227', // Hardhat
    resident_name: 'Test Resident',
    address: '123 Test St',
    latitude: 44.9778,
    longitude: -93.2650,
    interest_level: 'not_interested',
    sales_rep_name: 'Christian',
    notes: 'Test note',
    visited_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('door_knocking_visits')
    .insert([dbVisit])
    .select();

  console.log('Result:', data);
  console.log('Error:', error);
}

testInsert();
