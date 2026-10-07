import { experience } from "@/data/content";
import Section from "./Section";

export default function Experience() {
  return (
    <Section id="experience" title="Experience">
      {/* The left border is the timeline rail; each item places a dot on it. */}
      <ol className="border-l border-line">
        {experience.map((job) => (
          <li
            key={`${job.role}-${job.organization}`}
            className="relative pb-12 pl-7 last:pb-0"
          >
            <span
              aria-hidden="true"
              className="absolute -left-[5px] top-2.5 h-[9px] w-[9px] rounded-full bg-accent ring-4 ring-bg"
            />
            <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4">
              <h3 className="font-display text-2xl">{job.role}</h3>
              <p className="text-sm text-muted">{job.period}</p>
            </div>
            <p className="mt-1 text-muted">
              {job.organization}, {job.location}
            </p>
            <ul className="mt-4 max-w-[65ch] list-disc space-y-2 pl-5 leading-relaxed marker:text-muted">
              {job.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}
