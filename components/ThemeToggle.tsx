"use client";

import { MoonIcon, SunIcon } from "./icons";

// The current theme lives on <html data-theme="...">, not in React state.
// That lets the inline script in app/layout.tsx set it before the page paints,
// and CSS (the `light:` variant) picks which icon to show.
export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked (private mode); the toggle still works for this visit.
    }
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
