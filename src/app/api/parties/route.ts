import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Fetch all parties with their members
    const { data: parties, error: partiesError } = await supabase
      .from('parties')
      .select(`
        id,
        last_name,
        created_at,
        party_members (
          id,
          first_name,
          last_name
        )
      `)
      .order('last_name', { ascending: true });

    if (partiesError) {
      console.error('Error fetching parties:', partiesError);
      return Response.json({ data: null, error: partiesError.message }, { status: 500 });
    }

    return Response.json({ data: parties || [], error: null });
  } catch (error: any) {
    console.error('Error in GET /api/parties:', error);
    return Response.json({ data: null, error: error.message }, { status: 500 });
  }
}

