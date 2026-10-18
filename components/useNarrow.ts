import { useSyncExternalStore } from "react";

// Below Tailwind's sm breakpoint. The project demos draw their figures on a
// narrower canvas there, so text and shapes stay big enough to read.
const QUERY = "(max-width: 639px)";

function subscribe(onChange: () => void) {
  const query = matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// False on the server and during hydration, then the real answer.
export function useNarrow() {
  return useSyncExternalStore(subscribe, () => matchMedia(QUERY).matches, () => false);
}
