# Harbor Check

Spoiler-safe **story progress tracker** PWA — Harbor Check by NeonGulf.

**Live:** https://track.neongulf.com  
**Brand:** Harbor Check (product) · NeonGulf (suite). Independent original checklist UI with blank/user labels only — not an affiliate shop.

## What it does

- Mobile-friendly checklist UI (Next.js + TypeScript + Tailwind)
- **6 categories** with blank slots you can rename (your notes only)
- Progress in **localStorage** with availability / quota handling + cross-tab sync
- Free **JSON backup** (import/export) and **CSV export**
- **Spoiler mask** — hidden tiers withhold labels from the DOM until Peek / reveal tier
- Category overview, search, hide-completed, first-action CTA, milestone feedback
- **Install prompt** (Chromium `beforeinstallprompt` + iOS Add to Home Screen tip)
- Offline fallback via service worker cache
- Security headers (CSP, frame deny, nosniff, referrer, permissions)
- Soft NeonGulf suite footer link only — no affiliate catalog takeover
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

- Fill checklist slots with **your own** notes as you play — never ship stolen guide text or ripped maps.
- Soft link to NeonGulf suite home only; this product is a tracker, not a shop.
- Pro sync/PDF unlock soon; free local tracking remains available without checkout.

## License

MIT — original Harbor Check UI and generic checklist data only.
