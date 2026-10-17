import { experience, otherWork } from "@/data/content";
import Section from "./Section";

export default function Experience() {
  return (
    <Section id="experience" title="Experience">
      <ul className="space-y-12">
        {experience.map((job) => (
          <li key={`${job.role}-${job.organization}`}>
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
      </ul>

      {/* Jobs outside software: one line each, so they don't crowd the rest. */}
      {otherWork.length > 0 && (
        <>
          <h3 className="mt-14 text-[15px] text-muted">Other work</h3>
          <ul className="mt-2">
            {otherWork.map((job) => (
              <li
                key={`${job.role}-${job.organization}`}
                className="border-t border-line py-5 first:border-t-0 last:pb-0"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4">
                  <p>
                    <span className="font-medium">{job.role}</span>
                    <span className="text-muted">, {job.organization}</span>
                  </p>
                  <p className="text-sm text-muted">{job.period}</p>
                </div>
                <p className="mt-1.5 max-w-[65ch] leading-relaxed text-muted">
                  {job.summary}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </Section>
  );
}
