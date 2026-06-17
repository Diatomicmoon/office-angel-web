import { resolveCompanyIdOrThrow } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tenantMode = process.env.HARD_HAT_TENANT_MODE || process.env.OFFICE_ANGEL_TENANT_MODE || "auth";
    const res = await resolveCompanyIdOrThrow();
    return NextResponse.json({ tenantMode, res, env: { 
      HARD: process.env.HARD_HAT_TENANT_MODE, 
      OA: process.env.OFFICE_ANGEL_TENANT_MODE 
    } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
