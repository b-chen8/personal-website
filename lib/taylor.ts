// The math behind the hero figure (components/TaylorExplorer.tsx) and the
// link-preview image (app/opengraph-image.tsx): sin x, its Taylor polynomials,
// and the SVG paths that draw them.

// x - x^3/3! + x^5/5! - ... up to the given (odd) degree.
export function taylorSin(x: number, degree: number) {
  let term = x;
  let sum = x;
  for (let k = 3; k <= degree; k += 2) {
    term *= (-x * x) / (k * (k - 1));
    sum += term;
  }
  return sum;
}

// The largest gap between sin x and its degree-n polynomial on [-a, a].
export function maxError(degree: number, a = Math.PI) {
  const steps = 2000;
  let max = 0;
  for (let i = 0; i <= steps; i++) {
    const x = -a + (i / steps) * 2 * a;
    max = Math.max(max, Math.abs(Math.sin(x) - taylorSin(x, degree)));
  }
  return max;
}

// A plot frame in SVG units. x runs from -xRange to xRange, y from -yRange
// (bottom) to yRange (top).
export type Frame = {
  width: number;
  height: number;
  xRange: number;
  yRange: number;
};

export function plotter({ width, height, xRange, yRange }: Frame) {
  const toX = (x: number) => ((x + xRange) / (2 * xRange)) * width;
  const toY = (y: number) => height / 2 - (y / yRange) * (height / 2);
  const fromX = (px: number) => (px / width) * 2 * xRange - xRange;

  // Every path uses the same sample points, so a path for one degree can
  // animate smoothly into the path for another.
  const steps = 240;
  const xs = Array.from(
    { length: steps + 1 },
    (_, i) => -xRange + (i / steps) * 2 * xRange,
  );
  // Polynomials shoot off to huge values; cap them just outside the frame.
  const limit = yRange * 1.2;
  const point = (x: number, y: number) =>
    `${toX(x).toFixed(1)} ${toY(Math.max(-limit, Math.min(limit, y))).toFixed(1)}`;

  return {
    toX,
    toY,
    // The x value at a horizontal position in the frame.
    fromX,
    // The curve y = f(x) across the frame.
    curve: (f: (x: number) => number) =>
      `M${xs.map((x) => point(x, f(x))).join("L")}`,
    // The closed region between y = f(x) and y = g(x).
    between: (f: (x: number) => number, g: (x: number) => number) =>
      `M${xs.map((x) => point(x, f(x))).join("L")}` +
      `L${[...xs].reverse().map((x) => point(x, g(x))).join("L")}Z`,
  };
}
