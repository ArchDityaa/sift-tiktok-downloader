export type MediaType = "video" | "audio" | "image";

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const EXTS = new Set(["mp4", "mp3", "jpg", "jpeg", "png", "webp", "avif", "gif", "mov", "m4a"]);

/** Map an extension to the broad media category. */
export function typeFromExt(ext: string): MediaType {
  const e = ext.toLowerCase();
  if (e === "mp3" || e === "m4a") return "audio";
  if (e === "jpg" || e === "jpeg" || e === "png" || e === "webp" || e === "avif" || e === "gif") {
    return "image";
  }
  return "video";
}

/**
 * True when a delivered content type and a declared file extension disagree,
 * e.g. a ".jpg" cover that is actually served as image/webp. Used to relabel
 * downloads so the saved filename matches the real bytes.
 */
export function contentTypeConflicts(contentType: string, ext: string): boolean {
  const ct = (contentType.split(";")[0] ?? "").trim().toLowerCase();
  if (!ct || ct === "application/octet-stream") return false;
  const e = ext.toLowerCase();

  if (e === "jpg" || e === "jpeg") return ct !== "image/jpeg";
  if (e === "png") return ct !== "image/png";
  if (e === "webp") return ct !== "image/webp";
  if (e === "mp3") return !(ct === "audio/mpeg" || ct === "audio/mp3");
  if (e === "mp4" || e === "mov") return !ct.startsWith("video/");
  return false;
}

export interface CorrectedFile {
  filename: string;
  ext: string;
  kind?: MediaType;
}

/** Reconcile a requested filename with the content type actually served. */
export function reconcileFilename(
  filename: string | null | undefined,
  contentType: string,
  fallbackBase: string,
): CorrectedFile {
  const name = filename && filename.trim() ? filename.trim() : fallbackBase;
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name) || fallbackBase;
  const declaredExt = (dot > 0 ? name.slice(dot + 1) : "").toLowerCase();
  const ct = (contentType.split(";")[0] ?? "").trim().toLowerCase();

  if (ct in IMAGE_TYPES) {
    const ext = IMAGE_TYPES[ct]!;
    return { filename: `${base}.${ext}`, ext, kind: "image" };
  }
  if (ct === "audio/mpeg" || ct === "audio/mp3") {
    return { filename: `${base}.mp3`, ext: "mp3", kind: "audio" };
  }
  if (ct.startsWith("video/")) {
    if (!EXTS.has(declaredExt) || declaredExt === "jpg" || declaredExt === "webp") {
      return { filename: `${base}.mp4`, ext: "mp4", kind: "video" };
    }
    return { filename: name, ext: declaredExt, kind: "video" };
  }
  if (!declaredExt) {
    return { filename: `${base}.mp4`, ext: "mp4" };
  }
  return { filename: name, ext: declaredExt };
}
