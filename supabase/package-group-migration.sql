-- Run in Supabase SQL Editor.
-- Links multi-session package bookings for admin grouping.

alter table public.bookings
  add column if not exists package_group_id uuid;

alter table public.bookings
  add column if not exists package_index integer
    check (package_index is null or package_index >= 1);

create index if not exists bookings_package_group_id_idx
  on public.bookings (package_group_id)
  where package_group_id is not null;

comment on column public.bookings.package_group_id is
  'Shared UUID for all sessions in a multi-booking package.';
comment on column public.bookings.package_index is
  '1-based index of the session within its package.';
