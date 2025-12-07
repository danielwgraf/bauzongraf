import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Expected invites data structure
// In a real app, this would be stored in a database
// For now, we'll use a simple in-memory structure
interface PartyMember {
  id: string;
  firstName: string;
  lastName: string;
}

interface InviteParty {
  id: string;
  lastName: string; // Primary last name for lookup
  members: PartyMember[];
}

// TODO: Replace this with your actual invite list
const EXPECTED_INVITES: InviteParty[] = [
  {
    id: '1',
    lastName: 'Smith',
    members: [
      { id: '1-1', firstName: 'John', lastName: 'Smith' },
      { id: '1-2', firstName: 'Jane', lastName: 'Smith' },
    ],
  },
  {
    id: '2',
    lastName: 'Johnson',
    members: [
      { id: '2-1', firstName: 'Bob', lastName: 'Johnson' },
    ],
  },
  // Add more parties here
  {
    id: '3',
    lastName: 'Doe',
    members: [
      { id: '3-1', firstName: 'John', lastName: 'Doe' },
      { id: '3-2', firstName: 'Jane', lastName: 'Doe' },
    ],
  },
];

export async function POST(request: Request) {
  const { lastName } = await request.json();

  if (!lastName) {
    return Response.json({ error: 'Last name is required' }, { status: 400 });
  }

  // Case-insensitive search for matching last name
  const normalizedSearch = lastName.trim().toLowerCase();
  const matchingParty = EXPECTED_INVITES.find(
    (party) => party.lastName.toLowerCase() === normalizedSearch ||
    party.members.some(member => member.lastName.toLowerCase() === normalizedSearch)
  );

  if (!matchingParty) {
    return Response.json({ error: 'No matching invite found' }, { status: 404 });
  }

  return Response.json({ party: matchingParty });
}

