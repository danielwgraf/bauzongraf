-- Create parties and party_members tables for managing invite lists
-- This replaces the hardcoded invite list with database storage

-- Parties table - represents each invited party/family
CREATE TABLE IF NOT EXISTS parties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    last_name TEXT NOT NULL, -- Primary last name for lookup
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Party members table - individual people in each party
CREATE TABLE IF NOT EXISTS party_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_parties_last_name ON parties(last_name);
CREATE INDEX idx_party_members_party_id ON party_members(party_id);
CREATE INDEX idx_party_members_last_name ON party_members(last_name);

-- Optional: Add RLS policies if needed
-- ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;

