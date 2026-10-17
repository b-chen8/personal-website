import { profile } from "@/data/content";
import InspectTag from "./InspectTag";

// For full-width elements: the label lines up with the page's content
// column (max-w-6xl, px-5) instead of the window's edge.
export const onContentEdge =
  "left-[max(0.75rem,calc((100%-72rem)/2+1.25rem))] top-0 -translate-y-1/2";

// Marks the element it sits in as a component in blueprint view. Put it
// first inside the component's root element, which needs to be positioned
// (`relative`, `sticky`). Client components can't render this server
// component themselves, so their server parent passes it in or wraps them.
export default function Source({
  file,
  runs = "server",
  className,
}: {
  file: string;
  runs?: "server" | "client";
  className?: string;
}) {
  return (
    <InspectTag
      file={file}
      runs={runs}
      href={`${profile.source}/blob/main/${file}`}
      className={className}
    />
  );
}
