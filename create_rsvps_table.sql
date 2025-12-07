-- Create rsvps table from scratch (use this if starting fresh)
-- Run this in your Supabase SQL editor if the table doesn't exist yet

CREATE TABLE IF NOT EXISTS rsvps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    party_id TEXT NOT NULL,
    last_name TEXT NOT NULL,
    member_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    email TEXT NOT NULL,
    is_attending BOOLEAN NOT NULL DEFAULT false,
    dietary_restrictions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_rsvps_party_id ON rsvps(party_id);
CREATE INDEX idx_rsvps_last_name ON rsvps(last_name);
CREATE INDEX idx_rsvps_created_at ON rsvps(created_at DESC);
CREATE INDEX idx_rsvps_email ON rsvps(email);

-- Optional: Add RLS (Row Level Security) policies if needed
-- ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Example policy to allow anyone to insert (for public RSVP form)
-- CREATE POLICY "Allow public inserts" ON rsvps
--     FOR INSERT
--     TO anon
--     WITH CHECK (true);

-- Example policy to allow authenticated users to read (for admin)
-- CREATE POLICY "Allow authenticated reads" ON rsvps
--     FOR SELECT
--     TO authenticated
--     USING (true);

