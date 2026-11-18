# Harbor Check

Spoiler-safe **story progress tracker** PWA (high-level MVP).

Brand: **Harbor Check** — independent fan utility. Not affiliated with Take-Two Interactive or Rockstar Games. No Rockstar maps, screenshots, or leaked mission names.

## What this MVP does

- Mobile-friendly checklist UI (Next.js + TypeScript + Tailwind)
- 5 categories with **placeholder** labels only (`Mission set A — item 1`, etc.)
- Progress persisted in **localStorage**
- **Spoiler blur** toggle + reveal tier (early / mid / late)
- **Pro paywall stub** for cloud sync and PDF export (no payment wired)
- Basic PWA: web manifest + service worker + installable icons

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
- React client state + `localStorage`
- Tailwind CSS v4
- Offline-friendly SW (`public/sw.js`)

## Legal / product notes

- Fill placeholders with **your own** notes as you play — never ship stolen guide text as product IP.
- Affiliate disclosure footer is included for future gear cross-links.
- Pro checkout is intentionally a stub; plug Lemon Squeezy / Stripe later.

## License

MIT — original Harbor Check UI and placeholder data only.
