export const siteConfig = {
  name: "Sift",
  tagline: "Save TikTok videos clean and quick.",
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://sift-tiktok.vercel.app"
  ).replace(/\/$/, ""),
  description:
    "Paste a TikTok link and save the clean video without a watermark, the original sound as MP3, and the cover image. No account, no fee, no tracking.",
} as const;
