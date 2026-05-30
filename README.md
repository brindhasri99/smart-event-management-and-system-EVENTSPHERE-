# EventSphere AI

> Smart event registration with QR attendance scanning, auto-waitlist promotion, and capacity forecasting.

## Features
- Browse and register for events
- Auto waitlist with seat-release promotion
- QR code tickets per registration
- Admin QR camera scanner for check-in
- Capacity forecast (rate + sellout prediction)
- CSV export, analytics dashboard, full admin panel

## Tech Stack
Next.js 15 · TypeScript · Supabase · Prisma · Tailwind · shadcn/ui

## Quick Start
1. `git clone [repo]`
2. `npm install`
3. `cp .env.example .env.local`
4. Fill env variables using the guide below
5. `npx prisma db push`
6. `npx prisma db seed`
7. `npm run dev`

## Environment Variables
| Variable | Where to find |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `DATABASE_URL` | Supabase → Settings → Database → URI |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

## Test Accounts
Admin: `admin@eventsphere.com` / `admin123`

User: `user1@test.com` / `password123`

## Deploy to Vercel
1. Push to GitHub
2. Import on vercel.com
3. Add env variables
4. Deploy
