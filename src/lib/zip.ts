import { zip } from "fflate";
import { sanitizeFilename } from "@/lib/format";

export interface ZipFile {
  /** Remote media URL from the resolved result. */
  url: string;
  /** Desired filename inside the archive. */
  name: string;
}

async function fetchViaProxy(url: string): Promise<Response> {
  return fetch(`/api/proxy?${new URLSearchParams({ url }).toString()}`);
}

/**
 * Fetch bytes for a remote asset. Tries the CDN directly first so the bytes
 * never touch our server, and falls back to the proxy when CORS blocks the
 * direct request.
 */
async function fetchBytes(url: string): Promise<Uint8Array> {
  try {
    const direct = await fetch(url, { mode: "cors", credentials: "omit" });
    if (direct.ok) return new Uint8Array(await direct.arrayBuffer());
  } catch {
    // fall through to the proxy
  }

  const proxied = await fetchViaProxy(url);
  if (!proxied.ok) throw new Error(`Could not fetch ${url}`);
  return new Uint8Array(await proxied.arrayBuffer());
}

function buildName(base: string, index: number, ext: string): string {
  return `${base}-${String(index + 1).padStart(2, "0")}.${ext}`;
}

/**
 * Downloads every image in a photo post and bundles them into a single ZIP
 * built entirely in the browser. Keeps image downloads off our servers when
 * the CDN allows it, and gives iOS users one tap instead of many.
 */
export async function downloadImagesAsZip(
  base: string,
  urls: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const safeBase = sanitizeFilename(base);
  const entries: Record<string, Uint8Array> = {};

  let done = 0;
  const concurrency = 3;
  let cursor = 0;

  async function worker() {
    while (cursor < urls.length) {
      const index = cursor;
      cursor += 1;
      const bytes = await fetchBytes(urls[index]!);
      const ext = "jpg";
      entries[buildName(safeBase, index, ext)] = bytes;
      done += 1;
      onProgress?.(done, urls.length);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, urls.length) }, worker),
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    zip(entries, { level: 0 }, (err, data) => {
      if (err) reject(err);
      else resolve(new Blob([data as BlobPart], { type: "application/zip" }));
    });
  });

  triggerDownload(blob, `${safeBase || "sift-photos"}.zip`);
}

/** Hands a Blob to the browser as a numbered file download. */
export function triggerDownload(blob: Blob, filename: string): void {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10_000);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Triggers a batch of downloads one after another, spaced out so browsers do
 * not collapse or block the rapid succession of save prompts.
 */
export async function downloadSequentially(
  items: ZipFile[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]!;
    const res = await fetch(`/api/proxy?${new URLSearchParams({ url: item.url, filename: item.name }).toString()}`);
    if (res.ok) {
      triggerDownload(await res.blob(), item.name);
    }
    onProgress?.(i + 1, items.length);
    if (i < items.length - 1) await delay(600);
  }
}
