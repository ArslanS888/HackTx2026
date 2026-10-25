-- Run this in Supabase SQL Editor within an hour of judging so events show as "starting soon".
-- Replace the email addresses with your actual demo account emails before running.

do $$
declare
  demo1_id uuid;
  demo2_id uuid;
  e1 uuid; e2 uuid; e3 uuid; e4 uuid; e5 uuid; e6 uuid; e7 uuid; e8 uuid;
begin
  -- look up demo user IDs
  select id into demo1_id from auth.users where email = 'demo1@example.com' limit 1;
  select id into demo2_id from auth.users where email = 'demo2@example.com' limit 1;

  if demo1_id is null then
    raise exception 'demo1@example.com not found — sign up with that email first';
  end if;

  -- delete old demo events from demo1
  delete from events where created_by = demo1_id;

  -- insert events
  insert into events (id, title, category, place_name, lat, lng, starts_at, max_people, created_by, status)
  values
    (gen_random_uuid(), 'Study session — finals prep', 'study',
      'Alkek Library, 7th floor', 29.8886, -97.9407, now() + interval '20 minutes', 6, demo1_id, 'open')
  returning id into e1;

  insert into events (id, title, category, place_name, lat, lng, starts_at, max_people, created_by, status)
  values
    (gen_random_uuid(), 'Pickup soccer at the Quad', 'sports',
      'The Quad, Texas State', 29.8871, -97.9384, now() + interval '45 minutes', 10, demo1_id, 'open')
  returning id into e2;

  insert into events (id, title, category, place_name, lat, lng, starts_at, max_people, created_by, status)
  values
    (gen_random_uuid(), 'Tacos at Chili Pepper', 'food',
      'Chili Pepper Mexican Grill', 29.8834, -97.9416, now() + interval '1 hour', 5, demo1_id, 'open')
  returning id into e3;

  insert into events (id, title, category, place_name, lat, lng, starts_at, max_people, created_by, status)
  values
    (gen_random_uuid(), 'HackTX project sprint', 'hackathon',
      'LBJ Student Center, Bluebonnet Hall', 29.8876, -97.9379, now() + interval '1 hour 30 minutes', 8, demo1_id, 'open')
  returning id into e4;

  insert into events (id, title, category, place_name, lat, lng, starts_at, max_people, created_by, status)
  values
    (gen_random_uuid(), 'Smash Bros tournament', 'gaming',
      'LBJ Student Center, Game Room', 29.8876, -97.9379, now() + interval '2 hours', 8, demo1_id, 'open')
  returning id into e5;

  insert into events (id, title, category, place_name, lat, lng, starts_at, max_people, created_by, status)
  values
    (gen_random_uuid(), 'Kayaking at Sewell Park', 'outdoors',
      'Sewell Park, San Marcos River', 29.8853, -97.9349, now() + interval '3 hours', 6, demo1_id, 'open')
  returning id into e6;

  insert into events (id, title, category, place_name, lat, lng, starts_at, max_people, created_by, status)
  values
    (gen_random_uuid(), 'Coffee & coding at Kerbey Lane', 'study',
      'Kerbey Lane Cafe, San Marcos', 29.8801, -97.9412, now() + interval '4 hours', 4, demo1_id, 'open')
  returning id into e7;

  insert into events (id, title, category, place_name, lat, lng, starts_at, max_people, created_by, status)
  values
    (gen_random_uuid(), 'Rec center workout partner', 'sports',
      'Student Recreation Center, TXST', 29.8907, -97.9430, now() + interval '5 hours', 4, demo1_id, 'open')
  returning id into e8;

  -- demo1 joins all their own events
  insert into event_members (event_id, user_id)
  values (e1, demo1_id), (e2, demo1_id), (e3, demo1_id), (e4, demo1_id),
         (e5, demo1_id), (e6, demo1_id), (e7, demo1_id), (e8, demo1_id);

  -- demo2 joins three events (if exists)
  if demo2_id is not null then
    insert into event_members (event_id, user_id)
    values (e1, demo2_id), (e3, demo2_id), (e4, demo2_id);
  end if;

  raise notice 'Seed complete — 8 events created.';
end $$;
