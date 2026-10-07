import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  DEGREES,
  HEIGHT,
  WIDTH,
  curvePath,
  taylorSin,
  toX,
  toY,
} from "@/components/TaylorPlot";
import { profile } from "@/data/content";

// The image shown when the site's link is shared (LinkedIn, iMessage, Slack).
// Next.js runs this once at build time and serves the result as a PNG, so the
// name and tagline always match data/content.ts.

export const alt = `${profile.name}. ${profile.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The image renderer cannot use the site's web fonts or CSS variables, so the
// fonts are read from files and the dark theme's colors are repeated here.
// Keep the colors in sync with :root in app/globals.css.
const fontsDir = join(process.cwd(), "assets/fonts");
const [displayFont, bodyFont] = await Promise.all([
  readFile(join(fontsDir, "STIXTwoText-Regular.ttf")),
  readFile(join(fontsDir, "SchibstedGrotesk-Regular.ttf")),
]);

const colors = {
  bg: "#131c1f",
  line: "#2d3d42",
  fg: "#e8edea",
  muted: "#9db0ae",
  accent: "#f2c866",
};

const PLOT_WIDTH = 440;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 72px",
          backgroundColor: colors.bg,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 560 }}>
          <div
            style={{
              fontFamily: "STIX Two Text",
              fontSize: 92,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: colors.fg,
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              marginTop: 28,
              fontFamily: "Schibsted Grotesk",
              fontSize: 30,
              lineHeight: 1.45,
              color: colors.muted,
              // Evens out the lines so no word is left alone on the last one.
              textWrap: "balance",
            }}
          >
            {profile.tagline}
          </div>
        </div>

        {/* The hero plot without its labels, which would be too small to read. */}
        <svg
          width={PLOT_WIDTH}
          height={Math.round((PLOT_WIDTH * HEIGHT) / WIDTH)}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          <line
            x1={0}
            y1={toY(0)}
            x2={WIDTH}
            y2={toY(0)}
            stroke={colors.line}
            strokeWidth={1.5}
          />
          <line
            x1={toX(0)}
            y1={0}
            x2={toX(0)}
            y2={HEIGHT}
            stroke={colors.line}
            strokeWidth={1.5}
          />
          {DEGREES.map((degree, i) => (
            <path
              key={degree}
              d={curvePath((x) => taylorSin(x, degree))}
              fill="none"
              stroke={colors.muted}
              strokeWidth={2}
              strokeOpacity={0.7 + i * 0.075}
            />
          ))}
          <path
            d={curvePath(Math.sin)}
            fill="none"
            stroke={colors.accent}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "STIX Two Text", data: displayFont, weight: 400, style: "normal" },
        { name: "Schibsted Grotesk", data: bodyFont, weight: 400, style: "normal" },
      ],
    },
  );
}
