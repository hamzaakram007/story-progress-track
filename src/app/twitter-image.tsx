import { ImageResponse } from "next/og";

export const alt = "Harbor Check — spoiler-safe progress tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(145deg, #061018 0%, #0a2a32 48%, #071821 100%)",
          color: "#e8f4f2",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#2ee6d6",
            fontWeight: 700,
            fontFamily: "sans-serif",
          }}
        >
          Harbor Check
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 72, lineHeight: 1.05, maxWidth: 900 }}>
            Spoiler-safe progress
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#8aa3a8",
              maxWidth: 820,
              fontFamily: "sans-serif",
              lineHeight: 1.35,
            }}
          >
            Local checklist PWA with masked tiers and spoiler-safe labels.
            Harbor Check by NeonGulf.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#f2c14e",
            fontFamily: "sans-serif",
          }}
        >
          <span>track.neongulf.com</span>
          <span>Installable · local-first</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
