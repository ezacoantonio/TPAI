# TPAI Life Coach

Phone-first life coach and daily planner built with Next.js. The app is usable immediately in local demo mode and can be connected to Supabase and OpenAI through environment variables for production-style persistence and AI responses.

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ENABLE_DEMO_MODE`

Recommended local defaults:

- Leave `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` while building locally.
- If Supabase keys are missing, the app can still enter demo mode.
- If `OPENAI_API_KEY` is missing, chat planning falls back to a local planner only when demo mode is enabled.

## Included

- Mobile-first onboarding
- Chat, Plan, and Progress tabs
- Daily planning around work schedule pockets
- Durable memory summaries in the client data model
- Supabase-ready schema in `supabase/schema.sql`

## GitHub workflow

Use GitHub as the source of truth for deployment:

```bash
git checkout -b feature/my-change
npm test
npm run build
git add .
git commit -m "Describe the change"
git checkout main
git merge --ff-only feature/my-change
git push origin main
```

Branch strategy:

- `main` should always be deployable.
- Do work in short-lived branches.
- Merge to `main` only after local smoke checks pass.

## Render setup

This repo includes `render.yaml` for a single Next.js web service.

Minimum Render environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`

Recommended rollout:

1. Connect the GitHub repo to Render.
2. Add the required environment variables.
3. Keep demo mode disabled in production.
4. Confirm auth, persistence, and chat work before sharing the app publicly.

## Production readiness gate

Do not treat the Render deployment as production-ready until all of the following are true:

- Supabase sign up and sign in work.
- User data persists across refreshes and devices.
- The chat endpoint returns real OpenAI-backed responses.
- `npm test` and `npm run build` pass locally before pushing.

## Smoke checklist

Before every push to `main`:

1. Run `npm test`.
2. Run `npm run build`.
3. Open the app in a clean browser profile or incognito window.
4. Confirm the favicon loads and the main screens render.

## Troubleshooting

- Hydration warning with `data-extension-*` attributes:
  This is usually caused by a browser extension injecting attributes into the page before React hydrates. Recheck in a clean browser profile before treating it as an app bug.
- Missing environment variables:
  If demo mode is disabled, the app requires Supabase and OpenAI configuration instead of falling back silently.
- Local demo mode:
  Demo mode uses browser-local persistence only, so it is useful for local development but not for shared or production use.
