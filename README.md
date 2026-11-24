# BuildGap

Verified software pain-point database & AI-ready MVP specs for Cursor, Claude Code, Lovable, and Bolt builders.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Data Collection & Enrichment Pipeline

```bash
npm run pipeline:collect
OPENAI_API_KEY=... OPENAI_BASE_URL=https://api.openai.com/v1 OPENAI_MODEL=gpt-4o-mini npm run pipeline:enrich
```

## Production Setup

1. Run `docs/03-DATABASE.sql` in your Supabase SQL Editor.
2. Copy `.env.example` to `.env.local` and fill in Supabase, `NEXT_PUBLIC_SITE_URL`, and checkout URLs (Lemon Squeezy / Paddle / Creem).
3. Deploy to Vercel (`npm run build`).
