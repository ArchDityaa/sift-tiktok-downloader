# Sift - TikTok downloader

A small, no-nonsense web app for saving public TikTok media: the clean video
without a watermark, the original sound as MP3, and the cover image. Paste a
single link or a whole batch, and bundle photo posts into one ZIP. No account,
no API key, no fee.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, Motion, fflate,
and Phosphor icons. Deploys to Vercel's free tier as-is.

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
Successful lookups are memoised for five minutes, and the gateway provider
retries once on a transient server error.

## Batch and ZIP

- **Batch download:** the input accepts one or many links (newline, space, or
  comma separated). Links are validated and de-duplicated client-side, then
  queued with a concurrency of three and a cap of twenty per batch. Each row
  resolves independently and can be retried on its own.
- **Download all videos:** when several ready items hold a video, one button
  fires their downloads in sequence (spaced out so browsers do not drop them).
- **ZIP for photo posts:** when a post has more than one image, the images are
  fetched and zipped **in the browser** with fflate. Direct CDN requests are
  tried first so the bytes never touch our server; the proxy is used only when
  CORS blocks the direct request.

## Hardening

- **Timeouts:** both route handlers declare `maxDuration` (`/api/resolve` 15s,
  `/api/proxy` 60s). The resolver also enforces per-source and total budgets.
- **Rate limiting:** in-memory, per-IP limits (30 lookups/min, 60 downloads/min).
  Serverless instances are ephemeral, so this deters casual abuse rather than
  enforcing a hard quota.
- **Cross-site guard:** requests with `Sec-Fetch-Site: cross-site` are rejected.
- **Proxy safety:** restricted to known TikTok/CDN hosts, forwards `Range` for
  resumable downloads and playback, and reconciles the filename with the served
  content type so a `.jpg` that is really webp is saved as `.webp`.
- **Headers/CSP:** security headers on every route, plus a pragmatic
  Content-Security-Policy in production.
- **Error handling:** app-level and root error boundaries, plus a not-found page.

## Scripts

```bash
npm run dev        # local development
npm run build      # production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest (unit tests for url parsing, media types, rate limit)
npm run icons      # regenerate PNG icons from the SVG marks
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New Project** and import the repository.
3. Leave the framework preset as **Next.js**. No environment variables are
   required.
4. Deploy.

Optional: set `NEXT_PUBLIC_SITE_URL` to your final domain (see `.env.example`)
so canonical URLs, Open Graph tags, `robots.txt`, and the sitemap point at the
right place. Without it the app falls back to a sensible default.

## Notes and limits

- Only public posts can be read. Private, region-locked, or removed posts fail.
- Vercel's serverless functions cap at 10 seconds on the free plan; enable
  Fluid compute or raise the limit to use the full 60s proxy budget.
- The proxy streams bytes through Vercel. On the Hobby plan (100 GB/month fast
  data transfer) heavy use will burn transfer; the "Open" link downloads
  straight from the TikTok CDN with zero Vercel bandwidth.
- Media is streamed from the TikTok CDN; nothing is stored on the server.


## Legal

Sift is independent and is not affiliated with TikTok or ByteDance. Use it for
personal use and respect creators' rights. See `/privacy`, `/terms`, and
`/disclaimer` inside the app.
