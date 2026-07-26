-- Run once in Supabase SQL Editor if availability fails without service role key.
-- Exposes only start/duration for pending+confirmed bookings (no client PII).

create or replace function public.get_busy_slots(p_studio_id int, p_date date)
returns table (start_minutes int, duration_minutes int)
language sql
stable
security definer
set search_path = public
as $$
  select b.start_minutes, b.duration_minutes
  from public.bookings b
  where b.studio_id = p_studio_id
    and b.date = p_date
    and b.status in ('pending', 'confirmed');
$$;

revoke all on function public.get_busy_slots(int, date) from public;
grant execute on function public.get_busy_slots(int, date) to anon, authenticated, service_role;
