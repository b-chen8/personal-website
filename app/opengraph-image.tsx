import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/data/content";
import { plotter, taylorSin } from "@/lib/taylor";

// The image shown when the site's link is shared (LinkedIn, iMessage, Slack).
// Next.js runs this once at build time and serves the result as a PNG, so the
// name and tagline always match data/content.ts.
//
// Preview services shrink this image and recompress it as a JPEG, which blurs
// fine detail. So the text is large and medium-weight, the curves are thick,
// and the whole image is drawn at twice the standard 1200x630.

export const alt = `${profile.name}. ${profile.tagline}`;
export const size = { width: 2400, height: 1260 };
export const contentType = "image/png";

// Sizes below are written for a 1200x630 layout, then multiplied up.
const px = (n: number) => n * (size.width / 1200);

// The image renderer cannot use the site's web fonts or CSS variables, so the
// fonts are read from files and the dark theme's colors are repeated here.
// Keep the colors in sync with :root in app/globals.css.
const fontsDir = join(process.cwd(), "assets/fonts");
const [displayFont, bodyFont] = await Promise.all([
  readFile(join(fontsDir, "STIXTwoText-Regular.ttf")),
  readFile(join(fontsDir, "SchibstedGrotesk-Medium.ttf")),
]);

const colors = {
  bg: "#0b1e33",
  line: "#23415f",
  fg: "#edf2f7",
  muted: "#93a9c2",
  accent: "#ffb84d",
};

// The hero plot in miniature: sin x, the degree-7 polynomial the hero settles
// on, and the hatched error between them.
const WIDTH = 520;
const HEIGHT = 340;
const plot = plotter({ width: WIDTH, height: HEIGHT, xRange: 2 * Math.PI, yRange: 2.4 });
const polynomial = (x: number) => taylorSin(x, 7);

const PLOT_WIDTH = px(400);

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
          padding: `0 ${px(64)}px`,
          backgroundColor: colors.bg,
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", width: px(620) }}
        >
          <div
            style={{
              fontFamily: "STIX Two Text",
              fontSize: px(104),
              lineHeight: 1.05,
              letterSpacing: px(-2),
              color: colors.fg,
            }}
          >
            {profile.name}
          </div>
          <div
            style={{
              marginTop: px(26),
              fontFamily: "Schibsted Grotesk",
              fontWeight: 500,
              fontSize: px(37),
              lineHeight: 1.4,
              color: colors.muted,
              // Evens out the lines so no word is left alone on the last one.
              textWrap: "balance",
            }}
          >
            {profile.tagline}
          </div>
        </div>

        {/* No labels, which would be too small to read. Stroke widths are in
            the plot's own 520x340 units. */}
        <svg
          width={PLOT_WIDTH}
          height={Math.round((PLOT_WIDTH * HEIGHT) / WIDTH)}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          <line
            x1={0}
            y1={plot.toY(0)}
            x2={WIDTH}
            y2={plot.toY(0)}
            stroke={colors.line}
            strokeWidth={2}
          />
          <line
            x1={plot.toX(0)}
            y1={0}
            x2={plot.toX(0)}
            y2={HEIGHT}
            stroke={colors.line}
            strokeWidth={2}
          />
          <defs>
            <pattern
              id="hatch"
              width={12}
              height={12}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1={0} y1={0} x2={0} y2={12} stroke={colors.accent} strokeWidth={3} />
            </pattern>
          </defs>
          <path
            d={plot.between(Math.sin, polynomial)}
            fill={colors.accent}
            fillOpacity={0.08}
          />
          <path d={plot.between(Math.sin, polynomial)} fill="url(#hatch)" fillOpacity={0.7} />
          <path
            d={plot.curve(Math.sin)}
            fill="none"
            stroke={colors.fg}
            strokeWidth={6}
            strokeLinecap="round"
          />
          <path
            d={plot.curve(polynomial)}
            fill="none"
            stroke={colors.accent}
            strokeWidth={6}
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "STIX Two Text", data: displayFont, weight: 400, style: "normal" },
        { name: "Schibsted Grotesk", data: bodyFont, weight: 500, style: "normal" },
      ],
    },
  );
}
