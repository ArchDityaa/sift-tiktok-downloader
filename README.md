# Sift - TikTok downloader

A small, no-nonsense web app for saving public TikTok media: the clean video
without a watermark, the original sound as MP3, and the cover image. No
account, no API key, no fee.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, Motion, and
Phosphor icons. Deploys to Vercel's free tier as-is.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## How it works

- `POST /api/resolve` runs a fallback chain of extractors:
  1. `gateway` - the public tikwm.com endpoint (primary, no key)
  2. `native` - reads TikTok's own embedded page data
  3. `oembed` - TikTok's documented oEmbed, cover only, last resort
- The chain returns the first result that carries a download. If only a cover
  can be recovered, the response is marked partial so the UI explains why.
- `GET /api/proxy?url=...&filename=...` streams a media file back with a forced
  download name. It is locked to known TikTok and CDN hosts so it cannot be
  used as an open proxy.

Every source is free and keyless. If one breaks, the next takes over.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New Project** and import the repository.
3. Leave the framework preset as **Next.js**. No environment variables are
   required.
4. Deploy.

Optionally update the `SITE_URL` constant in `src/app/layout.tsx`,
`src/app/robots.ts`, and `src/app/sitemap.ts` to your final domain so canonical
URLs and the sitemap point at the right place.

## Notes and limits

- Only public posts can be read. Private, region-locked, or removed posts fail.
- Vercel's serverless functions cap at 10 seconds on the free plan. The
  resolver enforces per-source and total time budgets to stay inside that.
- Media is streamed from the TikTok CDN; nothing is stored on the server.

## Legal

Sift is independent and is not affiliated with TikTok or ByteDance. Use it for
personal use and respect creators' rights. See `/privacy`, `/terms`, and
`/disclaimer` inside the app.
