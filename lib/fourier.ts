// The math behind the Fourier drawing in the Contact section
// (components/FourierInitials.tsx): a closed curve, written as a sum of
// circles that each spin at a whole-number speed.

export type Circle = { speed: number; radius: number; phase: number };

// The discrete Fourier transform of a closed curve, given as alternating x
// and y values. Each point is treated as the complex number x + iy; the
// result has one circle for every speed from -limit to limit, biggest first.
export function fourier(points: number[], limit: number): Circle[] {
  const n = points.length / 2;
  const circles: Circle[] = [];
  for (let speed = -limit; speed <= limit; speed++) {
    let re = 0;
    let im = 0;
    for (let j = 0; j < n; j++) {
      const angle = (-2 * Math.PI * speed * j) / n;
      const x = points[2 * j];
      const y = points[2 * j + 1];
      re += x * Math.cos(angle) - y * Math.sin(angle);
      im += x * Math.sin(angle) + y * Math.cos(angle);
    }
    circles.push({ speed, radius: Math.hypot(re, im) / n, phase: Math.atan2(im, re) });
  }
  return circles.sort((a, b) => b.radius - a.radius);
}

// Where the circles' arms point at time t (0 to 1 for one full cycle): the
// center of each circle in turn, then the tip of the last arm.
export function arms(circles: Circle[], t: number): [number, number][] {
  let x = 0;
  let y = 0;
  const joints: [number, number][] = [[x, y]];
  for (const { speed, radius, phase } of circles) {
    const angle = 2 * Math.PI * speed * t + phase;
    x += radius * Math.cos(angle);
    y += radius * Math.sin(angle);
    joints.push([x, y]);
  }
  return joints;
}
