import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resolveCompanyIdOrThrow } from "@/lib/tenant";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const { data, error } = await db()
      .from("supply_runner_items")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ items: data || [] });
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e.message }, { status: 200 }); // soft fail — client falls back to localStorage
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const body = await req.json();
    const { action, item, items, id } = body;

    const supabase = db();

    if (action === "add" && item) {
      const { data, error } = await supabase
        .from("supply_runner_items")
        .insert({ ...item, company_id: companyId })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ item: data });
    }

    if (action === "remove" && id) {
      const { error } = await supabase
        .from("supply_runner_items")
        .delete()
        .eq("id", id)
        .eq("company_id", companyId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "update_qty" && id) {
      const { error } = await supabase
        .from("supply_runner_items")
        .update({ quantity: body.quantity })
        .eq("id", id)
        .eq("company_id", companyId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "clear") {
      const { error } = await supabase
        .from("supply_runner_items")
        .delete()
        .eq("company_id", companyId);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
