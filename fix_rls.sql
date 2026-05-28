-- Drop the policy if it exists and recreate it to allow anon reads for dev
DROP POLICY IF EXISTS "Allow public read access" on companies;
CREATE POLICY "Allow public read access" ON companies FOR READ USING (true);
