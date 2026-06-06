import { createClient } from '@supabase/supabase-js';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// just a quick check to see if we can create a table via raw SQL if possible
