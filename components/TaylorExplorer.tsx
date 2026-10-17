"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { maxError, plotter, taylorSin } from "@/lib/taylor";

// The hero figure: sin x and one of its Taylor polynomials, with the gap
// between them hatched. The slider picks the polynomial's degree. Right after
// the page loads, the degree climbs from 1 to START_DEGREE once, which shows
// what the slider does before anyone touches it. Moving a pointer across the
// plot traces both curves and reads out the error at that x.
//
// The page is rendered on the server at START_DEGREE, so the figure is complete
// without JavaScript. The draw-on and fade-in animations are in globals.css.

const WIDTH = 1000;
const HEIGHT = 280;
const Y_RANGE = 2.25;
const plot = plotter({
  width: WIDTH,
  height: HEIGHT,
  xRange: 2 * Math.PI,
  yRange: Y_RANGE,
});

const DEGREES = [1, 3, 5, 7, 9, 11, 13, 15];
const MIN_DEGREE = DEGREES[0];
const MAX_DEGREE = DEGREES[DEGREES.length - 1];
const START_DEGREE = 7;

// When each step of the intro happens, in ms after the page started loading.
// The polynomial fades in at 1.3 s (see --delay below), so the switch to
// degree 1 happens while it is still hidden.
const INTRO = [
  { degree: 1, at: 0 },
  { degree: 3, at: 2200 },
  { degree: 5, at: 2650 },
  { degree: 7, at: 3100 },
];
// If hydration finishes later than this, skip the intro: the polynomial would
// already be on screen, and jumping it back to degree 1 would look like a bug.
const INTRO_CUTOFF = 900;

const sinPath = plot.curve(Math.sin);
const figures = new Map(
  DEGREES.map((degree) => {
    const f = (x: number) => taylorSin(x, degree);
    return [
      degree,
      {
        curve: plot.curve(f),
        gap: plot.between(Math.sin, f),
        error: maxError(degree),
      },
    ];
  }),
);

// Grid lines every π/2 across and every 1 up, like graph paper.
const gridX = Array.from({ length: 9 }, (_, i) => ((i - 4) * Math.PI) / 2);
const gridY = [-2, -1, 1, 2];
const tickLabels = [
  { x: -Math.PI, text: "−π" },
  { x: Math.PI, text: "π" },
];

// 0.075 stays a decimal; 0.00045 becomes 4.5 × 10⁻⁴.
function scientific(value: number) {
  const exponent = Math.floor(Math.log10(value));
  return { mantissa: (value / 10 ** exponent).toFixed(1), exponent };
}

function ErrorValue({ value }: { value: number }) {
  // Below this the difference is floating-point noise, not the polynomial.
  if (value < 1e-12) {
    return (
      <>
        &lt; 10<sup>−12</sup>
      </>
    );
  }
  if (value >= 1e-3) return <>{value.toPrecision(2)}</>;
  const { mantissa, exponent } = scientific(value);
  return (
    <>
      {mantissa} × 10<sup>−{-exponent}</sup>
    </>
  );
}

function spokenError(value: number) {
  if (value >= 1e-3) return value.toPrecision(2);
  const { mantissa, exponent } = scientific(value);
  return `${mantissa} times 10 to the minus ${-exponent}`;
}

// x − x³/3! + x⁵/5! − …, typeset with stacked fractions. Each term carries its
// sign so a long polynomial wraps between terms, never inside one.
function Polynomial({ degree }: { degree: number }) {
  const terms = [];
  for (let k = 1; k <= degree; k += 2) {
    const sign = (k - 1) % 4 === 0 ? "+" : "−";
    terms.push(
      <span key={k} className="inline-flex items-center whitespace-nowrap">
        {k > 1 && <span className="px-[0.4em]">{sign}</span>}
        {k === 1 ? (
          <i>x</i>
        ) : (
          <span className="inline-flex flex-col items-center text-[0.7em] leading-[1.2]">
            <span className="border-b border-current px-[0.2em]">
              <i>x</i>
              <sup>{k}</sup>
            </span>
            <span>{k}!</span>
          </span>
        )}
      </span>,
    );
  }
  return <>{terms}</>;
}

// The pointer's crosshair: a dot on each curve at x, and the error between
// them drawn as a bar.
function Tracer({ x, degree }: { x: number; degree: number }) {
  const px = plot.toX(x);
  const value = taylorSin(x, degree);
  const onSin = plot.toY(Math.sin(x));
  // The polynomial can be far above or below the frame.
  const onPolynomial = plot.toY(Math.max(-Y_RANGE, Math.min(Y_RANGE, value)));
  return (
    <g className="pointer-events-none">
      <line
        x1={px}
        y1={0}
        x2={px}
        y2={HEIGHT}
        strokeWidth={1}
        strokeDasharray="3 5"
        vectorEffect="non-scaling-stroke"
        className="stroke-muted"
      />
      <line
        x1={px}
        y1={onSin}
        x2={px}
        y2={onPolynomial}
        strokeWidth={4}
        className="stroke-accent"
      />
      <circle cx={px} cy={onSin} r={6.5} strokeWidth={3} className="fill-fg stroke-bg" />
      {Math.abs(value) <= Y_RANGE && (
        <circle
          cx={px}
          cy={onPolynomial}
          r={6.5}
          strokeWidth={3}
          className="fill-accent stroke-bg"
        />
      )}
    </g>
  );
}

export default function TaylorExplorer() {
  const [degree, setDegree] = useState(START_DEGREE);
  const [trace, setTrace] = useState<{ x: number; left: number } | null>(null);
  const introTimers = useRef<number[]>([]);
  const figure = figures.get(degree)!;

  useEffect(() => {
    if (
      performance.now() > INTRO_CUTOFF ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timers = INTRO.map((step) =>
      window.setTimeout(
        () => setDegree(step.degree),
        Math.max(0, step.at - performance.now()),
      ),
    );
    introTimers.current = timers;
    return () => timers.forEach(clearTimeout);
  }, []);

  function choose(next: number) {
    // Someone is using the slider, so the intro gets out of the way.
    introTimers.current.forEach(clearTimeout);
    setDegree(next);
  }

  function follow(event: React.PointerEvent<SVGSVGElement>) {
    const svg = event.currentTarget;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    // The pointer in the SVG's own units, which accounts for the cropping on
    // phones.
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    // The readout sits above the pointer but stays inside the figure.
    const box = svg.getBoundingClientRect();
    const half = Math.min(110, box.width / 2);
    const left = Math.min(Math.max(event.clientX - box.left, half), box.width - half);
    setTrace({ x: plot.fromX(point.x), left });
  }

  const traceError = trace && Math.abs(Math.sin(trace.x) - taylorSin(trace.x, degree));

  return (
    <figure>
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-labelledby="taylor-title"
          onPointerMove={follow}
          onPointerDown={follow}
          onPointerLeave={() => setTrace(null)}
          onPointerCancel={() => setTrace(null)}
          // A sideways drag traces the curves on a touch screen; an up or
          // down drag still scrolls the page.
          style={{ touchAction: "pan-y" }}
          className="taylor-plot block h-40 w-full cursor-crosshair font-display sm:h-auto"
        >
          <title id="taylor-title">
            {`Plot of sin x and its Taylor polynomial of degree ${degree}. The largest gap between them on the interval from minus pi to pi is ${spokenError(figure.error)}.`}
          </title>

          <g className="stroke-line" strokeWidth={1} vectorEffect="non-scaling-stroke">
            {gridX.map((x) => (
              <line
                key={x}
                x1={plot.toX(x)}
                y1={0}
                x2={plot.toX(x)}
                y2={HEIGHT}
                strokeOpacity={x === 0 ? 1 : 0.45}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {gridY.map((y) => (
              <line
                key={y}
                x1={0}
                y1={plot.toY(y)}
                x2={WIDTH}
                y2={plot.toY(y)}
                strokeOpacity={0.45}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <line
              x1={0}
              y1={plot.toY(0)}
              x2={WIDTH}
              y2={plot.toY(0)}
              vectorEffect="non-scaling-stroke"
            />
          </g>
          {/* On phones the plot is cropped and drawn smaller, so its labels
              are set larger to stay readable. */}
          <g
            className="fill-muted text-[28px] sm:text-[17px]"
            fontStyle="italic"
            textAnchor="end"
          >
            {tickLabels.map(({ x, text }) => (
              <text
                key={text}
                x={plot.toX(x) - 6}
                y={plot.toY(0) + 5}
                dominantBaseline="hanging"
              >
                {text}
              </text>
            ))}
          </g>

          {/* The error: everything between sin x and the polynomial, tinted
              and hatched like a cut section on a technical drawing. */}
          <defs>
            <pattern
              id="taylor-hatch"
              width={9}
              height={9}
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1={0} y1={0} x2={0} y2={9} strokeWidth={2.5} className="stroke-accent" />
            </pattern>
          </defs>
          <path
            d={figure.gap}
            style={{ d: `path("${figure.gap}")`, "--delay": "1.3s" } as React.CSSProperties}
            className="taylor-shape plot-fade fill-accent"
            fillOpacity={0.07}
          />
          <path
            d={figure.gap}
            style={{ d: `path("${figure.gap}")`, "--delay": "1.3s" } as React.CSSProperties}
            fill="url(#taylor-hatch)"
            fillOpacity={0.55}
            className="taylor-shape plot-fade"
          />

          <path
            d={sinPath}
            pathLength={1}
            fill="none"
            strokeWidth={2.6}
            strokeLinecap="round"
            className="plot-line stroke-fg"
          />

          <path
            d={figure.curve}
            style={{ d: `path("${figure.curve}")`, "--delay": "1.3s" } as React.CSSProperties}
            fill="none"
            strokeWidth={2.6}
            strokeLinecap="round"
            className="taylor-shape plot-fade stroke-accent"
          />

          {trace && <Tracer x={trace.x} degree={degree} />}
        </svg>

        {trace && traceError !== null && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-3 flex -translate-x-1/2 items-baseline gap-3 whitespace-nowrap rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-muted shadow-lg shadow-black/15"
            style={{ left: trace.left }}
          >
            <span className="font-display text-base text-fg">
              <i>x</i> = {trace.x.toFixed(2).replace("-", "−")}
            </span>
            <span>
              error{" "}
              <span className="font-display text-base text-fg tabular-nums">
                <ErrorValue value={traceError} />
              </span>
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-x-12 gap-y-5 md:flex-row md:items-center md:justify-between">
        <p
          aria-hidden="true"
          className="flex min-h-[2.75rem] flex-wrap items-center gap-y-2 font-display text-[1.375rem] md:text-2xl"
        >
          <span className="whitespace-nowrap pr-[0.4em]">
            sin <i>x</i> ≈
          </span>
          <span className="contents text-accent">
            <Polynomial degree={degree} />
          </span>
        </p>

        <div className="flex shrink-0 items-center gap-4">
          <label htmlFor="taylor-degree" className="text-[15px] text-muted">
            Degree
          </label>
          <input
            id="taylor-degree"
            type="range"
            min={MIN_DEGREE}
            max={MAX_DEGREE}
            step={2}
            value={degree}
            onChange={(event) => choose(Number(event.target.value))}
            aria-valuetext={`Degree ${degree}, largest error ${spokenError(figure.error)}`}
            className="degree-slider w-44"
            style={
              {
                "--fill": `${((degree - MIN_DEGREE) / (MAX_DEGREE - MIN_DEGREE)) * 100}%`,
              } as React.CSSProperties
            }
          />
          <output
            htmlFor="taylor-degree"
            className="w-7 font-display text-2xl tabular-nums"
          >
            {degree}
          </output>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-x-12 gap-y-2 text-[15px] text-muted md:flex-row md:justify-between">
        <figcaption className="max-w-[52ch]">
          I was a Calculus II TA in fall 2025, so here is a Taylor series. Drag
          the slider to add terms and watch the hatched error shrink, or point
          at the plot to read the error at any x.
        </figcaption>
        <p className="flex shrink-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-block h-3.5 w-3.5 rounded-[3px] border border-accent/60 bg-[repeating-linear-gradient(-45deg,var(--accent)_0_1.5px,transparent_1.5px_4.5px)]"
          />
          <span>
            Largest error on [−π, π]:{" "}
            <span className="font-display text-lg text-fg tabular-nums">
              <ErrorValue value={figure.error} />
            </span>
          </span>
        </p>
      </div>
    </figure>
  );
}
