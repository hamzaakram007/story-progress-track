# Harbor Check

Spoiler-safe **story progress tracker** PWA.

**Live:** https://story-progress-track.vercel.app  
**Brand:** Harbor Check — independent fan utility. Not affiliated with Take-Two Interactive or Rockstar Games. No Rockstar maps, screenshots, or leaked mission names.

## What it does

- Mobile-friendly checklist UI (Next.js + TypeScript + Tailwind)
- **6 categories** with **placeholder** labels only (`Mission set A — item 1`, etc.)
- Progress persisted in **localStorage** with availability / quota handling
- Free **JSON backup export/import**
- **Spoiler mask** — hidden tiers withhold labels from the DOM until Peek / reveal tier
- Category overview grid + jump chips + hide-completed filter
- **Install prompt** (Chromium `beforeinstallprompt` + iOS Add to Home Screen tip)
- Offline fallback page via service worker cache
- **Pro paywall stub** clearly labeled — no charge, no Stripe/Lemon yet
- SEO: canonical URL, Open Graph / Twitter cards, sitemap, robots, JSON-LD

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm start
```

## Stack

- Next.js App Router
- React client state + hardened `localStorage`
- Tailwind CSS v4
- Offline-friendly SW (`public/sw.js`) + web manifest

## Legal / product notes

- Fill placeholders with **your own** notes as you play — never ship stolen guide text as product IP.
- Affiliate disclosure footer is included for future gear cross-links.
- Pro checkout is intentionally a stub; plug Lemon Squeezy / Stripe later.

## License

MIT — original Harbor Check UI and placeholder data only.
