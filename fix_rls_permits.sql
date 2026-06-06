DROP POLICY IF EXISTS "Allow public read access" on permits;
CREATE POLICY "Allow public read access" ON permits FOR READ USING (true);
