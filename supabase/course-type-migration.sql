-- Course type, regular-course packages, and updated weekend peak windows.
-- Run in Supabase SQL Editor after the main migration.

alter table public.bookings
  add column if not exists course_type text not null default 'group'
    check (course_type in ('group', 'private'));

alter table public.bookings
  add column if not exists regular_course_count integer
    check (regular_course_count is null or regular_course_count >= 1);

-- Weekend off-peak: 9h–11h Saturday & Sunday (heures creuses).
-- Peak on weekends: 08:00–09:00 and 11:00–22:00.
update public.settings
set peak_windows = '[
  {"days": [1, 2, 3, 4, 5], "start": "17:00", "end": "22:00"},
  {"days": [0, 6], "start": "08:00", "end": "09:00"},
  {"days": [0, 6], "start": "11:00", "end": "22:00"}
]'::jsonb,
updated_at = now()
where id = 1;
