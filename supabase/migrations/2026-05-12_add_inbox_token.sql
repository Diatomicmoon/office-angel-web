ALTER TABLE companies ADD COLUMN inbox_token UUID DEFAULT gen_random_uuid();
