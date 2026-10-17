import { useSyncExternalStore } from "react";

// Blueprint view: outlines every component on the page and labels it with its
// file, size, and where it runs (see InspectTag.tsx). Whether it is on lives
// on <html data-inspect>, like the theme, so any component can read it
// without a shared React parent.

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-inspect"],
  });
  return () => observer.disconnect();
}

const isOn = () => document.documentElement.hasAttribute("data-inspect");

export function useInspecting() {
  return useSyncExternalStore(subscribe, isOn, () => false);
}

// Turning it on or off sweeps the new view down the page like a scanner,
// where the browser supports view transitions (see globals.css).
export function toggleInspecting() {
  const root = document.documentElement;
  const update = () => {
    root.toggleAttribute("data-inspect");
    // Let React render the labels before the browser takes its snapshot.
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
  };
  if (
    !("startViewTransition" in document) ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    update();
    return;
  }
  document.startViewTransition(update).ready.then(() => {
    root.animate(
      { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"] },
      {
        duration: 700,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
}
