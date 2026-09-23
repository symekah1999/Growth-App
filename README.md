# Growth OS

A private, all-in-one system for tracking growth across every dimension of life: journal, goals, habits, recovery tracking, mantras & non-negotiable values, the full KJV Bible with a verse of the day, a personal quote bank with a quote of the day, daily/monthly/yearly to-dos, a savings tracker, a debt payoff planner (snowball/avalanche) — and an AI assistant that can read and act on all of it through conversation.

Built with Next.js 15 (App Router, TypeScript, Tailwind CSS v4), **Neon** (Postgres database) + **Drizzle ORM**, **Supabase** (authentication only — no public sign-up, single owner account), and the **Anthropic Claude API** (the assistant).

---

## 1. Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) account (free tier is enough)
- A [Supabase](https://supabase.com) account (free tier is enough)
- A [Vercel](https://vercel.com) account for deployment

## 2. Set up Neon (database)

1. Create a new Neon project.
2. Copy the **pooled connection string** (Dashboard → your project → Connection Details).
3. You'll paste this into `DATABASE_URL` in the next step.

## 3. Set up Supabase (auth only)

This app has exactly one intended user — you. Supabase Auth handles the login session; Growth OS itself never lets anyone sign up.

1. Create a new Supabase project.
2. **Turn off public sign-ups**: Authentication → Providers → Email → disable "Allow new users to sign up". (Belt-and-braces: the app also rejects any email that isn't your `OWNER_EMAIL`, even if this setting is ever changed.)
3. Create your one account manually: Authentication → Users → **Add user** → enter your email and a password, and tick "Auto Confirm User".
4. Copy your **Project URL** and **anon public key** from Project Settings → API.
5. Copy your new user's **UUID** from the Users table — you'll want it for `SEED_USER_ID` later (optional, just seeds a starter quote bank).

## 3b. Set up the AI Assistant (optional but recommended)

1. Go to [console.anthropic.com](https://console.anthropic.com/settings/keys) and create an API key. This is billed separately from any claude.ai subscription — it's pay-as-you-go, and a single-user app like this is very cheap to run.
2. You'll paste it into `ANTHROPIC_API_KEY` in the next step.
3. If you skip this, the rest of the app works exactly the same — the Assistant page and chat widget will just show a short setup message instead of replying.

## 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OWNER_EMAIL` (must exactly match the email of the Supabase user you created), and `ANTHROPIC_API_KEY`.

## 5. Install dependencies

```bash
npm install
```

## 6. Create the database schema

```bash
npm run db:push
```

This applies the schema in `src/db/schema.ts` directly to your Neon database (fine for a single-owner app like this; use `db:generate` + a migrations workflow later if you ever want versioned migrations).

## 7. Seed the Bible + starter content

```bash
npm run db:seed
```

This loads the full King James Version (public domain, ~31,100 verses) into the database. If you also set `SEED_USER_ID` in `.env.local` (from step 3.5), it additionally seeds a starter bank of ~30 quotes tied to your account.

## 8. Run locally

```bash
npm run dev
```

Visit http://localhost:3000 — you'll be redirected to `/login`. Sign in with the email/password you created in Supabase step 3.3.

---

## Deploying to Vercel

1. Push this repository to GitHub (see below).
2. In Vercel: **New Project** → import the repo.
3. Add the same environment variables from `.env.local` (`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OWNER_EMAIL`, `ANTHROPIC_API_KEY`) in Vercel's Project Settings → Environment Variables.
4. Deploy. Vercel builds and hosts the app; it calls Neon over HTTP (via `@neondatabase/serverless`) and Supabase for auth — no server to manage.
5. Once deployed, it's "downloadable" as a **PWA**: open the site on your phone and choose "Add to Home Screen" (iOS Safari) or the install icon in the address bar (Android Chrome / desktop Chrome) to install it like a native app. A basic PWA manifest is already included (`public/manifest.json` / `src/app/layout.tsx` metadata) — see the note in "What's not built yet" if you want offline support too.

## Pushing this project to GitHub

From this project directory:

```bash
git init                     # already done for you if you're reading this from the delivered zip
git add -A
git commit -m "Initial commit: Growth OS"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(Create the empty repo on GitHub first, without a README/license so there's no merge conflict.)

---

## Project structure

```
src/
  app/
    login/               # sign-in page (no public sign-up)
    (app)/                # everything behind auth, shares the sidebar layout
      dashboard/          # aggregated home view
      journal/            # journal CRUD + detail/edit view
      goals/               # goals + milestones, progress tracking
      habits/              # daily check-in, streaks, heatmap
      recovery/             # sobriety/addiction tracking against a day-count target (default 1000)
      mantras/             # mantras + non-negotiable core values
      bible/               # full KJV reader + verse of the day
      quotes/              # personal quote bank + quote of the day
      todos/               # daily / monthly / yearly to-dos
      savings/             # savings plans + contributions
      debts/               # debts + payments + payoff planner
  components/            # shared UI primitives (Card, Button, etc.) + Nav
  db/
    schema.ts            # full Drizzle schema (all tables)
    index.ts             # Neon + Drizzle client
    seed.ts              # Bible + starter quotes loader
    seed-data/           # KJV text (public domain), book metadata, starter quotes
  lib/
    auth.ts              # requireUser() / getCurrentUser() — enforces OWNER_EMAIL
    supabase/             # browser/server/middleware Supabase clients
    finance.ts            # debt payoff simulator, savings projections
    streaks.ts            # habit streak calculation
    daily.ts              # verse-of-the-day / quote-of-the-day pickers
    utils.ts
```

Every module follows the same pattern: a Server Component `page.tsx` reads from Postgres via Drizzle, and an `actions.ts` file has `"use server"` Server Actions for create/update/delete. The one exception is `src/app/api/chat/route.ts`, a real API route — it's what the AI assistant calls, and it's also there if you ever want to talk to your data from outside this app (a mobile shortcut, a CLI, etc.).

## The AI Assistant

Two interfaces, one brain: a floating chat bubble (bottom-right, on every page — `src/components/chat/ChatWidget.tsx`) for quick asks without leaving what you're doing, and a full **Assistant** page (`/chat`) for longer conversations. Both share the same `ChatPanel` component and the same conversation history (stored in the `chat_messages` table, so it survives reloads and switching between the widget and the full page).

Under the hood (`src/lib/ai/tools.ts`), the assistant has ~25 tools — one or more per module — that let it both *read* your data (e.g. `get_overview`, `list_goals`) and *write* to it (e.g. `create_goal`, `log_habit`, `record_debt_payment`, `log_recovery_checkin`). Every tool is scoped to your `userId` server-side, so the model can only ever touch your own data, never anyone else's, and it can't do anything the regular UI couldn't also do. Things you can say to it:

- "How am I doing this week overall?" → it calls `get_overview` and summarizes
- "Log today's run and reading habit" → it calls `log_habit` for each
- "Add a goal to save 50,000 for a laptop by December" → `create_goal`
- "I put 3000 into my emergency fund today" → `add_savings_contribution`
- "What's Philippians 4:13?" → `get_bible_verse`

For anything that logs a recovery reset, it's told to briefly confirm your intent first rather than acting on ambiguity — everything else (journal entries, habit logs, todos) it just does and reports back.

To change the model later, set `ANTHROPIC_MODEL` in your environment — check [docs.claude.com](https://docs.claude.com/en/docs/about-claude/models) for current model IDs, since new ones ship after this README was written.

## What's already deep vs. scaffolded

- **Deep**: Journal, Goals (with milestones), Habits (with streaks + heatmap) — these are the three you said matter most to start.
- **Fully functional but simpler UI**: Mantras & Values, Bible reader, Quotes, To-Dos, Savings, Debt payoff planner, Recovery. All have real CRUD and real backend logic (the debt planner runs an actual month-by-month snowball/avalanche simulation); they just have less visual polish than the three "deep" modules. Ask for any of them to be expanded further any time.

### Recovery module

Tracks one or more things you're recovering from against a day-count target (defaults to 1,000 days, but you can set any target per tracker). The day counter is purely date-based — it doesn't depend on you logging in daily. Optional daily check-ins let you note craving level and how the day went, without being required to keep the streak counter itself accurate. A "reset" doesn't delete history: it logs the streak that just ended (so your longest streak stays on record) and starts day one over from today. Milestone badges fire at 1, 7, 30, 60, 90, 180, 365, 500, 730, and 1,000 days.

## What's not built yet (ideas for next passes)

- Rich text / markdown rendering in the journal (currently plain text)
- Recurring/repeating to-dos (e.g. auto-recreate a daily to-do each morning)
- Charts (the `recharts` package is already installed for this — e.g. a net-worth-over-time or habit-consistency chart)
- True offline-capable PWA (service worker + offline cache) — right now "installable" works, but it still needs a network connection
- Email/push reminders (e.g. "you haven't journaled today")
- CSV export of your data

## Security notes

- There is no public sign-up route anywhere in this app.
- `requireUser()` (src/lib/auth.ts) is called at the top of the `(app)` layout and rejects any signed-in user whose email doesn't match `OWNER_EMAIL`, even if someone else got a Supabase session cookie.
- Every table has a `user_id` column and every query filters by it, so the schema is ready if you ever *do* want to add a second account later.
- Keep `.env.local` out of git (it already is, via `.gitignore`) and set the same values as Vercel environment variables instead.
