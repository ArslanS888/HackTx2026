# Katha - project context

Katha (meaning "story/tale") is a mobile-first web app (PWA) where users visit physical places and leave notes for others who visit the same spot. Core rule: you can **read** notes from anywhere, but you can only **write** or **reply** when you are physically at the place (GPS check on the server/client).

Stack: React + Vite in JavaScript (not TypeScript), Tailwind CSS v4, lucide-react icons, react-router-dom v6, @supabase/supabase-js, vite-plugin-pwa, Vitest + React Testing Library + jsdom, ESLint. Hosted on Vercel from GitHub; GitHub Actions runs lint, tests and build.

Database (Supabase — do not change the schema without asking; it is in supabase/schema.sql):

- profiles(id = auth user id, display_name, created_at)
- places(id, name, description, lat, lng, radius_meters, created_by -> profiles.id, created_at)
- notes(id, place_id -> places.id, author_id -> profiles.id, content, status 'active'|'expired', expires_at, created_at)
- replies(id, note_id -> notes.id, author_id -> profiles.id, content, created_at)

Folder structure:
src/main.jsx, src/App.jsx (routes)
src/lib/supabase.js (one shared client), src/lib/api.js (ALL Supabase calls), src/lib/geo.js (Haversine distance + radius check), src/lib/format.js (pure helpers)
src/context/AuthContext.jsx
src/components/ (BottomNav, NoteCard, PlaceCard, LocationStatus, Avatar, EmptyState, Skeleton)
src/pages/ (Login, Onboarding, Places, PlaceBoard, CreateNote, NoteDetail, CreatePlace, Profile)
supabase/schema.sql, supabase/seed.sql, .github/workflows/ci.yml, vercel.json

Rules:

- Mobile-first: design for a 360-430px wide phone; on desktop center the app in a max-w-md column.
- Pages never call Supabase directly; they use functions from src/lib/api.js.
- Location checks use src/lib/geo.js (Haversine formula); never trust only the client — also validate on the server via RLS or a Postgres function.
- Every page handles loading, empty and error states.
- Secrets only in .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, optional VITE_ALLOWED_EMAIL_DOMAIN). Never commit .env.
- Keep components small and readable.

Working style:

- Work in small steps. After each change, list the files you changed and exactly how to test it.
- Do not push, merge, or deploy without asking first.
- Do not add AI attribution lines to commits or PRs.
