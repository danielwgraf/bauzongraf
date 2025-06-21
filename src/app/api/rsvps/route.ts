import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: false });
    
  return Response.json({ data, error });
}

export async function POST(request: Request) {
  const { name, email, is_attending } = await request.json();
  const { data, error } = await supabase
    .from('rsvps')
    .insert([{ name, email, is_attending }]);

  return Response.json({ data, error });
}