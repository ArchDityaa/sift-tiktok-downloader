import type { MetadataRoute } from "next";

const SITE_URL = "https://sift-tiktok.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/history", "/privacy", "/terms", "/disclaimer"];
  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
