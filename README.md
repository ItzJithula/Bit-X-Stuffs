# Bit X Stuffs — Premium Account Hub

A TanStack Start (React SSR) app backed by Supabase, ready to deploy on Vercel.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

## Deploy to Vercel

### Option A — Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option B — Vercel Dashboard
1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the repo at https://vercel.com/new.
3. Add these **Environment Variables** in the Vercel project settings:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — your Supabase anon/public key

### Supabase Google OAuth setup
After deploying, add your Vercel domain to Supabase:
- Go to **Supabase Dashboard → Authentication → URL Configuration**
- Add `https://your-app.vercel.app` to **Redirect URLs**
- In **Authentication → Providers → Google**, make sure Google is enabled and your OAuth credentials are set.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon public key |

## Tech Stack
- **Framework:** TanStack Start (React 19, SSR)
- **Routing:** TanStack Router
- **Auth & DB:** Supabase
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Build:** Vite 7
