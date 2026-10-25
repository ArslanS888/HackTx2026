# Tagalong - project context

Tagalong is a mobile-first web app (PWA) for Texas State University students to find people to join events happening soon (study sessions, hackathons, games, food, campus and town events). Core loop: post an event starting soon -> others see it in a feed -> tap "I'm going" -> attendee count updates live.

Stack: React + Vite in JavaScript (not TypeScript), Tailwind CSS v4, lucide-react icons, react-router-dom v6, @supabase/supabase-js, vite-plugin-pwa, Vitest + React Testing Library + jsdom, ESLint. Hosted on Vercel from GitHub; GitHub Actions runs lint, tests and build.

Database (already created in Supabase - do not change the schema without asking me; it is in supabase/schema.sql):

- profiles(id = auth user id, display_name, major, interests text[], created_at)
- events(id, title, description, category, place_name, lat, lng, starts_at, max_people, created_by -> profiles.id, status 'open'|'cancelled', created_at)
- event_members(event_id, user_id -> profiles.id, joined_at), primary key (event_id, user_id). A trigger rejects joins when the event is full.

Categories: study, sports, food, gaming, hackathon, music, outdoors, party, other.

Folder structure:
src/main.jsx, src/App.jsx (routes)
src/lib/supabase.js (one shared client), src/lib/api.js (ALL Supabase calls), src/lib/format.js (pure helpers)
src/context/AuthContext.jsx
src/components/ (BottomNav, EventCard, Avatar, CategoryChip, EmptyState, Skeleton)
src/pages/ (Login, Onboarding, Nearby, CreateEvent, EventDetail, Profile)
supabase/schema.sql, supabase/seed.sql, .github/workflows/ci.yml, vercel.json

Rules:

- Mobile-first: design for a 360-430px wide phone; on desktop center the app in a max-w-md column.
- Pages never call Supabase directly; they use functions from src/lib/api.js.
- Every page handles loading, empty and error states.
- Secrets only in .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, optional VITE_ALLOWED_EMAIL_DOMAIN). Never commit .env.
- Keep components small and readable.

Working style:

- Work in small steps. After each change, list the files you changed and exactly how to test it.
- Do not push, merge, or deploy without asking first.
