-- Run once in Supabase SQL Editor.
-- Stores registry gift intents (Venmo clicks + Stripe checkout starts) for the admin dashboard.

create table if not exists public.registry_intents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  fund text not null,
  amount_usd numeric(12, 2) not null,
  charged_amount_usd numeric(12, 2),
  cover_stripe_fees boolean not null default false,
  note text,
  payment_channel text not null check (payment_channel in ('venmo', 'stripe')),
  venmo_recipient text,
  stripe_checkout_session_id text,
  status text not null default 'pending'
);

create index if not exists registry_intents_created_at_idx on public.registry_intents (created_at desc);

alter table public.registry_intents enable row level security;

-- Public inserts from API routes (anon key). Omitting TO applies the policy to all roles.
-- If you still see RLS errors, set SUPABASE_SERVICE_ROLE_KEY on the server (inserts only).
drop policy if exists "Allow anon insert registry_intents" on public.registry_intents;
drop policy if exists "Allow insert registry_intents" on public.registry_intents;
create policy "Allow insert registry_intents"
  on public.registry_intents
  for insert
  with check (true);

grant insert on table public.registry_intents to anon;
grant insert on table public.registry_intents to authenticated;

-- Inserts from the app use this RPC (runs as owner; bypasses RLS). Direct INSERT is optional.
create or replace function public.insert_registry_intent(
  p_fund text,
  p_amount_usd numeric,
  p_charged_amount_usd numeric,
  p_cover_stripe_fees boolean,
  p_note text,
  p_payment_channel text,
  p_venmo_recipient text,
  p_stripe_checkout_session_id text,
  p_status text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_fund is null or p_fund not in ('honeymoon', 'dogs', 'donation', 'castle') then
    raise exception 'invalid fund';
  end if;
  if p_payment_channel is null or p_payment_channel not in ('venmo', 'stripe') then
    raise exception 'invalid payment_channel';
  end if;
  if p_amount_usd is null or p_amount_usd < 0.5 then
    raise exception 'amount too low';
  end if;

  insert into public.registry_intents (
    fund,
    amount_usd,
    charged_amount_usd,
    cover_stripe_fees,
    note,
    payment_channel,
    venmo_recipient,
    stripe_checkout_session_id,
    status
  )
  values (
    p_fund,
    p_amount_usd,
    p_charged_amount_usd,
    p_cover_stripe_fees,
    p_note,
    p_payment_channel,
    p_venmo_recipient,
    p_stripe_checkout_session_id,
    p_status
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.insert_registry_intent(
  text, numeric, numeric, boolean, text, text, text, text, text
) from PUBLIC;
grant execute on function public.insert_registry_intent(
  text, numeric, numeric, boolean, text, text, text, text, text
) to anon;
grant execute on function public.insert_registry_intent(
  text, numeric, numeric, boolean, text, text, text, text, text
) to authenticated;

-- Logged-in admins read via client JWT (Bearer) or Supabase client session.
create policy "Allow authenticated read registry_intents"
  on public.registry_intents
  for select
  to authenticated
  using (true);
