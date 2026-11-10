# RIMIIN

RIMIIN is a mobile-first, unofficial Project SEKAI fan-made crystal planner. It helps one person track crystal balances, log gains and spending, set future gacha goals, and review crystal trends.

## Stack
- Next.js App Router + TypeScript
- Supabase Auth + PostgreSQL for cloud persistence
- Recharts for balance analytics
- Responsive pastel SEKAI-inspired UI

## Current implementation
- Dashboard with crystal balance, goal progress, estimated days-to-goal, and recent activity
- Email/password sign-up and login using Supabase Auth
- Crystal balance snapshots and gain/spend transaction entry
- Multiple future gacha goals with target amount and deadline
- Analytics for 7-day and 30-day net change plus balance history chart
- JSON backup export
- Supabase schema with row-level security

The dashboard shows sample preview values until a Supabase project is configured and a user signs in. New authenticated accounts start with an empty cloud state rather than fabricated saved data.

## Local setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local`
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor.
5. Enable email authentication in Supabase Auth.
6. Run `npm run dev`.

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Never expose a Supabase service-role key in browser code.

## Notes
- Cloud persistence is active only after Supabase credentials and schema are configured.
- JSON export is implemented; restore/import and scheduled backups are future work.
- This is an unofficial fan-made project, not affiliated with SEGA, Colorful Palette, or Crypton Future Media.