"use client";

import { useEffect, useRef, useState } from "react";
import { primaryButton, secondaryButton } from "./buttons";
import { useLitDiagram } from "./useLitDiagram";
import { useNarrow } from "./useNarrow";

// A live version of PolyLens's price feed. useLivePrices.ts in the PolyLens
// repo (github.com/b-chen8/Yhack2026) opens Polymarket's WebSocket, reconnects
// 5 s after it closes, and polls the Express API every 12 s, skipping any poll
// while the socket is open. The same rules run here in real time against a
// simulated market. Block the WebSocket and the price on screen falls behind,
// reconnects fail, and polling takes over; the project's diagram lights up
// whichever path prices are taking.

// From useLivePrices.ts.
const POLL_INTERVAL_MS = 12000;
const RECONNECT_MS = 5000;
// Simulation only: how often the market moves (the socket pushes each move),
// how long a handshake takes or takes to fail, and the API's response time.
const TICK_MS = 500;
const HANDSHAKE_MS = 400;
const HANDSHAKE_TIMEOUT_MS = 1500;
const API_MS = 250;
// How long a poll stays lit in the diagram.
const POLL_LIT_MS = 1400;

type Status = "connecting" | "connected" | "disconnected" | "error";
// The app's own connection indicator (LiveIndicator.tsx).
const STATUS: Record<Status, { label: string; dot: string }> = {
  connected: { label: "LIVE", dot: "bg-[#2f9e68] motion-safe:animate-pulse" },
  connecting: { label: "Connecting…", dot: "bg-accent motion-safe:animate-pulse" },
  disconnected: { label: "Polling", dot: "bg-muted" },
  error: { label: "WS Error", dot: "bg-[#e5484d]" },
};

type Point = { t: number; market: number; shown: number | null; polled: boolean };
type Line = { t: number; text: string };

// Chart: up to the last minute of prices. The window starts at 20 s and
// widens to a minute, and the price scale fits whatever is in view. Phones
// get a narrower canvas, so the chart comes out taller there.
const H = 210;
const LEFT = 52;
const RIGHT = 10;
const TOP = 12;
const BOTTOM = 14;
const MIN_WINDOW_MS = 20000;
const WINDOW_MS = 60000;
const MIN_SPAN = 0.08;

const cents = (price: number) => `${Math.round(price * 100)}¢`;
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

// A rough bell curve, for the market's moves.
const noise = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

export default function FeedSimulator({
  diagram,
  tag,
}: {
  diagram: React.ReactNode;
  // Its label in blueprint view (Source.tsx), from the server parent.
  tag?: React.ReactNode;
}) {
  const [running, setRunning] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [status, setStatus] = useState<Status>("disconnected");
  const [series, setSeries] = useState<Point[]>([]);
  const [now, setNow] = useState(0);
  const [shownAt, setShownAt] = useState<number | null>(null);
  const [reconnectAt, setReconnectAt] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const [log, setLog] = useState<Line[]>([]);
  const [announcement, setAnnouncement] = useState("");

  const world = useRef({ blocked: false });
  const engine = useRef<{ stop(): void; drop(): void } | null>(null);
  const scope = useRef<HTMLDivElement>(null);
  const W = useNarrow() ? 560 : 1000;

  useLitDiagram(
    scope,
    status === "connected"
      ? ["ws", "ws>client", "client"]
      : polling
        ? ["rest", "rest>api", "api", "api>client", "client"]
        : [],
  );

  useEffect(() => () => engine.current?.stop(), []);

  function start() {
    const t0 = performance.now();
    const clock = () => performance.now() - t0;
    const timeouts = new Set<number>();
    const intervals: number[] = [];
    let stopped = false;
    const later = (ms: number, fn: () => void) => {
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        if (!stopped) fn();
      }, ms);
      timeouts.add(id);
    };
    const say = (text: string) => setLog((lines) => [...lines.slice(-4), { t: clock(), text }]);

    let market = 0.62;
    let shown: number | null = null;
    let polled = false;

    // The socket, as useLivePrices.ts handles it.
    type Socket = { state: "connecting" | "open" | "closed" };
    let ws: Socket | null = null;

    const onclose = (socket: Socket) => {
      socket.state = "closed";
      if (ws === socket) ws = null;
      setStatus("disconnected");
      say("ws.onclose: reconnect in 5 s");
      setAnnouncement("The WebSocket closed. Reconnecting in 5 seconds; polling meanwhile.");
      setReconnectAt(clock() + RECONNECT_MS);
      later(RECONNECT_MS, connect);
    };

    function connect() {
      if (ws?.state === "open") return;
      setReconnectAt(null);
      setStatus("connecting");
      say("new WebSocket(WS_URL)");
      const socket: Socket = { state: "connecting" };
      ws = socket;
      if (world.current.blocked) {
        later(HANDSHAKE_TIMEOUT_MS, () => {
          setStatus("error");
          say("ws.onerror");
          onclose(socket);
        });
        return;
      }
      later(HANDSHAKE_MS, () => {
        if (ws !== socket) return;
        socket.state = "open";
        setStatus("connected");
        say('ws.onopen: subscribe to the "market" channel');
        setAnnouncement("Connected. Prices are arriving over the WebSocket.");
      });
    }

    // The polling fallback: every 12 s, unless the socket is open.
    const doPoll = () => {
      if (ws?.state === "open") return;
      say("GET /api/markets/prices");
      setPolling(true);
      later(API_MS, () => {
        shown = market;
        polled = true;
        setShownAt(clock());
        say(`200 OK, price ${cents(market)}`);
      });
      later(POLL_LIT_MS, () => setPolling(false));
    };

    // The simulated market drifts around 62¢. While the socket is open, each
    // move arrives as a message (ws.onmessage).
    const tick = () => {
      market = Math.min(0.85, Math.max(0.4, market + (0.62 - market) * 0.04 + noise() * 0.02));
      if (ws?.state === "open") {
        shown = market;
        setShownAt(clock());
      }
      // Copy the values now; the update below runs later.
      const point = { t: clock(), market, shown, polled };
      const { t } = point;
      setSeries((points) => [...points.filter((p) => p.t > t - WINDOW_MS - TICK_MS), point]);
      polled = false;
      setNow(t);
    };

    setSeries([]);
    setLog([]);
    setShownAt(null);
    setRunning(true);
    connect();
    doPoll(); // the hook's immediate first fetch, while the socket is still connecting
    intervals.push(window.setInterval(() => !stopped && tick(), TICK_MS));
    intervals.push(window.setInterval(() => !stopped && doPoll(), POLL_INTERVAL_MS));

    engine.current = {
      stop() {
        stopped = true;
        timeouts.forEach(clearTimeout);
        intervals.forEach(clearInterval);
      },
      // Blocking the network drops an open socket.
      drop() {
        if (ws?.state === "open") onclose(ws);
      },
    };
  }

  function stop() {
    engine.current?.stop();
    engine.current = null;
    setRunning(false);
    setStatus("disconnected");
    setReconnectAt(null);
    setPolling(false);
    setAnnouncement("Stopped.");
  }

  function toggleBlock() {
    const next = !world.current.blocked;
    world.current.blocked = next;
    setBlocked(next);
    if (next) engine.current?.drop();
  }

  // Chart geometry.
  const span = Math.min(WINDOW_MS, Math.max(MIN_WINDOW_MS, now));
  const x = (t: number) => LEFT + ((t - (now - span)) / span) * (W - LEFT - RIGHT);
  const visible = series.filter((point) => point.t >= now - span);
  const prices = visible.flatMap((p) => (p.shown === null ? [p.market] : [p.market, p.shown]));
  const middle = prices.length ? (Math.min(...prices) + Math.max(...prices)) / 2 : 0.62;
  const range = Math.max(MIN_SPAN, prices.length ? (Math.max(...prices) - Math.min(...prices)) * 1.35 : 0);
  const low = middle - range / 2;
  const high = middle + range / 2;
  const y = (price: number) => TOP + ((high - price) / (high - low)) * (H - TOP - BOTTOM);
  const gridStep = range > 0.2 ? 0.05 : 0.02;
  const gridLines = [];
  for (let price = Math.ceil(low / gridStep) * gridStep; price <= high; price += gridStep) {
    gridLines.push(Math.round(price * 100) / 100);
  }
  const marketLine = visible.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)} ${y(p.market).toFixed(1)}`).join("");
  // The price on screen only changes when a message or a poll arrives, so it
  // is drawn as steps. The gap between it and the market is hatched.
  const steps: [number, number][] = [];
  visible.forEach((p, i) => {
    if (p.shown === null) return;
    const before = visible[i - 1]?.shown;
    if (before !== null && before !== undefined) steps.push([x(p.t), y(before)]);
    steps.push([x(p.t), y(p.shown)]);
  });
  const shownLine = steps.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join("");
  const firstShown = visible.findIndex((p) => p.shown !== null);
  const gap =
    firstShown >= 0 && steps.length > 1
      ? `M${visible
          .slice(firstShown)
          .map((p) => `${x(p.t).toFixed(1)} ${y(p.market).toFixed(1)}`)
          .join("L")}L${[...steps]
          .reverse()
          .map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`)
          .join("L")}Z`
      : "";

  const latest = series.at(-1);
  const nextPoll = POLL_INTERVAL_MS - (now % POLL_INTERVAL_MS);
  const { label, dot } = STATUS[status];

  return (
    <div ref={scope}>
      {diagram}

      <div className="relative mt-4 rounded-lg border border-line bg-surface p-4 sm:p-5 lg:p-6">
        {tag}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <h4 className="font-medium">Watch the live feed</h4>
          <p className="text-sm text-muted">
            Its live-price hook, run in real time against a simulated market
          </p>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={
            latest
              ? `Price chart for the last minute. The market is at ${cents(latest.market)} and the page shows ${latest.shown === null ? "nothing yet" : cents(latest.shown)}.`
              : "Price chart, empty until the feed starts."
          }
          className="mt-3 block h-auto w-full font-display"
        >
          <defs>
            <pattern id="feed-hatch" width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1={0} y1={0} x2={0} y2={8} strokeWidth={2.5} className="stroke-accent" />
            </pattern>
            <clipPath id="feed-plot">
              <rect x={LEFT} y={0} width={W - LEFT - RIGHT} height={H} />
            </clipPath>
          </defs>

          {gridLines.map((price) => (
            <g key={price}>
              <line x1={LEFT} y1={y(price)} x2={W - RIGHT} y2={y(price)} strokeWidth={1} className="stroke-line" />
              <text x={LEFT - 10} y={y(price)} textAnchor="end" dominantBaseline="middle" className="fill-muted text-[17px]">
                {cents(price)}
              </text>
            </g>
          ))}

          {series.length === 0 ? (
            <text x={(W + LEFT) / 2} y={H / 2} textAnchor="middle" dominantBaseline="middle" className="fill-muted text-[20px]">
              Press Connect to start the feed
            </text>
          ) : (
            <g clipPath="url(#feed-plot)">
              {gap && <path d={gap} fill="url(#feed-hatch)" fillOpacity={0.5} />}
              <path d={marketLine} fill="none" strokeWidth={1.5} className="stroke-muted" strokeDasharray="5 5" />
              <path d={shownLine} fill="none" strokeWidth={3} strokeLinejoin="round" className="stroke-accent" />
              {visible
                .filter((p) => p.polled && p.shown !== null)
                .map((p) => (
                  <circle key={p.t} cx={x(p.t)} cy={y(p.shown!)} r={6} strokeWidth={2.5} className="fill-surface stroke-accent" />
                ))}
            </g>
          )}
        </svg>

        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="h-[3px] w-5 rounded bg-accent" />
            Price on the page
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="w-5 border-t-[1.5px] border-dashed border-muted" />
            Market price
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border-2 border-accent" />
            Arrived by polling
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-[auto_auto_auto_1fr]">
          <div>
            <p className="text-sm text-muted">Connection</p>
            <p className="mt-1 flex items-center gap-2 font-mono text-sm">
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${running ? dot : "bg-line"}`} />
              {running ? label : "Off"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">On the page</p>
            <p className="font-display text-2xl tabular-nums">
              {latest?.shown != null ? cents(latest.shown) : "–"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Last update</p>
            <p className="font-display text-2xl tabular-nums">
              {running && shownAt !== null ? `${seconds(Math.max(0, now - shownAt))} ago` : "–"}
            </p>
          </div>
          <div className="col-span-2 text-sm text-muted sm:col-span-1 sm:justify-self-end sm:text-right">
            {running && reconnectAt !== null && (
              <p>
                Reconnect in{" "}
                {Math.min(RECONNECT_MS / 1000, Math.max(0, Math.ceil((reconnectAt - now) / 1000)))} s
              </p>
            )}
            {running && status !== "connected" && (
              <p>Next poll in {Math.ceil(nextPoll / 1000)} s</p>
            )}
          </div>
        </div>

        <ol
          aria-label="Event log"
          className="mt-4 h-[7.25rem] overflow-hidden rounded-md border border-line bg-bg px-3 py-2 font-mono text-xs leading-[1.375rem]"
        >
          {log.length === 0 && (
            <li className="font-sans text-muted">
              The hook&apos;s WebSocket and fetch calls show up here.
            </li>
          )}
          {log.map((line) => (
            <li key={`${line.t}-${line.text}`} className="flex gap-3">
              <span className="w-14 shrink-0 text-right tabular-nums text-muted">+{seconds(line.t)}</span>
              <span className="truncate">{line.text}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-line pt-5">
          {running ? (
            <button type="button" onClick={stop} className={secondaryButton}>
              Disconnect
            </button>
          ) : (
            <button type="button" onClick={start} className={primaryButton}>
              Connect
            </button>
          )}
          <button
            type="button"
            onClick={toggleBlock}
            aria-pressed={blocked}
            disabled={!running}
            className={`${secondaryButton} disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-accent aria-pressed:text-accent`}
          >
            {blocked ? "Unblock the WebSocket" : "Block the WebSocket"}
          </button>
          <p className="text-sm text-muted">Block it and watch polling take over.</p>
        </div>

        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    </div>
  );
}
