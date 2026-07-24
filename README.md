# High-End Dance Studio Website

A sophisticated, immersive dance studio website built with Next.js 15 and featuring cutting-edge 2026 design trends.

## Features

- 🎨 **2026 'Snug Simple' & Light Skeuomorphism Design**
  - Warm color palette with cream, soft charcoal, and terracotta accents
  - Organic shapes and rounded corners
  - Subtle shadows and tactile gradients

- 🎬 **Cinematic Motion & Animations**
  - Full-screen video hero with scroll storytelling
  - Framer Motion fluid transitions
  - Multi-layered parallax scrolling
  - Custom cursor with morphing effects
  - Dough-like button interactions

- 📅 **Professional Booking System**
  - Interactive bento-grid schedule
  - Real-time availability updates
  - Glassmorphic booking modal
  - Server Actions for form submission

- 📱 **Technical Excellence**
  - 100% mobile responsive
  - Thumb-friendly navigation
  - Lazy loading optimization
  - Next.js 15 App Router

## Getting Started

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Booking System Setup (Supabase + Resend)

The `/reservation` booking flow and the `/admin` dashboard need a Supabase
project and a Resend account.

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is fine).
2. **Run the migration**: open *SQL Editor* in the Supabase dashboard, paste the
   contents of [`supabase/migration.sql`](supabase/migration.sql) and run it.
   This creates the `studios`, `bookings` and `settings` tables, RLS policies
   and seeds the three studios with their current prices.
3. **Create the admin user**: in Supabase go to *Authentication → Users →
   Add user*, and create the account (email + password) you will use to log in
   at `/admin/login`.
4. **Configure environment variables**: copy `.env.example` to `.env.local`
   and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` +
     `SUPABASE_SECRET_KEY` (Supabase → *Project Settings → API Keys*;
     legacy anon/service_role key names also work)
   - `RESEND_API_KEY` (emails: confirmations, notifications)
   - `CRON_SECRET` (any long random string — protects `/api/cron/*`)
   - `NEXT_PUBLIC_SITE_URL` (used for links inside emails)
   On Vercel, add the same variables in *Project Settings → Environment Variables*.
5. **Vercel Cron** (daily on Hobby plan — `0 7 * * *` ≈ 08:00 Casablanca):
   - `/api/cron/daily` — expires unpaid bookings + sends session reminders
   - Individual routes `/api/cron/expire-bookings` and `/api/cron/send-reminders` remain available for manual testing
   - **Pro plan**: you can switch to hourly (`0 * * * *`) or split into separate crons in `vercel.json`
6. **Reminder migration** (if DB already exists): run `supabase/reminder-migration.sql` in Supabase SQL Editor.
7. **Admin dashboard**: log in at `/admin/login`. From there you can confirm /
   cancel bookings (the client is emailed automatically), create manual
   bookings, edit studio prices, opening hours, peak-hour windows
   ("heures pleines"), payment details (PayPal / RIB) and view income stats.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/             # Utilities and helpers
└── data/            # Mock data and types
```

## Design Philosophy

This project embraces the 2026 design trends of "Snug Simple" and "Light Skeuomorphism," creating a warm, tactile, and immersive experience that makes users feel connected to the physical space of the dance studio through digital means.

