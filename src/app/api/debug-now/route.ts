export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export async function POST() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  
  const companyIds = [
    '8e53126d-d9a7-414c-8291-8657fbf43123', // Christians Demo
    '5341bfb2-8fce-4c7a-9a30-20e6aba60a8a', // Office Angel Dev / Hard Hat
    'd335e254-2a5f-4f68-b9e4-4416bd44a67b', // One More Yard
    'a293eb4c-6a95-40b8-8324-bc493ec6b227'  // Hardhat Electric (Current Active)
  ];

  let allTechs: any[] = [];
  
  for (const cid of companyIds) {
    allTechs.push(
      {
        company_id: cid,
        name: "Jake (North Metro)",
        phone_number: "6125550101",
        status: "Available",
        last_location: JSON.stringify({ lat: 45.02, lng: -93.30, speed: 0, timestamp: new Date().toISOString() })
      },
      {
        company_id: cid,
        name: "Sarah (South Metro)",
        phone_number: "6125550102",
        status: "Driving",
        last_location: JSON.stringify({ lat: 44.85, lng: -93.25, speed: 45, timestamp: new Date().toISOString() })
      },
      {
        company_id: cid,
        name: "Mike (West Metro)",
        phone_number: "6125550103",
        status: "On Site",
        last_location: JSON.stringify({ lat: 44.92, lng: -93.45, speed: 0, timestamp: new Date().toISOString() })
      }
    );
  }

  const { data, error } = await supabase.from('technicians').insert(allTechs).select();
  return NextResponse.json({ data, error });
}