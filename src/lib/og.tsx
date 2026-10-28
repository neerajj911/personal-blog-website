import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const ogSize = { width: 1200, height: 630 };

/**
 * Social preview card: the design's light palette (paper, ink, rust, link blue) with the title.
 * ImageResponse cannot read the CSS variables, so the hex values are repeated from globals.css.
 */
export function renderOgImage({ title, kicker }: { title: string; kicker: string }) {
  const clipped = title.length > 110 ? `${title.slice(0, 107).trimEnd()}…` : title;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#FBFAF7",
        color: "#14181F",
        padding: "72px",
        borderTop: "16px solid #2B4C9B",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 26,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: "#B5532A",
        }}
      >
        {kicker}
      </div>
      <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>
        {clipped}
      </div>
      <div style={{ display: "flex", fontSize: 30, color: "#586070" }}>
        [ {site.domain} ]
      </div>
    </div>,
    ogSize,
  );
}
