import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  try {
    const company_id = "5341bfb2-8fce-4c7a-9a30-20e6aba60a8a"; // Office Angel Dev
    
    // 1. Create an estimate
    const { data: est, error } = await supabase.from('estimates').insert({
      company_id,
      customer_name: "Jakob Flow Test",
      customer_email: "jakobtest@example.com",
      status: "draft",
      total_amount: 500
    }).select().single();
    
    if (error) {
       console.log("Insert error:", error);
       return;
    }
    
    // 2. Add item
    await supabase.from('estimate_items').insert({
      estimate_id: est.id,
      description: "Flow Test Panel",
      quantity: 1,
      rate: 500
    });
    
    console.log("Created estimate:", est.id);
    
    // 3. Hit the POST approve endpoint
    const res = await fetch(`https://hardhat-solutions.com/api/estimates/${est.id}`, {
      method: 'POST'
    });
    
    console.log("Approve status:", res.status);
    const data = await res.json();
    console.log("Approve response:", data);
  } catch (err) {
    console.log("Exception:", err);
  }
}
run();
