-- FitOS Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile
create table users_profile (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  height_cm numeric,
  created_at timestamptz default now() not null,
  unique(user_id)
);

-- Body metrics
create table body_metrics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  weight_kg numeric,
  body_fat_pct numeric,
  muscle_mass_kg numeric,
  notes text,
  created_at timestamptz default now() not null
);

-- Foods library
create table foods (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  calories_per_100g numeric not null default 0,
  protein_per_100g numeric not null default 0,
  carbs_per_100g numeric not null default 0,
  fat_per_100g numeric not null default 0,
  serving_size_g numeric not null default 100,
  created_at timestamptz default now() not null
);

-- Meal type enum
create type meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack');

-- Meal logs
create table meal_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  meal_type meal_type not null,
  food_id uuid references foods(id) on delete cascade not null,
  quantity_g numeric not null,
  created_at timestamptz default now() not null
);

-- Exercises library
create table exercises (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  muscle_group text,
  created_at timestamptz default now() not null
);

-- Workout sessions
create table workout_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  name text not null,
  notes text,
  created_at timestamptz default now() not null
);

-- Workout sets
create table workout_sets (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references workout_sessions(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade not null,
  set_number integer not null,
  reps integer not null,
  weight_kg numeric not null default 0,
  is_pb boolean default false,
  created_at timestamptz default now() not null
);

-- Meal templates (saved meals like "Smoothie" containing multiple foods)
create table meal_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null
);

-- Meal template items (foods within a meal template)
create table meal_template_items (
  id uuid default uuid_generate_v4() primary key,
  template_id uuid references meal_templates(id) on delete cascade not null,
  food_id uuid references foods(id) on delete cascade not null,
  quantity_g numeric not null default 100
);

-- Workout templates (saved routines like "Upper Body" containing multiple exercises)
create table workout_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null
);

-- Workout template items (exercises within a workout template)
create table workout_template_items (
  id uuid default uuid_generate_v4() primary key,
  template_id uuid references workout_templates(id) on delete cascade not null,
  exercise_id uuid references exercises(id) on delete cascade not null,
  sort_order integer not null default 0,
  default_sets integer not null default 3,
  default_reps integer not null default 10
);

-- Nutrition goals
create table nutrition_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  calories numeric not null default 2000,
  protein_g numeric not null default 150,
  carbs_g numeric not null default 250,
  fat_g numeric not null default 65,
  unique(user_id)
);

-- ============================================
-- Row Level Security Policies
-- ============================================

alter table users_profile enable row level security;
alter table body_metrics enable row level security;
alter table foods enable row level security;
alter table meal_logs enable row level security;
alter table exercises enable row level security;
alter table workout_sessions enable row level security;
alter table workout_sets enable row level security;
alter table nutrition_goals enable row level security;

-- users_profile policies
create policy "Users can view own profile" on users_profile for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on users_profile for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on users_profile for update using (auth.uid() = user_id);

-- body_metrics policies
create policy "Users can view own metrics" on body_metrics for select using (auth.uid() = user_id);
create policy "Users can insert own metrics" on body_metrics for insert with check (auth.uid() = user_id);
create policy "Users can update own metrics" on body_metrics for update using (auth.uid() = user_id);
create policy "Users can delete own metrics" on body_metrics for delete using (auth.uid() = user_id);

-- foods policies
create policy "Users can view own foods" on foods for select using (auth.uid() = user_id);
create policy "Users can insert own foods" on foods for insert with check (auth.uid() = user_id);
create policy "Users can update own foods" on foods for update using (auth.uid() = user_id);
create policy "Users can delete own foods" on foods for delete using (auth.uid() = user_id);

-- meal_logs policies
create policy "Users can view own meal logs" on meal_logs for select using (auth.uid() = user_id);
create policy "Users can insert own meal logs" on meal_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own meal logs" on meal_logs for update using (auth.uid() = user_id);
create policy "Users can delete own meal logs" on meal_logs for delete using (auth.uid() = user_id);

-- exercises policies
create policy "Users can view own exercises" on exercises for select using (auth.uid() = user_id);
create policy "Users can insert own exercises" on exercises for insert with check (auth.uid() = user_id);
create policy "Users can update own exercises" on exercises for update using (auth.uid() = user_id);
create policy "Users can delete own exercises" on exercises for delete using (auth.uid() = user_id);

-- workout_sessions policies
create policy "Users can view own sessions" on workout_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on workout_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on workout_sessions for update using (auth.uid() = user_id);
create policy "Users can delete own sessions" on workout_sessions for delete using (auth.uid() = user_id);

-- workout_sets policies (via session ownership)
create policy "Users can view own sets" on workout_sets for select
  using (exists (select 1 from workout_sessions where workout_sessions.id = workout_sets.session_id and workout_sessions.user_id = auth.uid()));
create policy "Users can insert own sets" on workout_sets for insert
  with check (exists (select 1 from workout_sessions where workout_sessions.id = workout_sets.session_id and workout_sessions.user_id = auth.uid()));
create policy "Users can update own sets" on workout_sets for update
  using (exists (select 1 from workout_sessions where workout_sessions.id = workout_sets.session_id and workout_sessions.user_id = auth.uid()));
create policy "Users can delete own sets" on workout_sets for delete
  using (exists (select 1 from workout_sessions where workout_sessions.id = workout_sets.session_id and workout_sessions.user_id = auth.uid()));

-- meal_templates policies
alter table meal_templates enable row level security;
alter table meal_template_items enable row level security;

create policy "Users can view own meal templates" on meal_templates for select using (auth.uid() = user_id);
create policy "Users can insert own meal templates" on meal_templates for insert with check (auth.uid() = user_id);
create policy "Users can update own meal templates" on meal_templates for update using (auth.uid() = user_id);
create policy "Users can delete own meal templates" on meal_templates for delete using (auth.uid() = user_id);

create policy "Users can view own meal template items" on meal_template_items for select
  using (exists (select 1 from meal_templates where meal_templates.id = meal_template_items.template_id and meal_templates.user_id = auth.uid()));
create policy "Users can insert own meal template items" on meal_template_items for insert
  with check (exists (select 1 from meal_templates where meal_templates.id = meal_template_items.template_id and meal_templates.user_id = auth.uid()));
create policy "Users can update own meal template items" on meal_template_items for update
  using (exists (select 1 from meal_templates where meal_templates.id = meal_template_items.template_id and meal_templates.user_id = auth.uid()));
create policy "Users can delete own meal template items" on meal_template_items for delete
  using (exists (select 1 from meal_templates where meal_templates.id = meal_template_items.template_id and meal_templates.user_id = auth.uid()));

-- workout_templates policies
alter table workout_templates enable row level security;
alter table workout_template_items enable row level security;

create policy "Users can view own workout templates" on workout_templates for select using (auth.uid() = user_id);
create policy "Users can insert own workout templates" on workout_templates for insert with check (auth.uid() = user_id);
create policy "Users can update own workout templates" on workout_templates for update using (auth.uid() = user_id);
create policy "Users can delete own workout templates" on workout_templates for delete using (auth.uid() = user_id);

create policy "Users can view own workout template items" on workout_template_items for select
  using (exists (select 1 from workout_templates where workout_templates.id = workout_template_items.template_id and workout_templates.user_id = auth.uid()));
create policy "Users can insert own workout template items" on workout_template_items for insert
  with check (exists (select 1 from workout_templates where workout_templates.id = workout_template_items.template_id and workout_templates.user_id = auth.uid()));
create policy "Users can update own workout template items" on workout_template_items for update
  using (exists (select 1 from workout_templates where workout_templates.id = workout_template_items.template_id and workout_templates.user_id = auth.uid()));
create policy "Users can delete own workout template items" on workout_template_items for delete
  using (exists (select 1 from workout_templates where workout_templates.id = workout_template_items.template_id and workout_templates.user_id = auth.uid()));

-- nutrition_goals policies
create policy "Users can view own goals" on nutrition_goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on nutrition_goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on nutrition_goals for update using (auth.uid() = user_id);
