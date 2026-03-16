# FitOS

A unified fitness tracking platform for logging nutrition, workouts, and body metrics. Built with React + Supabase.

## Tech Stack

- React 19 (Vite)
- React Router
- Tailwind CSS v4
- Supabase (Postgres + Auth)
- Recharts
- date-fns
- Lucide React icons

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `schema.sql` to create all tables and RLS policies
3. Enable Email auth in Authentication > Providers

### 3. Environment variables

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in your Supabase dashboard under Settings > API.

### 4. Run

```bash
npm run dev
```

## Features

- **Dashboard** — daily overview with macro rings, meal summary, workout summary, weight sparkline
- **Nutrition** — log meals by type, search food library, auto-calculate macros, pie chart breakdown
- **Food Library** — CRUD for custom foods with per-100g nutritional data
- **Workouts** — create sessions, log sets with exercise/reps/weight, auto PB detection, exercise history charts
- **Exercise Library** — CRUD for exercises with muscle group categorization
- **Body Metrics** — log weight/body fat/muscle mass, trend charts, change tracking
- **Settings** — daily nutrition goals, height profile

## Project Structure

```
src/
├── lib/           # Supabase client, auth context, utilities
├── hooks/         # Custom hooks for data (useNutrition, useWorkouts, etc.)
├── components/    # Reusable UI (MacroRing, Modal, DateSelector, etc.)
└── pages/         # Route pages (Dashboard, Nutrition, Workouts, etc.)
```
