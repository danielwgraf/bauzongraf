import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  console.log('GET /api/rsvps');
  console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false });
  console.log('GET data', data);
  console.log('GET error', error);
    
  return Response.json({ data, error });
}

export async function POST(request: Request) {
  console.log('POST /api/rsvps');
  const { partyId, lastName, email, memberRsvps, memberNames } = await request.json();

  if (!partyId || !lastName || !email || !memberRsvps || !Array.isArray(memberRsvps)) {
    return Response.json(
      { error: 'Missing required fields: partyId, lastName, email, and memberRsvps' },
      { status: 400 }
    );
  }

  // Insert RSVP for each member
  const rsvpRecords = memberRsvps.map((memberRsvp: { memberId: string; isAttending: boolean; dietaryRestrictions: string }) => ({
    party_id: partyId,
    last_name: lastName,
    member_id: memberRsvp.memberId,
    member_name: memberNames?.[memberRsvp.memberId] || 'Unknown',
    email: email,
    is_attending: memberRsvp.isAttending,
    dietary_restrictions: memberRsvp.dietaryRestrictions || null,
  }));

  const { data, error } = await supabase
    .from('rsvps')
    .insert(rsvpRecords);

  console.log('POST data', data);
  console.log('POST error', error);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data, error: null });
}