# Invites Database Migration Guide

This guide will help you migrate your invite list from the hardcoded array to the database.

## Step 1: Create the Database Tables

Run the SQL script to create the necessary tables:

```sql
-- Run this in your Supabase SQL Editor
-- File: create_invites_tables.sql
```

This creates:
- `parties` table - stores each invited party/family
- `party_members` table - stores individual people in each party

## Step 2: Import Your Invite Data

### Option A: Use the Sample Import Script

If you want to use the sample data from `INVITE_LIST.ts`, run:

```sql
-- Run this in your Supabase SQL Editor
-- File: import_invites_data.sql
```

### Option B: Import Your Own Data

To import your actual invite list, you can:

1. **Manual Insert via SQL:**
   ```sql
   -- Insert a party
   INSERT INTO parties (last_name) VALUES ('YourLastName') RETURNING id;
   
   -- Then insert members (use the party_id from above)
   INSERT INTO party_members (party_id, first_name, last_name) VALUES
     ('<party-id-from-above>', 'FirstName1', 'LastName1'),
     ('<party-id-from-above>', 'FirstName2', 'LastName2');
   ```

2. **Bulk Import via CSV:**
   - Export your invite list to CSV format
   - Use Supabase's table editor to import the CSV
   - Or use the SQL editor with a bulk INSERT statement

3. **Use the Supabase Dashboard:**
   - Go to Table Editor in Supabase
   - Manually add parties and members through the UI

## Step 3: Verify the Migration

The API has been updated to query from the database. Test it by:

1. Making a POST request to `/api/invites` with a last name
2. Check that it returns the correct party/parties from the database

## Data Structure

### Parties Table
- `id` (UUID) - Primary key
- `last_name` (TEXT) - Primary last name for lookup
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Party Members Table
- `id` (UUID) - Primary key
- `party_id` (UUID) - Foreign key to parties table
- `first_name` (TEXT)
- `last_name` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Notes

- The API now queries the database instead of using hardcoded data
- Multiple parties can share the same last name (handled by the selection UI)
- The system automatically handles case-insensitive searches
- All party lookups now go through the database

