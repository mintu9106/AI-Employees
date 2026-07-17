# Deploying MS AI Workforce

This folder is ready to deploy as-is. It's the marketing site + AI Employee
directory + dashboard preview, wired to a real Claude-powered chat backend
(not the Claude-sandbox-only version).

## What's in here
- `index.html` — the full site
- `api/chat.js` — a serverless function that holds your real Anthropic API key
  and proxies chat requests to Claude, so the key never reaches the browser

## Deploy in ~10 minutes (Vercel)

1. **Get an API key** at [console.anthropic.com](https://console.anthropic.com)
   → Settings → API Keys.
2. **Push this folder to a GitHub repo** (or drag-and-drop it — Vercel supports
   both).
3. Go to [vercel.com/new](https://vercel.com/new), import the repo.
4. In the project's **Environment Variables**, add:
   ```
   ANTHROPIC_API_KEY = sk-ant-...
   ```
5. Click **Deploy**. Vercel auto-detects `api/chat.js` as a serverless
   function — no config needed.
6. Once deployed, click **Chat with an AI Employee** on the live site — it
   will now hit `/api/chat` on your own domain instead of relying on Claude's
   sandbox.
7. **Custom domain**: Project → Settings → Domains → add
   `msaiworkforce.com` (or whatever you own) and follow the DNS steps shown.

Netlify and Cloudflare Pages work the same way — same two files, their
serverless function syntax differs slightly from Vercel's Edge Function
format above, so the `api/chat.js` file would need a small adapter if you
pick one of those instead.

## What this gets you
- A live, public marketing + product site
- A real, working AI Employee chat (all 20 roles) — costs apply per Anthropic
  API usage (a handful of cents per conversation on Sonnet)
- Nothing else is wired to a backend yet: Login/Register/Contact forms,
  the dashboard's data, and billing are still UI previews.

## What comes next
Turning "Login" and "Dashboard" into real, working features (saved AI
Employees, real conversation history, billing, multi-tenant accounts)
means building the backend described in `technical-architecture.md` —
Supabase for auth + database, the schema and API routes already specified
there. That's a multi-week build, not a config change, and is worth doing
in the phases outlined at the end of that document.
