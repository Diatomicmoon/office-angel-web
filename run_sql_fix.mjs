import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join('/home/jakob/.openclaw/workspace/office-angel-web', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Using the REST API to run an RPC or just query the columns
async function checkCols() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('door_knocking_visits').select('*').limit(1);
    if(data && data.length > 0) {
        console.log(Object.keys(data[0]));
    } else {
        console.log("No data or error", error);
    }
}
checkCols();
