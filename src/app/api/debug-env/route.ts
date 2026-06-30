export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  
  // Create material catalog table
  const { error: createError } = await supabase.rpc('execute_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS material_catalog (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
        sku VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        cost_price DECIMAL(10, 2) NOT NULL,
        retail_price DECIMAL(10, 2),
        supplier VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(company_id, sku)
      );

      -- Enable RLS
      ALTER TABLE material_catalog ENABLE ROW LEVEL SECURITY;

      -- Create policy for viewing materials
      DROP POLICY IF EXISTS "Users can view their company's material catalog" ON material_catalog;
      CREATE POLICY "Users can view their company's material catalog" 
      ON material_catalog FOR SELECT 
      USING (company_id IN (
        SELECT company_id FROM company_memberships WHERE user_id = auth.uid()
      ));

      -- Create policy for inserting materials
      DROP POLICY IF EXISTS "Users can insert their company's material catalog" ON material_catalog;
      CREATE POLICY "Users can insert their company's material catalog" 
      ON material_catalog FOR INSERT 
      WITH CHECK (company_id IN (
        SELECT company_id FROM company_memberships WHERE user_id = auth.uid()
      ));

      -- Create policy for updating materials
      DROP POLICY IF EXISTS "Users can update their company's material catalog" ON material_catalog;
      CREATE POLICY "Users can update their company's material catalog" 
      ON material_catalog FOR UPDATE 
      USING (company_id IN (
        SELECT company_id FROM company_memberships WHERE user_id = auth.uid()
      ));
    `
  });
  
  return NextResponse.json({ createError });
}
