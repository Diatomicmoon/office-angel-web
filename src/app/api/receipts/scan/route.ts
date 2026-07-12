import { resolveCompanyIdOrThrow } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

  let companyId;
  try {
    const res = await resolveCompanyIdOrThrow();
    companyId = res.companyId;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const jobId = formData.get("job_id") as string;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // 1. Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${companyId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage Error:", uploadError);
      return NextResponse.json({ error: "Failed to upload receipt image" }, { status: 500 });
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage.from("receipts").getPublicUrl(fileName);
    const imageUrl = publicUrlData.publicUrl;

    // 2. Call OpenAI Vision to parse it
    const base64Image = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert receipt parser. Extract the supplier/vendor name, the total amount, and all line items from the provided receipt image. 
Return ONLY a raw JSON object (no markdown formatting, no \`\`\`json) with the following structure:
{
  "supplier_name": "string",
  "total_amount": 0.00,
  "line_items": [
    {
      "description": "string",
      "qty": 1,
      "unit_price": 0.00,
      "total_price": 0.00
    }
  ]
}`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Parse this receipt." },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiContent = completion.choices[0]?.message?.content || "{}";
    const parsedData = JSON.parse(aiContent);

    // 3. Save to Supabase `receipts` table
    const payload = {
      company_id: companyId,
      job_id: jobId || null,
      supplier_name: parsedData.supplier_name || "Unknown Supplier",
      total_amount: parsedData.total_amount || 0,
      receipt_url: imageUrl,
      line_items: parsedData.line_items || [],
      status: "Verified",
    };

    const { data: receiptRecord, error: dbError } = await supabase
      .from("receipts")
      .insert([payload])
      .select()
      .single();

    if (dbError) {
      console.error("DB Error:", dbError);
      return NextResponse.json({ error: "Failed to save receipt record" }, { status: 500 });
    }

    return NextResponse.json({ success: true, receipt: receiptRecord });
  } catch (error: any) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: error.message || "Failed to scan receipt" }, { status: 500 });
  }
}
