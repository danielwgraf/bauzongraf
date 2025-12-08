-- Create rsvp_history table to track all RSVP changes
-- This table maintains a complete audit trail of RSVP updates

CREATE TABLE IF NOT EXISTS rsvp_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rsvp_id UUID NOT NULL REFERENCES rsvps(id) ON DELETE CASCADE,
    party_id TEXT NOT NULL,
    last_name TEXT NOT NULL,
    member_id TEXT NOT NULL,
    member_name TEXT NOT NULL,
    email TEXT NOT NULL,
    is_attending BOOLEAN NOT NULL,
    dietary_restrictions TEXT,
    action TEXT NOT NULL, -- 'created', 'updated', 'deleted'
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    previous_values JSONB -- Store previous values for comparison
);

-- Create indexes for better query performance
CREATE INDEX idx_rsvp_history_rsvp_id ON rsvp_history(rsvp_id);
CREATE INDEX idx_rsvp_history_party_id ON rsvp_history(party_id);
CREATE INDEX idx_rsvp_history_changed_at ON rsvp_history(changed_at DESC);
CREATE INDEX idx_rsvp_history_email ON rsvp_history(email);

-- Optional: Add RLS policies if needed
-- ALTER TABLE rsvp_history ENABLE ROW LEVEL SECURITY;

