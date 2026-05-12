# DUMMYL BOT

A Facebook Messenger bot control panel web app for "COZY BOT" by Kyle Gaspari. Red/black/white dark theme. Users log in to view the bot dashboard, account status, commands, and admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/dummyl-bot run dev` — run the frontend (port 25129)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, wouter, TanStack Query
- API: Express 5 + bcryptjs (cookie-based sessions)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/users.ts` — users + sessions tables
- `artifacts/api-server/src/routes/auth.ts` — register, login, logout, /me
- `artifacts/api-server/src/routes/bot.ts` — bot status, commands, !p music
- `artifacts/api-server/src/routes/admin.ts` — admin user management
- `artifacts/dummyl-bot/src/` — React frontend

## Architecture decisions

- Cookie-based session auth (httpOnly, no JWT) — simple and secure
- Admin account is identified by email `kenzohaizen@gmail.com` and auto-granted admin on register/seed
- Passwords hashed with bcrypt (12 rounds)
- Each user gets their own dashboard — no cross-account access
- Bot status endpoint returns static data (real data would come from the running bot process)

## Product

Users sign up and log in to manage a Facebook Messenger bot (COZY BOT). The dashboard shows all bot commands, a music player (!p command), account status, and developer info. Admin (Kyle) can view all users, ban/unban/delete them via the admin dashboard.

## User preferences

- Dark red/black/white theme — aesthetic and professional
- No emojis in UI — SVG icons only
- Title: DUMMYL BOT
- Admin email: kenzohaizen@gmail.com, pass: cozy24123

## Gotchas

- After any schema change: run `pnpm --filter @workspace/db run push` then `pnpm run typecheck:libs`
- After any OpenAPI spec change: run `pnpm --filter @workspace/api-spec run codegen`
- The bot status data is currently static — wire it up to the actual bot process if needed

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
