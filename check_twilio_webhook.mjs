// Check if the twilio-voice route is throwing an error before generating TwiML
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/home/jakob/.openclaw/workspace/office-angel-web/.env.production.local' });

console.log("Checking Vapi Assistant ID from ENV:");
console.log(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID);
