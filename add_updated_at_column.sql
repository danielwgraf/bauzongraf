-- Add updated_at column to rsvps table
-- This column will track when RSVPs are last updated

DO $$ 
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rsvps' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE rsvps ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Create index for better query performance
        CREATE INDEX IF NOT EXISTS idx_rsvps_updated_at ON rsvps(updated_at DESC);
    END IF;
END $$;

