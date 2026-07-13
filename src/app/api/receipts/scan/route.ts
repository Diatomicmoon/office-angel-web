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

CRITICAL CLASSIFICATION RULES:
FOR RECEIPTS / LINE ITEMS: Supply houses often use cryptic abbreviations, SKU codes, or raw manufacturer part numbers (e.g., "QBT GBD-1", "ARF 3300K", "1P CW-1-SP", "1P SYNC-159-1W"). For each line item, you MUST attempt to extract a precise "sku" (the exact part number/model number shown) and the "unit_of_measure" (e.g., "BOX", "FT", "EA", "ROLL"). If a formal SKU is not present, you can use the expanded description as the SKU, but prioritize actual part numbers. DO NOT just copy the raw cryptic part numbers into the "item_name" (description). Use your deep knowledge of electrical materials to translate and expand these into plain English trade names that an electrician would actually say on the jobsite (e.g., "Ground Bar", "LED Wafer Light 3000K", "Single Pole Switch", "1-Gang Faceplate"). If it's already clear (like "500' 12-2 WIRE NM ROMEX"), keep it.

FOR SUPPLIER NAME (Receipts only): Do NOT use the contractor's name (e.g., Schlemmer Electric) as the supplier. Look for the wholesale supply house or store that actually generated the receipt (e.g., "JH Larson", "Viking Electric", "Home Depot", "CED", "Graybar", "Menards", "Lowe's"). Ensure "JH Larson" and similar companies are ALWAYS placed here in 'supplier_name', never in 'job_number_or_po'. If the receipt was forwarded, look at the original sender's email address domain.

{
  "supplier_name": "string",
  "total_amount": 0.00,
  "line_items": [
    {
      "sku": "string or null",
      "item_name": "string",
      "quantity": 1,
      "unit_price": 0.00,
      "unit_of_measure": "string or null",
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

    // 4. Update the material_catalog
    if (parsedData.line_items && parsedData.line_items.length > 0) {
      const catalogUpserts = parsedData.line_items.map((item: any) => ({
        company_id: companyId,
        sku: item.sku || item.item_name || item.description, // Prioritize AI-extracted SKU, fallback to item_name/description
        item_name: item.item_name || item.description, // Use AI's plain English name
        unit_price: item.unit_price || 0,
        unit_of_measure: item.unit_of_measure || 'EA', // Default to Each
        supplier: parsedData.supplier_name || "Unknown Supplier",
        last_updated: new Date().toISOString()
      })).filter((item: any) => item.unit_price > 0 && item.sku);

      if (catalogUpserts.length > 0) {
        // Upsert into material_catalog (updates if company_id + sku exists, inserts if new)
        const { error: catalogError } = await supabase
          .from('material_catalog')
          .upsert(catalogUpserts, { onConflict: 'company_id, sku' });
          
        if (catalogError) console.error('[Pricing Engine Upsert Error (Scan)]: ', catalogError);
        else console.log(`[Pricing Engine (Scan)] Successfully updated ${catalogUpserts.length} prices for company ${companyId}`);
      }
    }

    return NextResponse.json({ success: true, receipt: receiptRecord });
  } catch (error: any) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: error.message || "Failed to scan receipt" }, { status: 500 });
  }
}
