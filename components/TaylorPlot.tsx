// The hero figure: sin x and its Taylor polynomials of degree 1 to 9.
// Everything is computed here on the server and sent as plain SVG, so it
// costs no client-side JavaScript. The draw-on animation is in globals.css.
//
// The geometry below is exported so app/opengraph-image.tsx can draw the same
// curves in the link-preview image.

export const WIDTH = 520;
export const HEIGHT = 340;
const X_RANGE = 2 * Math.PI; // the plot runs from -2π to 2π
const Y_RANGE = 2.4;
export const DEGREES = [1, 3, 5, 7, 9];

export const toX = (x: number) => ((x + X_RANGE) / (2 * X_RANGE)) * WIDTH;
export const toY = (y: number) => HEIGHT / 2 - (y / Y_RANGE) * (HEIGHT / 2);

// x - x^3/3! + x^5/5! - ... up to the given degree.
export function taylorSin(x: number, degree: number) {
  let term = x;
  let sum = x;
  for (let k = 3; k <= degree; k += 2) {
    term *= (-x * x) / (k * (k - 1));
    sum += term;
  }
  return sum;
}

export function curvePath(f: (x: number) => number) {
  const steps = 200;
  // Polynomials shoot off to huge values; cap them just outside the frame.
  const limit = Y_RANGE * 1.2;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const x = -X_RANGE + (i / steps) * 2 * X_RANGE;
    const y = Math.max(-limit, Math.min(limit, f(x)));
    return `${toX(x).toFixed(1)} ${toY(y).toFixed(1)}`;
  });
  return `M${points.join("L")}`;
}

// Where a polynomial leaves the frame on the right, so its label can sit there.
function exitPoint(degree: number) {
  for (let x = 0; x <= X_RANGE; x += 0.01) {
    const y = taylorSin(x, degree);
    if (Math.abs(y) >= Y_RANGE) return { x, top: y > 0 };
  }
  return { x: X_RANGE, top: true };
}

export default function TaylorPlot() {
  return (
    <figure>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-labelledby="plot-title"
        className="h-auto w-full font-display"
      >
        <title id="plot-title">
          Plot of sin x with its Taylor polynomials of degree 1, 3, 5, 7 and 9.
          Each higher degree follows the sine curve further from the origin.
        </title>

        {/* Axes, with ticks at -π and π */}
        <g className="stroke-line" strokeWidth={1}>
          <line x1={0} y1={toY(0)} x2={WIDTH} y2={toY(0)} />
          <line x1={toX(0)} y1={0} x2={toX(0)} y2={HEIGHT} />
          {[-Math.PI, Math.PI].map((x) => (
            <line key={x} x1={toX(x)} y1={toY(0) - 4} x2={toX(x)} y2={toY(0) + 4} />
          ))}
        </g>
        <g className="fill-muted" fontSize={17} fontStyle="italic" textAnchor="end">
          <text x={toX(-Math.PI) - 6} y={toY(0) + 20}>
            −π
          </text>
          <text x={toX(Math.PI) - 6} y={toY(0) + 20}>
            π
          </text>
        </g>

        {/* Taylor polynomials, slightly fainter for lower degrees. The opacity
            floor of 0.7 keeps every curve at 3:1 contrast in both themes. */}
        {DEGREES.map((degree, i) => {
          const exit = exitPoint(degree);
          return (
            <g key={degree}>
              <path
                d={curvePath((x) => taylorSin(x, degree))}
                pathLength={1}
                fill="none"
                strokeWidth={1.5}
                strokeOpacity={0.7 + i * 0.075}
                className="plot-line stroke-muted"
                style={{ "--delay": `${0.9 + i * 0.35}s` } as React.CSSProperties}
              />
              <text
                x={toX(exit.x) + 5}
                y={exit.top ? 16 : HEIGHT - 7}
                fontSize={17}
                className="fill-muted"
              >
                <tspan fontStyle="italic">T</tspan>
                <tspan fontSize={12} dy={3}>
                  {degree}
                </tspan>
              </text>
            </g>
          );
        })}

        {/* sin x itself */}
        <path
          d={curvePath(Math.sin)}
          pathLength={1}
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="plot-line stroke-accent"
        />
        <text
          x={toX(-1.5 * Math.PI)}
          y={toY(1) - 12}
          fontSize={18}
          textAnchor="middle"
          className="fill-accent"
        >
          sin <tspan fontStyle="italic">x</tspan>
        </text>
      </svg>
      <figcaption className="mt-3 text-sm text-muted">
        sin <i className="font-display">x</i> and its Taylor polynomials, degree
        1 through 9.
      </figcaption>
    </figure>
  );
}
