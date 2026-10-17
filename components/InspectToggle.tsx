"use client";

import { useEffect } from "react";
import { InspectIcon } from "./icons";
import { toggleInspecting, useInspecting } from "./inspect";

// Turns blueprint view on and off: an icon button for the nav, or a link-like
// button for the footer.
export default function InspectToggle({ variant }: { variant: "icon" | "text" }) {
  const on = useInspecting();

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleInspecting}
        aria-pressed={on}
        aria-label="Show how this page is built"
        title="Show how this page is built"
        className="hidden h-10 w-10 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-fg aria-pressed:text-accent md:grid"
      >
        <InspectIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleInspecting}
      aria-pressed={on}
      className="underline decoration-line underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
    >
      {on ? "Hide the component outlines" : "See how this page is built"}
    </button>
  );
}

// While blueprint view is on: what the outlines mean, and a way out. Escape
// also turns it off.
export function InspectBar() {
  const on = useInspecting();

  useEffect(() => {
    if (!on) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") toggleInspecting();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on]);

  if (!on) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 z-50 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-4 rounded-lg border border-accent/60 bg-surface/95 py-2 pl-4 pr-2 text-sm shadow-lg backdrop-blur [bottom:calc(1rem+env(safe-area-inset-bottom,0px))]"
    >
      <p>
        Each dashed box is one React component.{" "}
        <span className="text-muted">Its label opens the code.</span>
      </p>
      <button
        type="button"
        onClick={toggleInspecting}
        className="h-8 shrink-0 rounded-md border border-line px-3 font-medium transition-colors hover:border-muted"
      >
        Exit
      </button>
    </div>
  );
}
