import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  console.log('GET /api/rsvps');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false });
  
  console.log('GET data:', data);
  console.log('GET error:', error);
  console.log('Data length:', data?.length);
  
  if (error) {
    console.error('Supabase error:', error);
    return Response.json({ data: null, error: error.message }, { status: 500 });
  }
    
  return Response.json({ data: data || [], error: null });
}

export async function POST(request: Request) {
  console.log('POST /api/rsvps');
  const { partyId, lastName, email, accommodation, memberRsvps, memberNames } = await request.json();

  if (!partyId || !lastName || !email || !memberRsvps || !Array.isArray(memberRsvps)) {
    return Response.json(
      { error: 'Missing required fields: partyId, lastName, email, and memberRsvps' },
      { status: 400 }
    );
  }

  // Check if RSVPs already exist for this party
  const { data: existingRsvps, error: fetchError } = await supabase
    .from('rsvps')
    .select('*')
    .eq('party_id', partyId);

  if (fetchError) {
    console.error('Error fetching existing RSVPs:', fetchError);
    return Response.json({ error: fetchError.message }, { status: 500 });
  }

  const isUpdate = existingRsvps && existingRsvps.length > 0;
  const results: any[] = [];
  const historyRecords: any[] = [];

  // Process each member RSVP
  for (let i = 0; i < memberRsvps.length; i++) {
    const memberRsvp = memberRsvps[i];
    const memberName = memberNames?.[memberRsvp.memberId] || 'Unknown';
    const entreeChoice = memberRsvp.entreeChoice ?? null;
    const dessertChoice = memberRsvp.dessertChoice ?? null;
    const newRsvpData: Record<string, unknown> = {
      party_id: partyId,
      last_name: lastName,
      member_id: memberRsvp.memberId,
      member_name: memberName,
      email: email,
      is_attending: memberRsvp.isAttending,
      dietary_restrictions: memberRsvp.dietaryRestrictions || null,
      entree_choice: entreeChoice,
      dessert_choice: dessertChoice,
    };
    if (i === 0 && accommodation != null) newRsvpData.accommodation = accommodation;

    // Find existing RSVP for this member
    const existingRsvp = existingRsvps?.find(
      (r) => r.member_id === memberRsvp.memberId
    );

    if (existingRsvp) {
      // Update existing RSVP
      const existingRow = existingRsvp as { entree_choice?: string; dessert_choice?: string; accommodation?: string };
      const prevEntree = existingRow.entree_choice ?? null;
      const prevDessert = existingRow.dessert_choice ?? null;
      const prevAccommodation = existingRow.accommodation ?? null;
      const previousValues: Record<string, unknown> = {
        is_attending: existingRsvp.is_attending,
        dietary_restrictions: existingRsvp.dietary_restrictions,
        email: existingRsvp.email,
        entree_choice: prevEntree,
        dessert_choice: prevDessert,
        accommodation: i === 0 ? prevAccommodation : undefined,
      };
      if (i > 0) delete previousValues.accommodation;

      const hasChanges =
        existingRsvp.is_attending !== memberRsvp.isAttending ||
        existingRsvp.dietary_restrictions !== (memberRsvp.dietaryRestrictions || null) ||
        existingRsvp.email !== email ||
        prevEntree !== entreeChoice ||
        prevDessert !== dessertChoice ||
        (i === 0 && prevAccommodation !== (accommodation ?? null));

      if (hasChanges) {
        const { data: updatedData, error: updateError } = await supabase
          .from('rsvps')
          .update({ ...newRsvpData, updated_at: new Date().toISOString() })
          .eq('id', existingRsvp.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating RSVP:', updateError);
          return Response.json({ error: updateError.message }, { status: 500 });
        }

        results.push(updatedData);

        // Log to history
        historyRecords.push({
          rsvp_id: existingRsvp.id,
          party_id: partyId,
          last_name: lastName,
          member_id: memberRsvp.memberId,
          member_name: memberName,
          email: email,
          is_attending: memberRsvp.isAttending,
          dietary_restrictions: memberRsvp.dietaryRestrictions || null,
          entree_choice: entreeChoice,
          dessert_choice: dessertChoice,
          action: 'updated',
          previous_values: previousValues,
        });
      } else {
        // No changes, just return existing data
        results.push(existingRsvp);
      }
    } else {
      // Insert new RSVP
      const { data: insertedData, error: insertError } = await supabase
        .from('rsvps')
        .insert([newRsvpData])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting RSVP:', insertError);
        return Response.json({ error: insertError.message }, { status: 500 });
      }

      results.push(insertedData);

      // Log to history
      historyRecords.push({
        rsvp_id: insertedData.id,
        party_id: partyId,
        last_name: lastName,
        member_id: memberRsvp.memberId,
        member_name: memberName,
        email: email,
        is_attending: memberRsvp.isAttending,
        dietary_restrictions: memberRsvp.dietaryRestrictions || null,
        entree_choice: entreeChoice,
        dessert_choice: dessertChoice,
        action: 'created',
        previous_values: null,
      });
    }
  }

  // Insert history records if any
  if (historyRecords.length > 0) {
    const { error: historyError } = await supabase
      .from('rsvp_history')
      .insert(historyRecords);

    if (historyError) {
      console.error('Error inserting history:', historyError);
      // Don't fail the request if history logging fails, but log it
    }
  }

  console.log('POST result:', { isUpdate, count: results.length });
  return Response.json({ 
    data: results, 
    isUpdate,
    error: null 
  });
}