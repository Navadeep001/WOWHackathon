# LegoLink

Find the right hackathon teammates. Build winning projects with AI.

---

## Setup (do this before `npm run dev`)

### 1. Clone and install
```bash
git clone <your-repo>
cd legolink
npm install
```

### 2. Create `.env.local`
```bash
cp .env.local.example .env.local
```
Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project Settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from the same page
- `GEMINI_API_KEY` — from https://aistudio.google.com/app/apikey

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. In the dashboard, go to **SQL Editor > New Query**
3. Paste the entire contents of `supabase-schema.sql` and click Run
4. Go to **Authentication > Providers** and enable **Google** (for Google OAuth)

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel
```bash
npx vercel
```
Add the same three env vars in Vercel's project settings.

---

## User Flow

```
Landing Page → Sign Up → Onboarding → Dashboard
→ Hackathon Detail → Interested
→ Create Team (AutoMatch) OR Join Team (AI Recommendations)
→ Project Workspace → AI Mentor / Tasks / Roadmap / Boilerplate
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (no separate server)
- **Database + Auth**: Supabase (Postgres + Auth + Realtime)
- **AI**: Google Gemini 1.5 Flash via `@google/generative-ai`
- **Deployment**: Vercel
