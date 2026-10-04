import { describe, it, expect } from "vitest";
import {
  parseTikTokUrl,
  isTikTokUrl,
  extractVideoId,
  parseManyUrls,
  canonicalKey,
} from "@/lib/tiktok/url";

describe("parseTikTokUrl", () => {
  it("accepts a standard video URL", () => {
    const url = parseTikTokUrl(
      "https://www.tiktok.com/@tiktok/video/7106594312292453675",
    );
    expect(url?.hostname).toBe("www.tiktok.com");
  });

  it("adds https when the scheme is missing", () => {
    expect(parseTikTokUrl("tiktok.com/@user/video/123")?.protocol).toBe(
      "https:",
    );
  });

  it("accepts short share links", () => {
    expect(parseTikTokUrl("https://vm.tiktok.com/abc123")).not.toBeNull();
  });

  it("rejects non-TikTok hosts", () => {
    expect(parseTikTokUrl("https://evil.example.com/x")).toBeNull();
  });

  it("rejects host look-alikes", () => {
    expect(parseTikTokUrl("https://tiktok.com.evil.io/x")).toBeNull();
  });

  it("rejects javascript: URLs", () => {
    expect(parseTikTokUrl("javascript:alert(1)")).toBeNull();
  });

  it("rejects empty input", () => {
    expect(parseTikTokUrl("   ")).toBeNull();
  });
});

describe("isTikTokUrl", () => {
  it("mirrors parseTikTokUrl", () => {
    expect(isTikTokUrl("https://www.tiktok.com/@a/video/1")).toBe(true);
    expect(isTikTokUrl("https://youtube.com/watch?v=1")).toBe(false);
  });
});

describe("extractVideoId", () => {
  it("pulls the numeric id from a video path", () => {
    expect(
      extractVideoId("https://www.tiktok.com/@user/video/7106594312292453675"),
    ).toBe("7106594312292453675");
  });

  it("pulls the id from a photo path", () => {
    expect(
      extractVideoId("https://www.tiktok.com/@user/photo/7123456789012345678"),
    ).toBe("7123456789012345678");
  });

  it("returns null when there is no id", () => {
    expect(extractVideoId("https://www.tiktok.com/@user")).toBeNull();
  });
});

describe("canonicalKey", () => {
  it("ignores www and trailing slashes", () => {
    expect(canonicalKey("https://www.tiktok.com/@a/video/1/")).toBe(
      canonicalKey("https://tiktok.com/@a/video/1"),
    );
  });

  it("returns null for non-TikTok input", () => {
    expect(canonicalKey("https://youtube.com/x")).toBeNull();
  });
});

describe("parseManyUrls", () => {
  it("parses links separated by newlines, spaces, and commas", () => {
    const { valid, invalid } = parseManyUrls(
      "https://www.tiktok.com/@a/video/111\nhttps://vm.tiktok.com/bbb, https://www.tiktok.com/@c/video/333",
    );
    expect(valid).toHaveLength(3);
    expect(invalid).toHaveLength(0);
  });

  it("de-duplicates links that point at the same post", () => {
    const { valid } = parseManyUrls(
      "https://www.tiktok.com/@a/video/111 https://www.tiktok.com/@a/video/111/",
    );
    expect(valid).toHaveLength(1);
  });

  it("reports invalid tokens separately", () => {
    const { valid, invalid } = parseManyUrls(
      "https://www.tiktok.com/@a/video/111 not-a-link https://youtube.com/x",
    );
    expect(valid).toHaveLength(1);
    expect(invalid).toContain("not-a-link");
    expect(invalid).toContain("https://youtube.com/x");
  });

  it("returns empty lists for blank input", () => {
    expect(parseManyUrls("   ")).toEqual({ valid: [], invalid: [] });
  });
});
