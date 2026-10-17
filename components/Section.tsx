import Source, { onContentEdge } from "./Source";

// Shared layout for every section below the hero: the title sits in a left
// margin on wide screens and stacks above the content on small ones.
// `id` is what the nav links scroll to, and `file` is the component using
// it, for its label in blueprint view.
export default function Section({
  id,
  title,
  file,
  children,
}: {
  id: string;
  title: string;
  file: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="relative border-t border-line"
    >
      <Source file={file} className={onContentEdge} />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-12 md:py-24">
        <h2
          id={`${id}-heading`}
          className="self-start font-display text-3xl md:sticky md:top-24"
        >
          {title}
        </h2>
        <div>{children}</div>
      </div>
    </section>
  );
}
