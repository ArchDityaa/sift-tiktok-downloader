import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://sift-tiktok.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sift - Save TikTok videos, sounds, and covers",
    template: "%s - Sift",
  },
  description:
    "Paste a TikTok link and save the clean video without a watermark, the original sound as MP3, and the cover image. No account, no fee, no tracking.",
  keywords: [
    "tiktok downloader",
    "save tiktok video",
    "tiktok without watermark",
    "tiktok mp3",
    "tiktok cover downloader",
  ],
  applicationName: "Sift",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Sift",
    title: "Sift - Save TikTok videos, sounds, and covers",
    description:
      "Clean video, original sound, and cover image from any public TikTok. No account, no fee, no tracking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sift - Save TikTok videos, sounds, and covers",
    description:
      "Clean video, original sound, and cover image from any public TikTok. No account, no fee, no tracking.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b08" },
  ],
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("sift-theme");
    var system = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var dark = stored ? stored === "dark" : system;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="grain flex min-h-[100dvh] flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a
          href="#tool"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-ink"
        >
          Skip to downloader
        </a>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
