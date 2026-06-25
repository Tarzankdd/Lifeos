# LifeOS

LifeOS is a dark-mode-first personal productivity and financial management platform built with Next.js, TypeScript, TailwindCSS, Prisma, PostgreSQL, NextAuth, and Recharts.

## Modules

- Dashboard with today overview, stats, savings, habits, and analytics
- Diary and journal entries with mood, tags, and search
- Finance tracker for expenses, income, investments, transfers, reports, and CSV export
- Savings goals with progress and monthly requirement calculations
- Task manager with list controls and drag-and-drop Kanban board
- Project management with linked tasks, milestones, and progress
- Habit tracker with daily completion and consistency grid
- Daily, weekly, monthly, quarterly, and yearly planner structure
- Calendar view for tasks, events, goals, and reminders
- Notes and knowledge base with folders, tags, and pinned notes
- Notifications and settings

## Tech Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- Prisma ORM
- PostgreSQL
- NextAuth credentials auth
- Recharts
- dnd-kit
- Zod

## Getting Started

```bash
npm install
cp .env.example .env
npm run db:generate
npm run dev
```

Open `http://localhost:3000`.

The UI runs immediately with local demo data stored in `localStorage`. Connect PostgreSQL to enable the API/auth/database path.

## Database Setup

Set `DATABASE_URL` in `.env`, then run:

```bash
npm run db:migrate
npm run db:seed
```

Demo credentials after seeding:

```txt
Email: demo@lifeos.local
Password: lifeos-demo
```

## Project Structure

```txt
src/app
  api/auth/[...nextauth]
  api/register
  api/[resource]
  login
  register
  page.tsx
src/components
  app
  ui
src/lib
  auth.ts
  lifeos-data.ts
  prisma.ts
  validations
prisma
  schema.prisma
  migrations
  seed.ts
```

## Production Notes

- The Prisma schema is PostgreSQL-first and includes the full LifeOS domain model.
- API routes are protected by NextAuth sessions.
- The root app currently uses local demo persistence for instant usability.
- The next production step is wiring each UI form to the protected API resources after a database is available.
