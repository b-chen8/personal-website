"use client";

import { useId, useState } from "react";
import { secondaryButton } from "./buttons";

// Nutrition Scanner's three design decisions (data/content.ts), tried on one
// day's log read back a week later. Each switch starts on the planned choice
// and can be flipped to the alternative; the query, its rows and the day's
// totals follow, and whatever the alternative gets wrong is marked. The app
// isn't built yet, so this runs on a small made-up dataset.

type Decision = "history" | "access" | "missing";

const DECISIONS: {
  key: Decision;
  legend: string;
  // The planned choice, then the alternative.
  options: [{ label: string; note: string }, { label: string; note: string }];
}[] = [
  {
    key: "history",
    legend: "Past nutrition",
    options: [
      { label: "Snapshot", note: "The plan: each log keeps a copy of the numbers." },
      { label: "Live join", note: "Each read uses the product's numbers as they are today." },
    ],
  },
  {
    key: "access",
    legend: "Database access",
    options: [
      { label: "User's token", note: "The plan: Postgres checks each row's owner." },
      { label: "Admin role", note: "An ORM's privileged connection. No policy runs." },
    ],
  },
  {
    key: "missing",
    legend: "Missing nutrients",
    options: [
      { label: "NULL", note: "The plan: unknown stays unknown." },
      { label: "0", note: "An unknown amount is stored as zero." },
    ],
  },
];

const PLAN: Record<Decision, boolean> = { history: false, access: false, missing: false };

type Row = { food: string; kcal: number; fiber: number | null };

// The log as it was stored. Open Food Facts had no fiber value for the
// yogurt; the coffee's 0 is real.
const LOGGED: Row[] = [
  { food: "Rolled oats", kcal: 150, fiber: 4 },
  { food: "Greek yogurt", kcal: 150, fiber: null },
  { food: "Cold brew coffee", kcal: 5, fiber: 0 },
  { food: "Frozen burrito", kcal: 300, fiber: 5 },
];

// The oats' product today. A contributor has since corrected its serving size
// from 40 g to 80 g, which doubles everything per serving.
const TODAY: Record<string, Omit<Row, "food">> = {
  "Rolled oats": { kcal: 300, fiber: 8 },
};

// Another user's log from the same day.
const OTHER_USER: Row[] = [
  { food: "Instant ramen", kcal: 380, fiber: 2 },
  { food: "Cola", kcal: 140, fiber: 0 },
];

const PROBLEMS: Record<Decision, string> = {
  history:
    "The oats now count as 300 calories, twice what was eaten. A contributor corrected the serving size on Open Food Facts afterward, and the join reads the product as it is today.",
  access:
    "Another user's ramen and cola are in this log. The query never filters by user; with the user's token, the row-level security policy did that.",
  missing:
    "The fiber total looks complete, but the yogurt's fiber was never known. It's stored as 0, the same as the coffee's real 0.",
};

type Shown = Row & { before?: Row; theirs?: boolean; zeroed?: boolean };

export default function SchemaExplorer({
  tag,
}: {
  // Its label in blueprint view (Source.tsx), from the server parent.
  tag?: React.ReactNode;
}) {
  const [flipped, setFlipped] = useState(PLAN);
  const name = useId();

  const rows: Shown[] = [
    ...LOGGED.map((row) => {
      const today = flipped.history ? TODAY[row.food] : undefined;
      return today ? { ...row, ...today, before: row } : row;
    }),
    ...(flipped.access ? OTHER_USER.map((row) => ({ ...row, theirs: true })) : []),
  ].map((row) =>
    flipped.missing && row.fiber === null ? { ...row, fiber: 0, zeroed: true } : row,
  );

  const kcal = rows.reduce((sum, row) => sum + row.kcal, 0);
  const fiber = rows.reduce((sum, row) => sum + (row.fiber ?? 0), 0);
  // With an unknown in the day, the sum is only a lower bound.
  const fiberTotal = rows.some((row) => row.fiber === null) ? `≥ ${fiber}` : `${fiber}`;
  const kcalWrong = flipped.history || flipped.access;
  const fiberWrong = kcalWrong || flipped.missing;
  const problems = DECISIONS.filter((decision) => flipped[decision.key]);

  const query = flipped.history
    ? [
        "select p.food, p.kcal, p.fiber_g",
        "  from food_logs l",
        "  join products p using (barcode)",
        " where l.eaten_on = '2026-10-12'",
      ]
    : ["select food, kcal, fiber_g", "  from food_logs", " where eaten_on = '2026-10-12'"];
  const policy = flipped.access
    ? "-- admin role: the policy is skipped"
    : "-- RLS policy adds: and user_id = auth.uid()";

  // A wrong value is keyed by itself, so it mounts, and flashes, as it appears.
  const wrong = (value: string) => (
    <span key={value} className="schema-flash rounded-sm text-danger">
      {value}
    </span>
  );

  return (
    <div className="relative rounded-lg border border-line bg-surface p-4 sm:p-5 lg:p-6">
      {tag}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <h4 className="font-medium">Flip a decision</h4>
        <p className="text-sm text-muted">
          A made-up day&apos;s log in the planned schema, read back a week later
        </p>
      </div>

      <div className="mt-5 grid gap-x-8 gap-y-6 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <div className="space-y-5">
          {DECISIONS.map(({ key, legend, options }) => (
            <fieldset key={key}>
              <legend className="text-sm text-muted">{legend}</legend>
              <div className="mt-2 inline-flex gap-1 rounded-md border border-line bg-bg p-1">
                {options.map((option, i) => {
                  const alternative = i === 1;
                  const checked = flipped[key] === alternative;
                  return (
                    <label
                      key={option.label}
                      className={`cursor-pointer rounded px-3 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                        checked
                          ? alternative
                            ? "bg-danger text-on-accent"
                            : "bg-accent text-on-accent"
                          : "text-muted hover:text-fg"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`${name}-${key}`}
                        checked={checked}
                        onChange={() => setFlipped({ ...flipped, [key]: alternative })}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[13px] leading-snug text-muted">
                {options[flipped[key] ? 1 : 0].note}
              </p>
            </fieldset>
          ))}
        </div>

        {/* On phones the table comes first, so it sits right under the
            switches and a flip changes rows that are on screen. */}
        <div className="flex min-w-0 flex-col gap-4">
          <pre
            aria-label="The query"
            className="order-2 overflow-x-auto rounded-md md:order-1 border border-line bg-bg px-3 py-2.5 font-mono text-xs leading-relaxed"
          >
            {query.map((line) => (
              <span key={line} className={`block ${flipped.history ? "text-danger" : ""}`}>
                {line}
              </span>
            ))}
            <span className={`block ${flipped.access ? "text-danger" : "text-muted"}`}>
              {policy}
            </span>
          </pre>

          <table className="order-1 w-full font-mono text-sm tabular-nums md:order-2">
            <caption className="sr-only">
              The rows the query returns, with the day&apos;s totals
            </caption>
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className="pb-2 font-normal">food</th>
                <th scope="col" className="pb-2 pl-4 text-right font-normal sm:w-28">kcal</th>
                <th scope="col" className="pb-2 pl-4 text-right font-normal sm:w-28">fiber_g</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.food} className="border-t border-line">
                  <td className="py-1.5 pr-3">
                    {row.theirs ? (
                      <>
                        {wrong(row.food)}
                        <span className="ml-2 font-sans text-xs text-danger">another user</span>
                      </>
                    ) : (
                      row.food
                    )}
                  </td>
                  <td className="py-1.5 text-right">
                    {row.before && (
                      <s className="mr-2 text-muted">{row.before.kcal}</s>
                    )}
                    {row.before || row.theirs ? wrong(`${row.kcal}`) : row.kcal}
                  </td>
                  <td className="py-1.5 text-right">
                    {row.before && (
                      <s className="mr-2 text-muted">{row.before.fiber}</s>
                    )}
                    {row.fiber === null ? (
                      <span className="italic text-muted">null</span>
                    ) : row.before || row.theirs || row.zeroed ? (
                      wrong(`${row.fiber}`)
                    ) : (
                      row.fiber
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-line">
                <th scope="row" className="pt-2 text-left font-sans font-normal text-muted">
                  Day&apos;s total
                </th>
                <td className="pt-2 text-right">{kcalWrong ? wrong(`${kcal}`) : kcal}</td>
                <td className="pt-2 text-right">
                  {fiberWrong ? wrong(fiberTotal) : fiberTotal}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div aria-live="polite" className="max-w-[62ch] text-sm leading-relaxed">
          {problems.length ? (
            <ul className="space-y-2">
              {problems.map(({ key }) => (
                <li key={key} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-[0.45rem] h-2 w-2 shrink-0 rounded-full bg-danger" />
                  {PROBLEMS[key]}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">
              As planned, the log shows what was eaten, only this user&apos;s rows, and a fiber
              total that says the yogurt is unknown. Flip a switch to see what its alternative
              breaks.
            </p>
          )}
        </div>
        {problems.length > 0 && (
          <button type="button" onClick={() => setFlipped(PLAN)} className={`${secondaryButton} shrink-0 self-start`}>
            Back to the plan
          </button>
        )}
      </div>
    </div>
  );
}
