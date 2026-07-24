-- ============================================================
-- RJ Studio — Reminder emails (relance avant réservation)
-- Run in Supabase SQL Editor if migration.sql was already applied.
-- ============================================================

alter table public.settings
  add column if not exists reminder_hours_before integer not null default 24;

alter table public.bookings
  add column if not exists client_reminder_sent_at timestamptz,
  add column if not exists admin_reminder_sent_at timestamptz;
