// Shared layout for every section below the hero: the title sits in a left
// margin on wide screens and stacks above the content on small ones.
// `id` is what the nav links scroll to.
export default function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="border-t border-line"
    >
      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-16 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-12 md:py-24">
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
