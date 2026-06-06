CREATE TABLE IF NOT EXISTS public.hennepin_parcels (
    id SERIAL PRIMARY KEY,
    owner_name TEXT,
    address TEXT,
    city TEXT,
    zip TEXT,
    build_yr INTEGER,
    sqft INTEGER,
    last_sale_price INTEGER,
    last_sale_date TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

-- Index for fast spatial lookups
CREATE INDEX IF NOT EXISTS idx_hennepin_lat_lon ON public.hennepin_parcels (latitude, longitude);
