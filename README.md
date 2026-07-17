# MS AI Workforce — Phase 1 (real backend)

This is a real Next.js + Supabase app: sign up, get an organization
auto-created, get hired with 3 real AI Employees (Ava/Noah/Priya), and chat
with them — messages are actually saved to a database and Claude replies
are real, not simulated.

## What's real here
- **Auth** — Supabase Auth, real accounts, real sessions, protected `/dashboard`
- **Database** — Postgres via Supabase: organizations, profiles, AI Employees,
  conversations, messages — with Row-Level Security so one org can never see
  another's data
- **Chat** — `/api/chat` calls the real Claude API server-side and saves both
  sides of the conversation
- **Auto-provisioning** — a database trigger fires on signup and creates the
  org + hires the 3 employees automatically, no manual setup per user

## What's not built yet (from the full spec)
Billing, the other 17 AI Employee roles, knowledge base upload / RAG,
integrations, analytics — these follow the same pattern and are the next
phases once this is live and working.

---

## Setup (about 15 minutes)

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → New Project. Once it's ready:
- **Settings → API** — copy your `Project URL` and `anon public` key
- **SQL Editor** — paste the entire contents of
  `supabase/migrations/0001_init.sql` and run it. This creates every table,
  security policy, and the auto-provisioning trigger.

### 2. Get an Anthropic API key
[console.anthropic.com](https://console.anthropic.com) → Settings → API Keys → Create Key.

### 3. Configure environment variables
Copy `.env.example` to `.env.local` and fill in the three values from steps 1–2.

### 4. Run it locally (optional, to test before deploying)
```bash
npm install
npm run dev
```
Visit `http://localhost:3000`, register an account, and you should land on
a dashboard with Ava, Noah, and Priya ready to chat.

### 5. Deploy to Vercel
1. Push this folder to a GitHub repo.
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. In **Environment Variables**, add the same three keys from `.env.example`.
4. Deploy. Vercel auto-detects the Next.js app and the `/api/chat` route.
5. **Custom domain**: Project → Settings → Domains → add yours and follow
   the DNS instructions shown there.

That's a real, live, working product at that point — accounts, database,
and AI Employees all functioning for real users.

---

## Next phases (after this is deployed)
1. Add the remaining 17 AI Employee roles (same pattern as Ava/Noah/Priya —
   add rows to the `handle_new_user()` trigger, or build a "Hire" UI that
   inserts into `ai_employees` directly).
2. Knowledge base upload + RAG (pgvector is already how `technical-architecture.md`
   designs this — add a `knowledge_documents` / `knowledge_chunks` table pair
   and an embedding step).
3. Billing — Stripe Checkout + a webhook that updates a `subscriptions` table.
4. Analytics dashboard reading real aggregates from `messages` / `conversations`.
