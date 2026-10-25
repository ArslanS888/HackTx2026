-- ===== Tables =====
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  major text,
  interests text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 80),
  description text check (char_length(description) <= 500),
  category text not null default 'other' check (category in
    ('study','sports','food','gaming','hackathon','music','outdoors','party','other')),
  place_name text not null,
  lat double precision,
  lng double precision,
  starts_at timestamptz not null,
  max_people int not null default 5 check (max_people between 2 and 50),
  created_by uuid not null references profiles(id) on delete cascade,
  status text not null default 'open' check (status in ('open','cancelled')),
  created_at timestamptz not null default now()
);

create index events_starts_at_idx on events (starts_at);

create table event_members (
  event_id uuid not null references events(id) on delete cascade,
  user_id  uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ===== Row Level Security =====
alter table profiles     enable row level security;
alter table events       enable row level security;
alter table event_members enable row level security;

create policy "read profiles"       on profiles for select to authenticated using (true);
create policy "insert own profile"  on profiles for insert to authenticated with check (auth.uid() = id);
create policy "update own profile"  on profiles for update to authenticated using (auth.uid() = id);

create policy "read events"         on events for select to authenticated using (true);
create policy "create own events"   on events for insert to authenticated with check (auth.uid() = created_by);
create policy "update own events"   on events for update to authenticated using (auth.uid() = created_by);
create policy "delete own events"   on events for delete to authenticated using (auth.uid() = created_by);

create policy "read members"        on event_members for select to authenticated using (true);
create policy "join as yourself"    on event_members for insert to authenticated with check (auth.uid() = user_id);
create policy "leave as yourself"   on event_members for delete to authenticated using (auth.uid() = user_id);

-- ===== Capacity rule: reject joins when full or cancelled =====
create or replace function check_event_capacity() returns trigger
language plpgsql as $$
begin
  if (select status from events where id = new.event_id) <> 'open' then
    raise exception 'Event is not open';
  end if;
  if (select count(*) from event_members where event_id = new.event_id)
     >= (select max_people from events where id = new.event_id) then
    raise exception 'Event is full';
  end if;
  return new;
end $$;

create trigger enforce_event_capacity
  before insert on event_members
  for each row execute function check_event_capacity();

-- ===== Realtime: live attendee updates =====
alter table event_members replica identity full;
alter publication supabase_realtime add table event_members;
