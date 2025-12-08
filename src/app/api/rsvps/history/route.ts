import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rsvpId = searchParams.get('rsvp_id');
  const partyId = searchParams.get('party_id');
  const email = searchParams.get('email');

  let query = supabase
    .from('rsvp_history')
    .select('*')
    .order('changed_at', { ascending: false });

  if (rsvpId) {
    query = query.eq('rsvp_id', rsvpId);
  }
  if (partyId) {
    query = query.eq('party_id', partyId);
  }
  if (email) {
    query = query.eq('email', email);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching history:', error);
    return Response.json({ data: null, error: error.message }, { status: 500 });
  }

  return Response.json({ data: data || [], error: null });
}

