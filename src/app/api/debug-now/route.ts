export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export async function POST() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  
  // Hard Hat Solutions company ID from memory
  const companyId = process.env.HARD_HAT_COMPANY_ID || process.env.OFFICE_ANGEL_COMPANY_ID || '8e53126d-d9a7-414c-8291-8657fbf43123';
  
  const techs = [
    {
      company_id: companyId,
      name: "Jake (North Metro)",
      phone_number: "6125550101",
      status: "Available",
      last_location: JSON.stringify({ lat: 45.02, lng: -93.30, speed: 0, timestamp: new Date().toISOString() })
    },
    {
      company_id: companyId,
      name: "Sarah (South Metro)",
      phone_number: "6125550102",
      status: "Driving",
      last_location: JSON.stringify({ lat: 44.85, lng: -93.25, speed: 45, timestamp: new Date().toISOString() })
    },
    {
      company_id: companyId,
      name: "Mike (West Metro)",
      phone_number: "6125550103",
      status: "On Site",
      last_location: JSON.stringify({ lat: 44.92, lng: -93.45, speed: 0, timestamp: new Date().toISOString() })
    }
  ];

  const { data, error } = await supabase.from('technicians').insert(techs).select();
  return NextResponse.json({ data, error });
}