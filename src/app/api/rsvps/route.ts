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
  const { name, email, is_attending } = await request.json();
  const { data, error } = await supabase
    .from('rsvps')
    .insert([{ name, email, is_attending }]);

  console.log('POST data', data);
  console.log('POST error', error);

  return Response.json({ data, error });
}