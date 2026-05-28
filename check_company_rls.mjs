import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Check using the ANON key
const supabaseAnon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data, error } = await supabaseAnon.from('companies').select('id').limit(1);
console.log("Anon key companies fetch error:", error);
console.log("Anon key companies fetch data:", data);
