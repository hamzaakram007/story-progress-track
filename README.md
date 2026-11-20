# Harbor Check

Spoiler-safe **story progress tracker** PWA — Harbor Check by NeonGulf.

**Live:** https://track.neongulf.com  
**Brand:** Harbor Check (product) · NeonGulf (suite). Independent original checklist UI with generic, spoiler-safe labels.

## What it does

- Mobile-friendly checklist UI (Next.js + TypeScript + Tailwind)
- **6 categories** with **generic spoiler-safe** labels (`Mission set A — item 1`, etc.)
- Progress persisted in **localStorage** with availability / quota handling
- Free **JSON backup export/import**
- **Spoiler mask** — hidden tiers withhold labels from the DOM until Peek / reveal tier
- Category overview grid + jump chips + hide-completed filter
- **Install prompt** (Chromium `beforeinstallprompt` + iOS Add to Home Screen tip)
- Offline fallback page via service worker cache
- **Pro unlocks soon** — free local mode stays available; checkout not live yet
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

- Fill checklist slots with **your own** notes as you play — never ship stolen guide text as product IP.
- Affiliate disclosure footer is included for future gear cross-links.
- Pro sync/PDF unlock soon; free local tracking remains available without checkout.

## License

MIT — original Harbor Check UI and generic checklist data only.
