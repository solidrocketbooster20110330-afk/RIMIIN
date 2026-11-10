# RIMIIN

RIMIIN is a mobile-first, unofficial Project SEKAI fan-made crystal planner. It helps one user track crystal balances, log gains and spending, set future gacha goals, and estimate target completion dates.

## Stack
- Next.js App Router + TypeScript
- Supabase Auth + PostgreSQL (cloud persistence)
- Recharts for analytics
- Custom pastel rhythm-game-inspired UI

## Local setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`
3. Add your Supabase project URL and anon/publishable key.
4. Run `npm run dev`

## Supabase setup
Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor. Enable email authentication in Supabase Auth.

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Never expose a Supabase service-role key in browser code.

## Project status
Initial foundation: dashboard shell, Supabase client helpers, auth route, database schema, and responsive visual system. Connect a Supabase project and set environment variables to enable cloud persistence.

Unofficial fan-made project; not affiliated with SEGA, Colorful Palette, or Crypton Future Media.