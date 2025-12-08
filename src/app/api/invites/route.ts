import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PartyMember {
  id: string;
  firstName: string;
  lastName: string;
}

interface InviteParty {
  id: string;
  lastName: string;
  members: PartyMember[];
}

export async function POST(request: Request) {
  const { lastName } = await request.json();

  if (!lastName) {
    return Response.json({ error: 'Last name is required' }, { status: 400 });
  }

  // Case-insensitive search for matching last name
  const normalizedSearch = lastName.trim().toLowerCase();

  // Find parties where the party's last_name matches (case-insensitive exact match)
  const { data: parties, error: partiesError } = await supabase
    .from('parties')
    .select('id, last_name')
    .ilike('last_name', normalizedSearch);

  if (partiesError) {
    console.error('Error fetching parties:', partiesError);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }

  // Also search party members for matching last names (case-insensitive exact match)
  const { data: members, error: membersError } = await supabase
    .from('party_members')
    .select('party_id')
    .ilike('last_name', normalizedSearch);

  if (membersError) {
    console.error('Error fetching members:', membersError);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }

  // Combine party IDs from both searches
  const partyIds = new Set<string>();
  parties?.forEach(p => partyIds.add(p.id));
  members?.forEach(m => partyIds.add(m.party_id));

  if (partyIds.size === 0) {
    return Response.json({ error: 'No matching invite found' }, { status: 404 });
  }

  // Fetch all matching parties with their members
  const { data: allParties, error: fetchError } = await supabase
    .from('parties')
    .select(`
      id,
      last_name,
      party_members (
        id,
        first_name,
        last_name
      )
    `)
    .in('id', Array.from(partyIds));

  if (fetchError) {
    console.error('Error fetching parties with members:', fetchError);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }

  // Transform database format to API format
  const matchingParties: InviteParty[] = (allParties || []).map(party => ({
    id: party.id,
    lastName: party.last_name,
    members: (party.party_members || []).map((member: any) => ({
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
    })),
  }));

  if (matchingParties.length === 0) {
    return Response.json({ error: 'No matching invite found' }, { status: 404 });
  }

  // If only one match, return it directly (for backward compatibility)
  if (matchingParties.length === 1) {
    return Response.json({ party: matchingParties[0] });
  }

  // Multiple matches - return all of them for user selection
  return Response.json({ parties: matchingParties, multiple: true });
}

