import { ImageResponse } from "next/og";

export const alt = "Sift - Save TikTok videos, sounds, and covers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0b08",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              backgroundColor: "rgba(205,243,90,0.14)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 7,
            }}
          >
            <div style={{ width: 34, height: 6, borderRadius: 3, backgroundColor: "#cdf35a" }} />
            <div style={{ width: 22, height: 6, borderRadius: 3, backgroundColor: "#cdf35a" }} />
            <div style={{ width: 12, height: 6, borderRadius: 3, backgroundColor: "#cdf35a" }} />
          </div>
          <div style={{ color: "#f2f4e9", fontSize: 40, fontWeight: 600, letterSpacing: -1 }}>
            Sift
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              color: "#f2f4e9",
              fontSize: 76,
              fontWeight: 600,
              letterSpacing: -2,
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Save TikTok videos clean and quick.
          </div>
          <div style={{ color: "#9aa084", fontSize: 32, maxWidth: 820 }}>
            Video without the watermark, the original sound, and the cover. No account, no fee.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["Clean MP4", "MP3 audio", "Cover JPG"].map((tag) => (
            <div
              key={tag}
              style={{
                color: "#cdf35a",
                border: "1px solid #262a1b",
                backgroundColor: "#111309",
                borderRadius: 999,
                padding: "12px 24px",
                fontSize: 24,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
