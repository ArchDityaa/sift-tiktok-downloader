"use client";

import { useEffect } from "react";
import { WarningCircle } from "@/components/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the digest so it can be matched against server logs.
    console.error("Unhandled error", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            background: "#0a0b08",
            color: "#f2f4e9",
            textAlign: "center",
          }}
        >
          <span style={{ color: "#cdf35a" }}>
            <WarningCircle size={32} weight="fill" />
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>
            Something broke on our side.
          </h1>
          <p style={{ color: "#9aa084", maxWidth: 420 }}>
            The page failed to load. Try again, and if it keeps happening come
            back in a little while.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 8,
              background: "#cdf35a",
              color: "#12140b",
              border: "none",
              borderRadius: 12,
              padding: "12px 22px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
