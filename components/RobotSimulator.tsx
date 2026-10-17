"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { primaryButton, secondaryButton } from "./buttons";

// A playable version of Combat Toy. The robot's Arduino sketch
// (github.com/b-chen8/combat-robot) is ported in `sketch` below function for
// function: loop() takes a left step and a right step, then pings the
// ultrasonic sensor; within 18 cm it asks the PIXY Cam what it sees and swings
// its sword at red or reports a friend for green. The servo angles, delays and
// LCD cursor positions are the sketch's own. `hardware` stands in for the
// servos, sensors and LCD, and turns each call into something on screen.
//
// The project's diagram is passed in as `diagram`, and its boxes light up as
// the code reaches each stage (ids from Combat Toy's flow in data/content.ts).

// The sketch's timing, played this many times faster.
const SPEED = 2;
// Not measured on the real robot: how far one step carries it, and how far
// away the camera can make out the block. Chosen so a run takes seconds.
const STEP_CM = 4;
const CAMERA_RANGE_CM = 40;
// How long each stage stays lit in the diagram. The real robot gets through
// them in milliseconds.
const STAGE_PAUSE_MS = 650;

// The block's limits, in centimeters along the floor.
const START_CM = 46;
const MAX_CM = 105;
const GAP_CM = 3;

// Drawing: x = X0 + cm * PX, with the floor at y = FLOOR.
const X0 = 150;
const PX = 7;
const FLOOR = 172;
const BLOCK = 40;

const COLORS = { red: "#e5484d", green: "#2f9e68" };
type Color = keyof typeof COLORS;

type Servos = { hipL: number; kneeL: number; hipR: number; kneeR: number; arm: number };
const REST: Servos = { hipL: 90, kneeL: 90, hipR: 90, kneeR: 90, arm: 90 };

type Stage = "sonar" | "pixy" | "enemy" | "friend" | null;
const LIT: Record<Exclude<Stage, null>, string[]> = {
  sonar: ["sonar"],
  pixy: ["sonar>pixy", "pixy"],
  enemy: ["pixy>enemy", "enemy"],
  friend: ["pixy>friend", "friend"],
};

const BLANK = " ".repeat(16);

// Phones show about half the floor, and the view follows the robot like a
// side-scroller, so the drawing stays big enough to read. The block is kept
// within the view there.
const NARROW = "(max-width: 639px)";
const NARROW_VIEW = 600;
// How much of the floor behind the robot stays in view, room for the buzzer.
const NARROW_BEHIND = 160;
const NARROW_REACH_CM = 52;

function subscribeNarrow(onChange: () => void) {
  const query = matchMedia(NARROW);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

type Hardware = {
  delay(ms: number): Promise<void>;
  write(servo: keyof Servos, angle: number): void;
  setCursor(col: number, row: number): void;
  print(text: string): void;
  clear(): void;
  tone(hz: number): void;
  pulseIn(): Promise<number>;
  getBlocks(): { signature: number }[];
  // Not in the sketch: these let the page show what the code is doing.
  calling(name: string): void;
  stage(stage: Stage): Promise<void>;
};

// The Arduino sketch. Comments mark the only places it differs.
async function sketch(hw: Hardware) {
  const { delay } = hw;

  // Returns a long in C, so the result is truncated.
  const microsecondsToCentimeters = (microseconds: number) =>
    Math.trunc(microseconds / 29.0 / 2.0);

  async function takestepL() {
    hw.calling("takestepL()");
    hw.write("hipL", 130);
    await delay(200);
    hw.write("kneeL", 113);
    await delay(400);
    hw.write("hipL", 30);
    await delay(400);
    hw.write("hipL", 90);
    hw.write("kneeL", 90);
  }

  async function takestepR() {
    hw.calling("takestepR()");
    hw.write("hipR", 50);
    await delay(200);
    hw.write("kneeR", 70);
    await delay(400);
    hw.write("hipR", 150);
    await delay(400);
    hw.write("hipR", 90);
    hw.write("kneeR", 90);
  }

  async function checkobstacle() {
    hw.calling("checkobstacle()");
    await hw.stage("pixy");
    let blocks = hw.getBlocks();
    for (let i = 0; i < blocks.length; i++) {
      // Red
      while (blocks[i]?.signature === 1) {
        blocks = hw.getBlocks();
        await hw.stage("enemy");
        hw.setCursor(11, 1);
        hw.print("ENEMY");
        hw.tone(2000);
        hw.write("arm", 0);
        await delay(300);
        hw.write("arm", 90);
        await delay(300);
      }
      // Green
      while (blocks[i]?.signature === 2) {
        blocks = hw.getBlocks();
        await hw.stage("friend");
        hw.setCursor(10, 1);
        hw.print("FRIEND");
        await delay(1000);
      }
    }
  }

  async function checkdistance() {
    hw.calling("checkdistance()");
    let distance = microsecondsToCentimeters(await hw.pulseIn());
    while (distance <= 18) {
      await hw.stage("sonar");
      hw.clear();
      hw.setCursor(11, 0);
      hw.print("FOUND");
      await checkobstacle();
      hw.calling("checkdistance()");
      distance = microsecondsToCentimeters(await hw.pulseIn());
    }
    await hw.stage(null);
  }

  async function loop() {
    hw.calling("loop()");
    hw.setCursor(7, 0);
    hw.print("SEARCHING");
    await takestepL();
    hw.calling("loop()");
    await delay(1000);
    await takestepR();
    await checkdistance();
    hw.clear();
    hw.tone(0); // noTone(buzzer)
  }

  for (;;) await loop();
}

// A pause that ends early, with an error, when the run is reset.
function sleeper(signal: AbortSignal) {
  return (ms: number) =>
    new Promise<void>((resolve, reject) => {
      if (signal.aborted) return reject(signal.reason);
      const onAbort = () => {
        clearTimeout(timer);
        reject(signal.reason);
      };
      const timer = setTimeout(() => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      }, ms);
      signal.addEventListener("abort", onAbort, { once: true });
    });
}

// Servo angles become joint angles. 90 is straight; the right leg's servos
// are mounted mirrored. The drawing swings at a bit over half the real angle
// so a stick figure still looks like it is walking.
const SWING = 0.6;

function joint(x: number, y: number, degrees: number): React.CSSProperties {
  return {
    transform: `rotate(${degrees}deg)`,
    transformOrigin: `${x}px ${y}px`,
    transformBox: "view-box",
  };
}

function Leg({
  x,
  forward,
  bend,
  far,
}: {
  x: number;
  forward: number;
  bend: number;
  far?: boolean;
}) {
  const stroke = far ? "stroke-muted" : "stroke-fg";
  return (
    <g className="robot-joint" style={joint(x, -54, -forward * SWING)}>
      <line x1={x} y1={-54} x2={x} y2={-30} strokeWidth={7} strokeLinecap="round" className={stroke} />
      <g className="robot-joint" style={joint(x, -30, bend * SWING)}>
        <line x1={x} y1={-30} x2={x} y2={-8} strokeWidth={6} strokeLinecap="round" className={stroke} />
        <line x1={x - 6} y1={-3} x2={x + 13} y2={-3} strokeWidth={5} strokeLinecap="round" className={stroke} />
        <circle cx={x} cy={-30} r={3.5} strokeWidth={2} className={`fill-bg ${stroke}`} />
      </g>
      <circle cx={x} cy={-54} r={4} strokeWidth={2} className={`fill-bg ${stroke}`} />
    </g>
  );
}

// The robot's 16x2 character LCD.
function Lcd({ rows }: { rows: string[] }) {
  return (
    <div className="inline-grid grid-cols-[repeat(16,auto)] gap-[2px] rounded-md bg-[#1c3fae] p-2 font-mono text-[15px] leading-none text-[#e9f0ff] shadow-[inset_0_0_0_3px_rgb(0_0_0/0.25)]">
      {rows
        .join("")
        .split("")
        .map((char, i) => (
          <span
            key={i}
            className="grid h-[1.4em] w-[0.9em] place-items-center rounded-[1px] bg-white/[0.07]"
          >
            {char}
          </span>
        ))}
    </div>
  );
}

export default function RobotSimulator({
  diagram,
  tag,
}: {
  diagram: React.ReactNode;
  // Its label in blueprint view (Source.tsx), from the server parent.
  tag?: React.ReactNode;
}) {
  const [servos, setServos] = useState(REST);
  const [robotCm, setRobotCm] = useState(0);
  const [blockCm, setBlockCm] = useState(START_CM);
  const [color, setColor] = useState<Color>("red");
  const [lcd, setLcd] = useState([BLANK, BLANK]);
  const [running, setRunning] = useState(false);
  const [calling, setCalling] = useState<string | null>(null);
  const [ping, setPing] = useState<{ count: number; microseconds: number } | null>(null);
  const [buzzing, setBuzzing] = useState(false);
  const [stage, setStage] = useState<Stage>(null);
  const [announcement, setAnnouncement] = useState("");

  // What the running sketch reads. Kept beside the state because the sketch
  // runs outside React's render cycle, and the block can move mid-run.
  const world = useRef({ robotCm: 0, blockCm: START_CM, color: "red" as Color });
  const run = useRef<AbortController | null>(null);
  const grab = useRef(0);
  const scope = useRef<HTMLDivElement>(null);
  const narrow = useSyncExternalStore(
    subscribeNarrow,
    () => matchMedia(NARROW).matches,
    () => false,
  );

  // Light up the diagram's boxes and arrows for the current stage.
  useEffect(() => {
    const lit = stage ? LIT[stage] : [];
    scope.current
      ?.querySelectorAll<HTMLElement>("[data-flow-node], [data-flow-edge]")
      .forEach((element) => {
        const id = element.dataset.flowNode ?? element.dataset.flowEdge ?? "";
        element.toggleAttribute("data-active", lit.includes(id));
      });
  }, [stage]);

  useEffect(() => () => run.current?.abort(), []);

  function hardware(signal: AbortSignal): Hardware {
    const sleep = sleeper(signal);
    const cursor = { col: 0, row: 0 };
    let current: Stage = null;
    // After a reset, any call still on its way through does nothing.
    const live =
      <A extends unknown[]>(fn: (...args: A) => void) =>
      (...args: A) => {
        if (!signal.aborted) fn(...args);
      };

    return {
      delay: (ms) => sleep(ms / SPEED),
      write: live((servo, angle) => {
        setServos((s) => ({ ...s, [servo]: angle }));
        // The hip swinging back with the foot planted is the push that moves
        // the robot forward. It stops short of the block.
        if ((servo === "hipL" && angle === 30) || (servo === "hipR" && angle === 150)) {
          const w = world.current;
          w.robotCm = Math.max(w.robotCm, Math.min(w.robotCm + STEP_CM, w.blockCm - GAP_CM));
          setRobotCm(w.robotCm);
        }
      }),
      setCursor: live((col, row) => {
        cursor.col = col;
        cursor.row = row;
      }),
      print: live((text) => {
        const { col, row } = cursor;
        cursor.col += text.length;
        setLcd((rows) => {
          const next = [...rows];
          next[row] = (next[row].slice(0, col) + text + next[row].slice(col + text.length)).slice(0, 16);
          return next;
        });
      }),
      clear: live(() => setLcd([BLANK, BLANK])),
      tone: live((hz) => setBuzzing(hz > 0)),
      // timingmethod(): the echo time for the distance to the block. An
      // HC-SR04 is good for about one reading every 60 ms.
      pulseIn: async () => {
        const w = world.current;
        const microseconds = Math.round((w.blockCm - w.robotCm) * 58);
        if (!signal.aborted) {
          setPing((p) => ({ count: (p?.count ?? 0) + 1, microseconds }));
        }
        await sleep(60 / SPEED);
        return microseconds;
      },
      getBlocks: () => {
        const w = world.current;
        if (w.blockCm - w.robotCm > CAMERA_RANGE_CM) return [];
        return [{ signature: w.color === "red" ? 1 : 2 }];
      },
      calling: live((name) => setCalling(name)),
      stage: async (next) => {
        if (next === current || signal.aborted) return;
        current = next;
        setStage(next);
        const w = world.current;
        const cm = w.blockCm - w.robotCm;
        if (next === "sonar") setAnnouncement(`Sonar reads ${cm} centimeters. Object found.`);
        if (next === "enemy") setAnnouncement("The camera sees red: enemy. Swinging the sword.");
        if (next === "friend") setAnnouncement("The camera sees green: friend.");
        if (next === null) setAnnouncement("The object is gone. Searching again.");
        if (next) await sleep(STAGE_PAUSE_MS);
      },
    };
  }

  function start() {
    const controller = new AbortController();
    run.current = controller;
    setRunning(true);
    setAnnouncement("The robot is walking and searching.");
    // A reset rejects the pending delay, which ends the sketch.
    sketch(hardware(controller.signal)).catch(() => {});
  }

  function reset() {
    run.current?.abort();
    world.current.robotCm = 0;
    setRobotCm(0);
    setServos(REST);
    setLcd([BLANK, BLANK]);
    setCalling(null);
    setPing(null);
    setBuzzing(false);
    setStage(null);
    setRunning(false);
    setAnnouncement("Reset.");
  }

  function moveBlock(cm: number) {
    const w = world.current;
    const max = narrow ? Math.min(MAX_CM, w.robotCm + NARROW_REACH_CM) : MAX_CM;
    w.blockCm = Math.round(Math.min(max, Math.max(w.robotCm + GAP_CM, cm)));
    setBlockCm(w.blockCm);
  }

  function pointerCm(event: React.PointerEvent<SVGGElement>) {
    // The block's own matrix includes the phone view's pan.
    const matrix = event.currentTarget.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return (point.x - X0) / PX;
  }

  function pickColor(next: Color) {
    world.current.color = next;
    setColor(next);
  }

  const distance = blockCm - robotCm;
  const viewWidth = narrow ? NARROW_VIEW : 1000;
  const robotX = X0 + robotCm * PX;
  const blockX = X0 + blockCm * PX;
  const watching = stage !== null && stage !== "sonar";
  const sonarCm = ping && Math.trunc(ping.microseconds / 29 / 2);

  return (
    <div ref={scope}>
      {diagram}

      <div className="relative mt-4 rounded-lg border border-line bg-surface p-4 sm:p-5 lg:p-6">
        {tag}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <h4 className="font-medium">Run the robot</h4>
          <p className="text-sm text-muted">
            Its Arduino code, ported line for line to TypeScript, at 2× speed
          </p>
        </div>

        <svg
          viewBox={`0 0 ${viewWidth} 222`}
          role="group"
          aria-label="The robot and the block on the floor"
          className="mt-3 block h-auto w-full select-none font-display"
        >
          <g
            className="robot-body"
            style={{
              transform: `translateX(${-Math.max(0, Math.min(robotX - NARROW_BEHIND, 1000 - viewWidth))}px)`,
            }}
          >
            {/* Floor, with a tick every 10 cm */}
            <line x1={20} y1={FLOOR} x2={980} y2={FLOOR} strokeWidth={2} className="stroke-line" />
            {Array.from({ length: 12 }, (_, i) => (
              <line
                key={i}
                x1={X0 + i * 10 * PX}
                y1={FLOOR}
                x2={X0 + i * 10 * PX}
                y2={FLOOR + 7}
                strokeWidth={1.5}
                className="stroke-line"
              />
            ))}

            {/* Dimension line from the sensor to the block */}
            <g className="stroke-muted fill-muted" strokeWidth={1.25}>
              <line x1={robotX} y1={FLOOR + 14} x2={robotX} y2={FLOOR + 32} />
              <line x1={blockX} y1={FLOOR + 14} x2={blockX} y2={FLOOR + 32} />
              <line x1={robotX + 2} y1={FLOOR + 24} x2={blockX - 2} y2={FLOOR + 24} />
              <path d={`M${robotX} ${FLOOR + 24}l8 -4v8z`} stroke="none" />
              <path d={`M${blockX} ${FLOOR + 24}l-8 -4v8z`} stroke="none" />
              <text
                x={(robotX + blockX) / 2}
                y={FLOOR + 47}
                textAnchor="middle"
                stroke="none"
                className="text-[24px] sm:text-[19px]"
              >
                {distance} cm
              </text>
            </g>

            {/* What the camera sees while it is checking the block */}
            {watching && (
              <path
                d={`M${robotX - 62} ${FLOOR - 108}L${blockX} ${FLOOR - BLOCK - 6}L${blockX} ${FLOOR}Z`}
                fill={COLORS[color]}
                fillOpacity={0.12}
                stroke={COLORS[color]}
                strokeOpacity={0.5}
                strokeDasharray="4 5"
              />
            )}

            <g
              className="robot-body"
              style={{ transform: `translate(${robotX}px, ${FLOOR}px)` }}
            >
              {/* The 18 cm line the sonar watches for */}
              <line
                x1={18 * PX}
                y1={-58}
                x2={18 * PX}
                y2={6}
                strokeWidth={1.5}
                strokeDasharray="4 5"
                className="stroke-accent"
              />
              <text x={18 * PX} y={-66} textAnchor="middle" className="fill-accent text-[24px] sm:text-[19px]">
                18 cm
              </text>

              <Leg x={-70} forward={90 - servos.hipR} bend={90 - servos.kneeR} far />

              <rect x={-100} y={-100} width={90} height={46} rx={6} strokeWidth={2.5} className="fill-bg stroke-fg" />
              {/* LCD */}
              <rect x={-90} y={-91} width={46} height={17} rx={2} fill="#1c3fae" />
              {lcd.some((row) => row.trim()) && (
                <g fill="#e9f0ff">
                  <rect x={-86} y={-87} width={38} height={3} rx={1} />
                  {lcd[1].trim() && <rect x={-80} y={-81} width={32} height={3} rx={1} />}
                </g>
              )}
              {/* Ultrasonic sensor */}
              <rect x={-10} y={-94} width={5} height={34} strokeWidth={2} className="fill-bg stroke-fg" />
              <rect x={-5} y={-91} width={6} height={11} rx={1.5} className="fill-muted" />
              <rect x={-5} y={-74} width={6} height={11} rx={1.5} className="fill-muted" />
              {/* PIXY Cam */}
              <rect x={-92} y={-117} width={28} height={17} rx={3} strokeWidth={2} className="fill-bg stroke-fg" />
              <circle cx={-64} cy={-108.5} r={4.5} className="fill-fg" />
              {/* Buzzer */}
              {buzzing && (
                <g className="robot-buzz stroke-accent" fill="none" strokeWidth={2} strokeLinecap="round">
                  <path d="M-106 -86a10 10 0 0 0 0 14" />
                  <path d="M-112 -92a17 17 0 0 0 0 26" />
                  <path d="M-120 -98a26 26 0 0 0 0 38" />
                  <text x={-118} y={-108} textAnchor="middle" stroke="none" className="fill-accent text-[17px]">
                    2 kHz
                  </text>
                </g>
              )}
              {/* Sword, on the arm servo: 90 is upright, 0 swings it forward */}
              <g className="robot-joint" style={joint(-30, -92, 90 - servos.arm)}>
                <line x1={-30} y1={-84} x2={-30} y2={-96} strokeWidth={5} strokeLinecap="round" className="stroke-muted" />
                <line x1={-39} y1={-97} x2={-21} y2={-97} strokeWidth={4} strokeLinecap="round" className="stroke-fg" />
                <path d="M-33.5 -99V-142L-30 -152L-26.5 -142V-99Z" strokeWidth={2} strokeLinejoin="round" className="fill-bg stroke-fg" />
              </g>

              <Leg x={-46} forward={servos.hipL - 90} bend={servos.kneeL - 90} />

              {/* A sonar ping, redrawn each time the sensor fires */}
              {ping && (
                <g
                  key={ping.count}
                  className="robot-ping stroke-accent"
                  fill="none"
                  strokeWidth={2}
                  strokeLinecap="round"
                  style={{ transformOrigin: "2px -77px", transformBox: "view-box" }}
                >
                  <path d="M8 -88a14 14 0 0 1 0 22" />
                  <path d="M15 -95a24 24 0 0 1 0 36" />
                </g>
              )}
            </g>

            {/* The block. Drag it, or focus it and use the arrow keys. */}
            <g
              role="slider"
              tabIndex={0}
              aria-label="Block distance from the robot"
              aria-valuemin={GAP_CM}
              aria-valuemax={(narrow ? Math.min(MAX_CM, robotCm + NARROW_REACH_CM) : MAX_CM) - robotCm}
              aria-valuenow={distance}
              aria-valuetext={`${distance} centimeters ahead of the robot`}
              onPointerDown={(event) => {
                const cm = pointerCm(event);
                if (cm === null) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                grab.current = cm - world.current.blockCm;
              }}
              onPointerMove={(event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
                const cm = pointerCm(event);
                if (cm !== null) moveBlock(cm - grab.current);
              }}
              onKeyDown={(event) => {
                const steps: Record<string, number> = {
                  ArrowLeft: -1,
                  ArrowDown: -1,
                  ArrowRight: 1,
                  ArrowUp: 1,
                  PageDown: -10,
                  PageUp: 10,
                };
                if (event.key in steps) moveBlock(world.current.blockCm + steps[event.key]);
                else if (event.key === "Home") moveBlock(0);
                else if (event.key === "End") moveBlock(MAX_CM);
                else return;
                event.preventDefault();
              }}
              style={{ touchAction: "none" }}
              className="group/block cursor-grab outline-none active:cursor-grabbing"
            >
              <rect
                x={blockX - 6}
                y={FLOOR - BLOCK - 6}
                width={BLOCK + 12}
                height={BLOCK + 12}
                rx={7}
                fill="none"
                strokeWidth={2.5}
                className="stroke-accent opacity-0 group-focus-visible/block:opacity-100"
              />
              <rect x={blockX} y={FLOOR - BLOCK} width={BLOCK} height={BLOCK} rx={4} fill={COLORS[color]} />
              <g stroke="#fff" strokeOpacity={0.55} strokeWidth={2} strokeLinecap="round">
                <line x1={blockX + 14} y1={FLOOR - 27} x2={blockX + 14} y2={FLOOR - 13} />
                <line x1={blockX + 20} y1={FLOOR - 27} x2={blockX + 20} y2={FLOOR - 13} />
                <line x1={blockX + 26} y1={FLOOR - 27} x2={blockX + 26} y2={FLOOR - 13} />
              </g>
            </g>
          </g>
        </svg>

        <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-[minmax(0,auto)_minmax(0,auto)_1fr] sm:items-start">
          <div>
            <p className="text-sm text-muted">Sonar reads</p>
            <p className="font-display text-2xl tabular-nums">
              {sonarCm === null ? "–" : `${sonarCm} cm`}
            </p>
            <p className="text-xs text-muted tabular-nums">
              {ping ? `echo ${ping.microseconds.toLocaleString("en-US")} µs ÷ 29 ÷ 2` : "no reading yet"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Running</p>
            <p className="font-mono text-[15px] leading-8">{calling ?? "nothing yet"}</p>
          </div>
          <div className="sm:justify-self-end">
            <p className="sr-only">LCD: {lcd.join(" ").trim() || "blank"}</p>
            <div aria-hidden="true" className="overflow-x-auto">
              <Lcd rows={lcd} />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line pt-5">
          <fieldset className="flex items-center gap-2">
            <legend className="sr-only">Block color</legend>
            {(Object.keys(COLORS) as Color[]).map((option) => (
              <label
                key={option}
                className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-line px-3 text-sm capitalize transition-colors has-[:checked]:border-fg has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
              >
                <input
                  type="radio"
                  name="block-color"
                  value={option}
                  checked={color === option}
                  onChange={() => pickColor(option)}
                  className="sr-only"
                />
                <span aria-hidden="true" className="h-3 w-3 rounded-sm" style={{ background: COLORS[option] }} />
                {option}
              </label>
            ))}
          </fieldset>

          {running ? (
            <button type="button" onClick={reset} className={secondaryButton}>
              Reset
            </button>
          ) : (
            <button type="button" onClick={start} className={primaryButton}>
              Run the robot
            </button>
          )}

          <p className="text-sm text-muted">Drag the block to move it, even mid-walk.</p>
        </div>

        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    </div>
  );
}
