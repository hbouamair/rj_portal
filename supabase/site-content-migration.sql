-- Site page content (contact, about) — run in Supabase SQL Editor

create table if not exists public.site_pages (
  slug text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_pages enable row level security;

drop policy if exists "Public read site pages" on public.site_pages;
create policy "Public read site pages"
  on public.site_pages for select
  using (true);
