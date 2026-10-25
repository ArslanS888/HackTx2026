-- ===== Tables =====

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  created_at timestamptz not null default now()
);

create table places (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  description text check (char_length(description) <= 200),
  lat double precision not null,
  lng double precision not null,
  radius_meters int not null default 50 check (radius_meters between 10 and 500),
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index places_lat_lng_idx on places (lat, lng);

create table notes (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  status text not null default 'active' check (status in ('active', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index notes_place_idx on notes (place_id, status, created_at desc);

create table replies (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

create index replies_note_idx on replies (note_id, created_at asc);

-- ===== Row Level Security =====

alter table profiles enable row level security;
alter table places   enable row level security;
alter table notes    enable row level security;
alter table replies  enable row level security;

-- Profiles
create policy "read profiles"      on profiles for select to authenticated using (true);
create policy "insert own profile" on profiles for insert to authenticated with check (auth.uid() = id);
create policy "update own profile" on profiles for update to authenticated using (auth.uid() = id);

-- Places
create policy "read places"        on places for select to authenticated using (true);
create policy "create places"      on places for insert to authenticated with check (auth.uid() = created_by);
create policy "update own places"  on places for update to authenticated using (auth.uid() = created_by);
create policy "delete own places"  on places for delete to authenticated using (auth.uid() = created_by);

-- Notes
create policy "read active notes"  on notes for select to authenticated using (status = 'active');
create policy "create notes"       on notes for insert to authenticated with check (auth.uid() = author_id);
create policy "update own notes"   on notes for update to authenticated using (auth.uid() = author_id);
create policy "delete own notes"   on notes for delete to authenticated using (auth.uid() = author_id);

-- Replies
create policy "read replies"       on replies for select to authenticated using (true);
create policy "create replies"     on replies for insert to authenticated with check (auth.uid() = author_id);
create policy "delete own replies" on replies for delete to authenticated using (auth.uid() = author_id);

-- ===== Auto-expire notes older than 30 days =====
-- Run this as a scheduled job (e.g. pg_cron) or from a Supabase Edge Function:
-- UPDATE notes SET status = 'expired' WHERE expires_at < now() AND status = 'active';
