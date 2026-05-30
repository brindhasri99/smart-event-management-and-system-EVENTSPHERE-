# EventSphere — Smart Event Registration Portal

A modern, full-stack event management web application built with Next.js, Supabase, and Prisma. The platform supports two user roles — **Participants** who browse and register for events, and **Organizers** who create and manage events.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Authentication | Supabase Auth |
| Database | PostgreSQL (via Supabase) |
| ORM | Prisma |
| UI Components | Lucide React icons |
| QR Codes | react-qr-code |
| Notifications | react-hot-toast |
| Dark Mode | next-themes |

---

## Features

### Participant
- Browse and search upcoming events
- Register for events and join waitlists
- View QR code tickets
- Personal dashboard with registration history
- Dark mode support

### Organizer
- Separate organizer dashboard
- Create, edit, and manage events
- Live preview when creating an event
- View all registrations across events
- Export registrations as CSV
- Analytics charts

### General
- Role-based authentication (Participant / Organizer)
- Responsive design — works on mobile and desktop
- QR code scanner for attendance tracking
- Category filtering

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── register/       # Register page
│   ├── (public)/
│   │   ├── page.tsx        # Home / landing page
│   │   └── events/         # Events list and detail pages
│   ├── dashboard/          # Participant dashboard
│   ├── organizer/          # Organizer dashboard and pages
│   └── admin/              # Admin utilities (scanner, etc.)
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── EventCard.tsx
│   ├── EventForm.tsx
│   ├── Navbar.tsx
│   ├── DashboardTabs.tsx
│   ├── ExportCsvButton.tsx
│   ├── QRTicket.tsx
│   ├── QRScanner.tsx
│   └── AnalyticsCharts.tsx
├── lib/
│   ├── auth.ts             # getCurrentUser, getOrganizerUser
│   ├── prisma.ts
│   ├── supabase.ts
│   └── utils.ts
├── actions/
│   ├── auth.ts
│   ├── events.ts
│   └── registration.ts
└── middleware.ts            # Route protection
```

---

## Getting Started

### 1. Prerequisites

- Node.js v18 or higher
- A Supabase project ([supabase.com](https://supabase.com))

### 2. Clone / Extract the project

```bash
cd "smart event"
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up environment variables

Create a `.env.local` file in the root of the project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find these values in your Supabase project under **Settings → API**.

### 5. Push the database schema

```bash
npx prisma db push
```

### 6. Seed demo data

```bash
npx prisma db seed
```

This creates demo accounts and 10 sample events.

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Participant | participant@test.com | Password123! |
| Organizer | organizer@test.com | Password123! |

---

## Database Models

| Model | Description |
|---|---|
| User | Participants and Organizers |
| Event | Events created by Organizers |
| Category | Event categories (Technology, Business, etc.) |
| Registration | Participant registrations for events |
| Waitlist | Waitlist entries when events are full |
| Attendance | QR scan check-in records |
| Ticket | Generated tickets per registration |

---

## Key Pages

| Route | Description |
|---|---|
| `/` | Landing page with featured events |
| `/events` | Browse all events |
| `/events/[id]` | Event detail and registration |
| `/login` | Login (Participant or Organizer) |
| `/register` | Register new account |
| `/dashboard` | Participant dashboard |
| `/organizer` | Organizer dashboard |
| `/organizer/events/new` | Create a new event |
| `/organizer/events` | Manage all events |
| `/organizer/registrations` | View and export registrations |
| `/organizer/analytics` | Charts and statistics |

---

## CSV Export

Organizers can export all registrations as a `.csv` file from the **Registrations** page. The file includes:

- Participant Name
- Email
- Event Name
- Registered On
- Ticket Code
- Status

---

## Environment Notes

- The app uses **Supabase Auth** for login — passwords are managed by Supabase, not stored in Prisma
- The **Prisma User table** stores profile data and role (`PARTICIPANT` / `ORGANIZER`)
- Supabase `user_metadata.role` controls dashboard routing (`participant` → `/dashboard`, `organizer` → `/organizer`)
- Both must match for the app to work correctly

---

## Build for Production

```bash
npm run build
npm start
```

---

## Problem Statement

Managing event registrations manually through spreadsheets or messaging platforms leads to data duplication, registration errors, and poor participant tracking. EventSphere solves this by automating the entire registration workflow with secure authentication, real-time data, QR tickets, and CSV exports.
