import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resolveCompanyIdOrThrow } from "@/lib/tenant";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

    const { data: timesheets, error } = await supabase
      .from('timesheets')
      .select('*, technicians(name)')
      .eq('company_id', companyId)
      .order('clock_in', { ascending: false });

    if (error) {
      if (error.message.includes('relation "public.timesheets" does not exist')) {
         return NextResponse.json({ timesheets: [], _setup_required: true });
      }
      throw error;
    }

    return NextResponse.json({ timesheets: timesheets || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

    const body = await req.json();
    const { action, technician_id, id } = body;

    if (action === 'clock_in') {
      const { data, error } = await supabase
        .from('timesheets')
        .insert([{ company_id: companyId, technician_id, clock_in: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ timesheet: data });
    }

    if (action === 'clock_out') {
      const { data, error } = await supabase
        .from('timesheets')
        .update({ clock_out: new Date().toISOString() })
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ timesheet: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

    const body = await req.json();
    const { id, status, ids, action } = body;

    if (action === 'edit_time') {
      const { clock_in, clock_out, id } = body;
      const { data, error } = await supabase
        .from('timesheets')
        .update({ clock_in, clock_out, notes: 'Edited Manually' })
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ timesheet: data });
    }

    if (ids && Array.isArray(ids)) {
      // Bulk update
      const { data, error } = await supabase
        .from('timesheets')
        .update({ status })
        .in('id', ids)
        .eq('company_id', companyId)
        .select();
      if (error) throw error;
      return NextResponse.json({ success: true, updated: data.length });
    }

    const { data, error } = await supabase
      .from('timesheets')
      .update({ status })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();
    if (error) throw error;
    
    return NextResponse.json({ timesheet: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
