create table if not exists user_profiles (
  id uuid primary key,
  email text unique,
  full_name text,
  timezone text not null default 'America/Toronto',
  mission text,
  planning_style text default 'balanced',
  reminder_window integer default 15,
  created_at timestamptz not null default now()
);

create table if not exists life_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  label text not null,
  color text,
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category_id uuid,
  title text not null,
  priority text not null default 'medium',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category_id uuid,
  title text not null,
  habit_type text not null,
  cadence text not null,
  streak integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists work_schedule_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  weekday integer not null,
  start_time text not null,
  end_time text not null,
  reminder_offset_minutes integer default 15,
  created_at timestamptz not null default now()
);

create table if not exists check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  reflection text not null,
  created_at timestamptz not null default now()
);

create table if not exists plan_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  day date not null,
  status text not null default 'draft',
  focus_summary text,
  created_at timestamptz not null default now()
);

create table if not exists plan_blocks (
  id uuid primary key default gen_random_uuid(),
  plan_day_id uuid not null,
  category_id uuid,
  title text not null,
  start_time text not null,
  end_time text not null,
  status text not null default 'suggested',
  source text not null default 'ai',
  notes text,
  reminder_offset_minutes integer default 15,
  created_at timestamptz not null default now()
);

create table if not exists memory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null,
  title text not null,
  summary text not null,
  tags text[] default '{}',
  relevance numeric default 0.5,
  created_at timestamptz not null default now()
);

create table if not exists progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  day date not null,
  completed_blocks integer default 0,
  skipped_blocks integer default 0,
  active_habits integer default 0,
  strongest_streak integer default 0,
  created_at timestamptz not null default now()
);
