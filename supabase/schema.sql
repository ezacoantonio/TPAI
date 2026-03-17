create extension if not exists pgcrypto;

create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
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
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  color text,
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references life_categories(id) on delete set null,
  title text not null,
  priority text not null default 'medium',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references life_categories(id) on delete set null,
  title text not null,
  habit_type text not null,
  cadence text not null,
  streak integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists work_schedule_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weekday integer not null,
  start_time text not null,
  end_time text not null,
  reminder_offset_minutes integer default 15,
  created_at timestamptz not null default now()
);

create table if not exists check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reflection text not null,
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists plan_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  status text not null default 'draft',
  focus_summary text,
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

create table if not exists plan_blocks (
  id uuid primary key default gen_random_uuid(),
  plan_day_id uuid not null references plan_days(id) on delete cascade,
  category_id uuid references life_categories(id) on delete set null,
  category_label text,
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
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  summary text not null,
  tags text[] default '{}',
  relevance numeric default 0.5,
  created_at timestamptz not null default now()
);

create table if not exists progress_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  completed_blocks integer default 0,
  skipped_blocks integer default 0,
  active_habits integer default 0,
  strongest_streak integer default 0,
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

alter table user_profiles enable row level security;
alter table life_categories enable row level security;
alter table goals enable row level security;
alter table habits enable row level security;
alter table work_schedule_entries enable row level security;
alter table check_ins enable row level security;
alter table chat_messages enable row level security;
alter table plan_days enable row level security;
alter table plan_blocks enable row level security;
alter table memory_items enable row level security;
alter table progress_snapshots enable row level security;

create policy "users manage own profile" on user_profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "users manage own life categories" on life_categories
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own goals" on goals
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own habits" on habits
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own schedules" on work_schedule_entries
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own checkins" on check_ins
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own chat messages" on chat_messages
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own plan days" on plan_days
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own plan blocks" on plan_blocks
for all using (
  exists (
    select 1 from plan_days
    where plan_days.id = plan_blocks.plan_day_id
      and plan_days.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from plan_days
    where plan_days.id = plan_blocks.plan_day_id
      and plan_days.user_id = auth.uid()
  )
);

create policy "users manage own memory items" on memory_items
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own progress snapshots" on progress_snapshots
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
