"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { arms, fourier } from "@/lib/fourier";
import { initials } from "@/lib/initials";

// The bookend to the Taylor series at the top of the page: a Fourier series
// drawing my initials. Each circle spins at a whole-number speed, each arm is
// fixed to the end of the one before, and the tip of the last arm traces the
// letters (the outlines come from lib/initials.ts). The slider sets how many
// circles are used. The animation runs only while the drawing is on screen,
// and not at all when reduced motion is requested.

const COUNTS = [4, 8, 16, 32, 64, 128, 256];
const START = 5;
// One trip around the letters, and how much of it the bright tail covers.
const CYCLE_MS = 14000;
const TAIL = 0.16;

const SAMPLES = initials.points.length / 2;
const VIEW = { x: -212, y: -132, width: 424, height: 264 };

// Every speed up to ±128 is 256 spinning circles. Speed 0 doesn't spin: it is
// the drawing's center, where the first arm starts.
const all = fourier(initials.points, COUNTS[COUNTS.length - 1] / 2);
const still = all.find((circle) => circle.speed === 0)!;
const spinning = all.filter((circle) => circle.speed !== 0);

const penUp = new Uint8Array(SAMPLES);
for (const [first, last] of initials.penUp) penUp.fill(1, first, last + 1);

// The curve the circles trace, as a path from sample `from` to sample `to`,
// lifting the pen over the jumps between letters' outlines.
function stroke(curve: [number, number][], from: number, to: number) {
  let d = "";
  let down = false;
  for (let i = from; i <= to; i++) {
    const j = ((i % SAMPLES) + SAMPLES) % SAMPLES;
    if (penUp[j]) {
      down = false;
      continue;
    }
    const [x, y] = curve[j];
    d += `${down ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    down = true;
  }
  return d;
}

// Each circle, around its center (where the arm before it ends). Circles too
// small to see are left out.
function circlesPath(circles: { radius: number }[], centers: [number, number][]) {
  let d = "";
  circles.forEach(({ radius }, i) => {
    if (radius < 0.4) return;
    const [x, y] = centers[i];
    const r = radius.toFixed(1);
    d += `M${(x + radius).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${-2 * radius} 0a${r} ${r} 0 1 0 ${2 * radius} 0`;
  });
  return d;
}

function armsPath(joints: [number, number][]) {
  return joints.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
}

// The drawing is left out of the server's HTML. Its points come from sums of
// sines and cosines, which Node and the browser can round differently in the
// last digits, and React would flag that as a hydration mismatch. This is
// false on the server and while hydrating, then true.
const subscribeNever = () => () => {};
function useInBrowser() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

export default function FourierInitials() {
  const inBrowser = useInBrowser();
  const [step, setStep] = useState(START);
  const count = COUNTS[step];
  const figure = useRef<SVGSVGElement>(null);
  const circlesRef = useRef<SVGPathElement>(null);
  const armsRef = useRef<SVGPathElement>(null);
  const tailRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  // Where in the cycle the drawing is, kept across slider changes.
  const phase = useRef(0);

  const { terms, curve, outline } = useMemo(() => {
    const terms = [still, ...spinning.slice(0, count)];
    const curve = Array.from(
      { length: SAMPLES },
      (_, j) => arms(terms, j / SAMPLES).at(-1)!,
    );
    return { terms, curve, outline: stroke(curve, 0, SAMPLES - 1) };
  }, [count]);

  // The arms as they stand at the start, which is also the whole picture
  // when the animation doesn't run.
  const resting = inBrowser ? arms(terms, 0) : [];

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let started = 0;

    const draw = (now: number) => {
      const t = ((now - started) / CYCLE_MS) % 1;
      phase.current = t;
      const joints = arms(terms, t);
      const [x, y] = joints[joints.length - 1];
      circlesRef.current?.setAttribute("d", circlesPath(terms.slice(1), joints.slice(1)));
      armsRef.current?.setAttribute("d", armsPath(joints.slice(1)));
      tipRef.current?.setAttribute("cx", x.toFixed(1));
      tipRef.current?.setAttribute("cy", y.toFixed(1));
      const head = Math.floor(t * SAMPLES);
      tailRef.current?.setAttribute("d", stroke(curve, head - Math.floor(TAIL * SAMPLES), head));
      frame = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !frame) {
        started = performance.now() - phase.current * CYCLE_MS;
        frame = requestAnimationFrame(draw);
      } else if (!entry.isIntersecting && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    if (figure.current) observer.observe(figure.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [terms, curve]);


  return (
    <figure>
      <svg
        ref={figure}
        viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
        role="img"
        aria-label={`My initials, B C, drawn by a Fourier series of ${count} spinning circles.`}
        className="block h-auto w-full"
      >
        {/* A faint guide under the moving pen; with motion off, the finished drawing. */}
        <path
          d={inBrowser ? outline : ""}
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          className="stroke-fg opacity-25 motion-reduce:stroke-accent motion-reduce:opacity-100"
        />
        <path
          ref={circlesRef}
          d={inBrowser ? circlesPath(terms.slice(1), resting.slice(1)) : ""}
          fill="none"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          className="stroke-muted opacity-40"
        />
        <path
          ref={armsRef}
          d={inBrowser ? armsPath(resting.slice(1)) : ""}
          fill="none"
          strokeWidth={1.25}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-muted"
        />
        <path
          ref={tailRef}
          d=""
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-accent"
        />
        {inBrowser && (
          <circle
            ref={tipRef}
            cx={resting[resting.length - 1][0].toFixed(1)}
            cy={resting[resting.length - 1][1].toFixed(1)}
            r={4}
            className="fill-accent"
          />
        )}
      </svg>

      <div className="mt-4 flex items-center gap-4">
        <label htmlFor="fourier-circles" className="text-[15px] text-muted">
          Circles
        </label>
        <input
          id="fourier-circles"
          type="range"
          min={0}
          max={COUNTS.length - 1}
          step={1}
          value={step}
          onChange={(event) => setStep(Number(event.target.value))}
          aria-valuetext={`${count} circles`}
          className="degree-slider w-40"
          style={{ "--fill": `${(step / (COUNTS.length - 1)) * 100}%` } as React.CSSProperties}
        />
        <output htmlFor="fourier-circles" className="w-10 font-display text-2xl tabular-nums">
          {count}
        </output>
      </div>
      <figcaption className="mt-3 text-[15px] leading-relaxed text-muted">
        The page opened with a Taylor series, so it closes with a Fourier
        series: circles spinning at whole-number speeds, chained arm to arm,
        trace my initials. Fewer circles, rougher letters.
      </figcaption>
    </figure>
  );
}
