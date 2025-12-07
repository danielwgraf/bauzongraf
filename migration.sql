-- Migration script for rsvps table
-- This script safely adds new columns to support party-based RSVPs

-- Step 1: Add new columns if they don't exist
-- (Supabase/PostgreSQL doesn't have IF NOT EXISTS for columns, so we'll use DO block)

DO $$ 
BEGIN
    -- Add party_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rsvps' AND column_name = 'party_id'
    ) THEN
        ALTER TABLE rsvps ADD COLUMN party_id TEXT;
    END IF;

    -- Add last_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rsvps' AND column_name = 'last_name'
    ) THEN
        ALTER TABLE rsvps ADD COLUMN last_name TEXT;
    END IF;

    -- Add member_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rsvps' AND column_name = 'member_id'
    ) THEN
        ALTER TABLE rsvps ADD COLUMN member_id TEXT;
    END IF;

    -- Add member_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rsvps' AND column_name = 'member_name'
    ) THEN
        ALTER TABLE rsvps ADD COLUMN member_name TEXT;
    END IF;

    -- Add dietary_restrictions column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rsvps' AND column_name = 'dietary_restrictions'
    ) THEN
        ALTER TABLE rsvps ADD COLUMN dietary_restrictions TEXT;
    END IF;
END $$;

-- Step 2: Optional - Migrate existing data if you have old format data
-- Uncomment and modify this section if you have existing RSVPs with the old 'name' column
-- that you want to migrate to the new format

/*
DO $$
BEGIN
    -- Check if old 'name' column exists and has data
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rsvps' AND column_name = 'name'
    ) THEN
        -- Migrate old data: split name into first/last, create member_name
        UPDATE rsvps
        SET 
            member_name = COALESCE(name, 'Unknown'),
            last_name = CASE 
                WHEN name IS NOT NULL AND position(' ' in name) > 0 
                THEN substring(name from position(' ' in name) + 1)
                ELSE COALESCE(name, 'Unknown')
            END,
            member_id = id::text || '-migrated',
            party_id = id::text || '-party'
        WHERE member_name IS NULL OR member_name = '';
    END IF;
END $$;
*/

-- Step 3: Optional - Remove old 'name' column if it exists and you've migrated the data
-- WARNING: Only run this after verifying your data migration worked correctly!
-- Uncomment the line below if you want to remove the old 'name' column:

-- ALTER TABLE rsvps DROP COLUMN IF EXISTS name;

-- Step 4: Create indexes for better query performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_rsvps_party_id ON rsvps(party_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_last_name ON rsvps(last_name);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at DESC);

