import { useEffect } from "react";

// Lights up boxes and arrows of a FlowDiagram rendered inside `scope`, by
// their ids (data-flow-node="ws", data-flow-edge="ws>client"; see
// FlowDiagram.tsx and the data-active styles in globals.css). The project
// demos use it to show which part of the system is running.
export function useLitDiagram(
  scope: React.RefObject<HTMLElement | null>,
  ids: readonly string[],
) {
  const key = ids.join(" ");
  useEffect(() => {
    const lit = key ? key.split(" ") : [];
    scope.current
      ?.querySelectorAll<HTMLElement>("[data-flow-node], [data-flow-edge]")
      .forEach((element) => {
        const id = element.dataset.flowNode ?? element.dataset.flowEdge ?? "";
        element.toggleAttribute("data-active", lit.includes(id));
      });
  }, [scope, key]);
}
