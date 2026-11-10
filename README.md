# RIMIIN

RIMIIN is a mobile-first, unofficial Project SEKAI fan-made crystal planner. It helps track crystal balances, log gains and spending, set future gacha goals, and review crystal trends.

## Stack
- Next.js App Router + TypeScript
- Browser localStorage for personal data
- Recharts for balance analytics
- Responsive pastel SEKAI-inspired UI

## Features
- Dashboard with current crystal balance, goal progress, and estimated time to goal
- Crystal balance snapshots and gain/spend transaction history
- Multiple future gacha goals with target amount and deadline
- 7-day and 30-day net change analytics with balance chart
- JSON backup and restore
- No login or account required

## Local setup
1. Install dependencies: `npm install`
2. Run `npm run dev`

## Data storage
RIMIIN stores data in the current browser's localStorage. Data does not sync between devices or browsers. Export a JSON backup in Settings before clearing browser data or changing devices.

## Note
This is an unofficial fan-made project, not affiliated with SEGA, Colorful Palette, or Crypton Future Media.