import type { FlowEdge, FlowNode } from "@/data/content";
import Source from "./Source";

// A project's flow diagram, laid out on a CSS grid.
//
// On wide screens node column k sits in grid column 2k - 1, and the grid
// columns between them hold the arrows. Below the lg breakpoint the content
// column is too narrow for three boxes in a row, so the same grid is turned
// on its side: node columns become rows stacked top to bottom, and node rows
// become lanes side by side. Every item is placed with two CSS variables,
// --track (along the flow) and --lanes (across it), and the breakpoint swaps
// which grid axis each one maps to.
//
// Hovering a diagram sends a dot along each arrow (see .flow-pulse in
// globals.css). Arrows leaving later columns start later, so the dots move
// through the system in the order data does.
//
// Boxes and arrows carry their ids (data-flow-node="sonar",
// data-flow-edge="sonar>pixy") so an interactive demo wrapped around the
// diagram can light up the part it is running; see RobotSimulator.tsx.

const placed =
  "[grid-row:var(--track)] [grid-column:var(--lanes)] lg:[grid-column:var(--track)] lg:[grid-row:var(--lanes)]";

const firstRow = (node: FlowNode) => node.row ?? 1;
const lastRow = (node: FlowNode) => firstRow(node) + (node.rows ?? 1) - 1;

function place(track: string, lanes: string) {
  return { "--track": track, "--lanes": lanes } as React.CSSProperties;
}

function Arrow({
  direction,
  dashed,
  delay,
}: {
  direction: "right" | "down";
  dashed?: boolean;
  delay: string;
}) {
  const line = `border-current ${dashed ? "border-dashed" : ""}`;
  const color =
    "flow-arrow text-muted transition-colors duration-300 group-hover/flow:text-accent";
  const pulse = (
    <span
      className={`flow-pulse flow-pulse-${direction}`}
      style={{ "--pulse-delay": delay } as React.CSSProperties}
    />
  );
  return direction === "right" ? (
    <span className={`relative flex items-center ${color}`}>
      {pulse}
      <span className={`h-0 flex-1 border-t-[1.5px] ${line}`} />
      <svg viewBox="0 0 8 10" className="-ml-px h-2.5 w-2 shrink-0 fill-current">
        <path d="M0 0L8 5L0 10Z" />
      </svg>
    </span>
  ) : (
    <span className={`relative flex h-full flex-col items-center ${color}`}>
      {pulse}
      <span className={`w-0 flex-1 border-l-[1.5px] ${line}`} />
      <svg viewBox="0 0 10 8" className="-mt-px h-2 w-2.5 shrink-0 fill-current">
        <path d="M0 0H10L5 8Z" />
      </svg>
    </span>
  );
}

function Edge({
  edge,
  from,
  to,
}: {
  edge: FlowEdge;
  from: FlowNode;
  to: FlowNode;
}) {
  // The arrow runs along the rows the two boxes share.
  const top = Math.max(firstRow(from), firstRow(to));
  const bottom = Math.min(lastRow(from), lastRow(to));
  const delay = `${(from.col - 1) * 0.9}s`;

  return (
    <div
      data-flow-edge={`${edge.from}>${edge.to}`}
      className={placed}
      style={place(`${2 * from.col} / ${2 * to.col - 1}`, `${top} / ${bottom + 1}`)}
    >
      <span className="sr-only">
        {from.label} to {to.label}
        {edge.label && `: ${edge.label}`}.
      </span>
      {/* Wide screens: the label sits above a left-to-right arrow. */}
      <div aria-hidden="true" className="hidden h-full grid-rows-[1fr_auto_1fr] px-1.5 lg:grid">
        <span className="self-end pb-1.5 text-center text-xs leading-snug text-muted">
          {edge.label}
        </span>
        <Arrow direction="right" dashed={edge.dashed} delay={delay} />
      </div>
      {/* Narrow screens: the label sits beside a downward arrow. */}
      <div aria-hidden="true" className="grid h-full grid-cols-[1fr_auto_1fr] py-1 lg:hidden">
        <span />
        <Arrow direction="down" dashed={edge.dashed} delay={delay} />
        <span className="self-center pl-2.5 text-xs leading-snug text-muted">
          {edge.label}
        </span>
      </div>
    </div>
  );
}

export default function FlowDiagram({
  nodes,
  edges,
  label,
}: {
  nodes: FlowNode[];
  edges: FlowEdge[];
  label: string;
}) {
  const columns = Math.max(...nodes.map((node) => node.col));
  const lanes = Math.max(...nodes.map(lastRow));
  const byId = new Map(nodes.map((node) => [node.id, node]));

  const wide = Array(columns).fill("minmax(0,1fr)").join(" minmax(6.5rem,0.6fr) ");
  const narrow = Array(columns).fill("auto").join(" minmax(3.25rem,auto) ");

  // Screen readers read the diagram in source order, so list it column by
  // column: each column's boxes, then the arrows leaving them.
  const ordered = Array.from({ length: columns }, (_, i) => i + 1).flatMap((col) => [
    ...nodes
      .filter((node) => node.col === col)
      .sort((a, b) => firstRow(a) - firstRow(b))
      .map((node) => ({ node })),
    ...edges
      .filter((edge) => byId.get(edge.from)?.col === col)
      .map((edge) => ({ edge })),
  ]);

  return (
    <figure
      aria-label={label}
      className="group/flow relative rounded-lg border border-line bg-surface p-4 sm:p-5 lg:p-6"
    >
      <Source file="components/FlowDiagram.tsx" />
      <div
        className="grid gap-x-3 [grid-template-columns:var(--lanes-narrow)] [grid-template-rows:var(--tracks-narrow)] lg:gap-x-0 lg:gap-y-3 lg:[grid-template-columns:var(--tracks-wide)] lg:[grid-template-rows:var(--lanes-wide)]"
        style={
          {
            "--tracks-wide": wide,
            "--lanes-wide": `repeat(${lanes}, auto)`,
            "--tracks-narrow": narrow,
            "--lanes-narrow": `repeat(${lanes}, minmax(0,1fr))`,
          } as React.CSSProperties
        }
      >
        {ordered.map((item) => {
          if ("node" in item) {
            const { node } = item;
            return (
              <div
                key={node.id}
                data-flow-node={node.id}
                className={`${placed} flex flex-col justify-center rounded-md border border-line bg-bg px-3.5 py-3`}
                style={place(`${2 * node.col - 1}`, `${firstRow(node)} / ${lastRow(node) + 1}`)}
              >
                <p className="text-[15px] font-medium leading-snug">{node.label}</p>
                {node.detail && (
                  <p className="mt-0.5 text-[13px] leading-snug text-muted">
                    {node.detail}
                  </p>
                )}
              </div>
            );
          }
          const { edge } = item;
          const from = byId.get(edge.from);
          const to = byId.get(edge.to);
          if (!from || !to) {
            throw new Error(`Flow edge ${edge.from} → ${edge.to} names a box that does not exist.`);
          }
          return <Edge key={`${edge.from}-${edge.to}`} edge={edge} from={from} to={to} />;
        })}
      </div>
    </figure>
  );
}
