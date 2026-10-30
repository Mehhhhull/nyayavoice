# NyayaVoice landing page (Next.js)

Next.js 15 (App Router) + TypeScript. Same design as the published HTML page, split into components.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck
```

Set your real domain before deploying (used for canonical URL, sitemap, robots and Open Graph):

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Deploy on Vercel: import the repo, add `NEXT_PUBLIC_SITE_URL`, deploy.

## Where things are

| Path | What |
| --- | --- |
| `app/globals.css` | All styling (design tokens at the top of `:root`) |
| `app/layout.tsx` | `next/font` setup, metadata, Open Graph, hreflang |
| `app/page.tsx` | Page composition and JSON-LD (WebSite, SoftwareApplication, FAQPage) |
| `lib/data.ts` | Demo scenarios, FAQ, marquee phrases, official links |
| `components/Demo.tsx` | Hold-to-speak sample demo (scripted, uses sample data) |
| `components/Effects.tsx` | Scroll reveals, line-art draw-in, cursor, magnetic buttons |
| `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx` | SEO files |

## Notes

- The demo is scripted sample data and is labelled that way on the page. It never requests the microphone. When the real app exists, point the "Try the sample" buttons at it.
- Fonts load through `next/font/google` at build time (Instrument Serif, Hanken Grotesk, DM Mono, Noto Sans Devanagari, Tiro Devanagari Hindi).
- FAQ text lives once in `lib/data.ts` and feeds both the visible FAQ and the FAQPage JSON-LD.
