-- Studio image gallery + Supabase Storage bucket for uploads.
-- Run in Supabase SQL Editor.

alter table public.studios
  add column if not exists gallery_urls text[] not null default '{}';

-- Backfill existing cover images into the gallery
update public.studios
set gallery_urls = array[image_url]
where image_url is not null
  and (gallery_urls is null or gallery_urls = '{}');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'studio-images',
  'studio-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read studio images" on storage.objects;
create policy "Public read studio images"
  on storage.objects for select
  using (bucket_id = 'studio-images');

drop policy if exists "Admins upload studio images" on storage.objects;
create policy "Admins upload studio images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'studio-images');

drop policy if exists "Admins update studio images" on storage.objects;
create policy "Admins update studio images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'studio-images');

drop policy if exists "Admins delete studio images" on storage.objects;
create policy "Admins delete studio images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'studio-images');
