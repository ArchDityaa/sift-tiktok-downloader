import { describe, it, expect } from "vitest";
import { parseTikTokUrl, isTikTokUrl, extractVideoId } from "@/lib/tiktok/url";

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
