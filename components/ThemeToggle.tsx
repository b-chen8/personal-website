"use client";

import { MoonIcon, SunIcon } from "./icons";

// The current theme lives on <html data-theme="...">, not in React state.
// That lets the inline script in app/layout.tsx set it before the page paints,
// and CSS (the `light:` variant) picks which icon to show.
export default function ThemeToggle() {
  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked (private mode); the toggle still works for this visit.
    }

    const apply = () => {
      root.dataset.theme = next;
    };
    if (
      !("startViewTransition" in document) ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      apply();
      return;
    }

    // The new theme grows out of the button as a circle until it covers the
    // window. The browser snapshots the page before and after `apply`, and
    // the circle clips the new snapshot (see globals.css).
    const button = event.currentTarget.getBoundingClientRect();
    const x = button.left + button.width / 2;
    const y = button.top + button.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    document.startViewTransition(apply).ready.then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 550,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between dark and light theme"
      className="grid h-10 w-10 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-fg"
    >
      <SunIcon className="h-5 w-5 light:hidden" />
      <MoonIcon className="hidden h-5 w-5 light:block" />
    </button>
  );
}
