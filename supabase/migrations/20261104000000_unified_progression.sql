-- Unified Progression Data Model (Supabase + Offline Mirror)

-- 1. Profiles (extending auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  alias text not null default 'Champion',
  overall_level integer not null default 1,
  xp integer not null default 0,
  streak integer not null default 0,
  streak_shields integer not null default 2,
  current_stage text not null default 'A0',
  league_tier text not null default 'Bronze',
  league_opt_out boolean not null default false,
  is_under_13 boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. Course Progress (Lesson crowns & completions)
create table if not exists public.course_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  crowns integer not null default 1,
  best_score integer not null default 0,
  completed_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

alter table public.course_progress enable row level security;

create policy "Users manage own course progress"
  on public.course_progress for all
  using (auth.uid() = user_id);

-- 3. Skill Levels (5 Skill Axes)
create table if not exists public.skill_levels (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  structure integer not null default 1,
  vocabulary integer not null default 1,
  listening integer not null default 1,
  speaking integer not null default 1,
  writing integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.skill_levels enable row level security;

create policy "Users manage own skill levels"
  on public.skill_levels for all
  using (auth.uid() = user_id);

-- 4. SRS Items (FSRS / SM-2 Spaced Repetition)
create table if not exists public.srs_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  term text not null,
  source_text text not null,
  target_text text not null,
  target_lang text not null default 'en',
  stability float not null default 1.0,
  difficulty float not null default 5.0,
  lapses integer not null default 0,
  reviews integer not null default 0,
  last_reviewed_at timestamptz not null default now(),
  due_at timestamptz not null default now(),
  unique(user_id, item_id)
);

alter table public.srs_items enable row level security;

create policy "Users manage own SRS items"
  on public.srs_items for all
  using (auth.uid() = user_id);

-- 5. Safe Restricted View for Anonymous Leagues (exposes only alias & weekly XP)
create or replace view public.safe_league_leaderboard as
  select
    p.alias,
    p.league_tier,
    p.xp as weekly_xp
  from public.profiles p
  where p.league_opt_out = false and p.is_under_13 = false
  order by p.xp desc
  limit 100;
