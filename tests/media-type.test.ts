import { describe, it, expect } from "vitest";
import {
  typeFromExt,
  contentTypeConflicts,
  reconcileFilename,
} from "@/lib/media-type";

describe("typeFromExt", () => {
  it("classifies audio", () => {
    expect(typeFromExt("mp3")).toBe("audio");
    expect(typeFromExt("m4a")).toBe("audio");
  });
  it("classifies images", () => {
    expect(typeFromExt("jpg")).toBe("image");
    expect(typeFromExt("webp")).toBe("image");
  });
  it("classifies video by default", () => {
    expect(typeFromExt("mp4")).toBe("video");
    expect(typeFromExt("mov")).toBe("video");
  });
});

describe("contentTypeConflicts", () => {
  it("flags a jpg served as webp", () => {
    expect(contentTypeConflicts("image/webp", "jpg")).toBe(true);
  });
  it("accepts a matching type", () => {
    expect(contentTypeConflicts("image/jpeg", "jpg")).toBe(false);
    expect(contentTypeConflicts("video/mp4", "mp4")).toBe(false);
  });
  it("ignores octet-stream", () => {
    expect(contentTypeConflicts("application/octet-stream", "jpg")).toBe(false);
  });
});

describe("reconcileFilename", () => {
  it("rewrites a jpg filename to webp when webp is served", () => {
    const r = reconcileFilename("clip-cover.jpg", "image/webp", "clip-cover");
    expect(r.filename).toBe("clip-cover.webp");
    expect(r.ext).toBe("webp");
  });

  it("keeps a correct mp4 name", () => {
    const r = reconcileFilename("clip-video.mp4", "video/mp4", "clip-video");
    expect(r.filename).toBe("clip-video.mp4");
    expect(r.kind).toBe("video");
  });

  it("forces mp4 when a video is mistakenly named jpg", () => {
    const r = reconcileFilename("clip-video.jpg", "video/mp4", "clip-video");
    expect(r.filename).toBe("clip-video.mp4");
  });

  it("adds a sensible extension when none is provided", () => {
    expect(reconcileFilename(null, "application/octet-stream", "sift-download").filename).toBe(
      "sift-download.mp4",
    );
  });
});
