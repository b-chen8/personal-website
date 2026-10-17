import { education } from "@/data/content";
import Section from "./Section";

export default function Education() {
  return (
    <Section id="education" title="Education" file="components/Education.tsx">
      <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4">
        <h3 className="font-display text-2xl">{education.school}</h3>
        <p className="text-sm text-muted">{education.period}</p>
      </div>
      <p className="mt-1 text-muted">{education.degree}</p>
      <p className="mt-5 text-lg">{education.honors}</p>

      <h4 className="mt-9 text-[15px] text-muted">Relevant coursework</h4>
      <ul className="mt-3 grid max-w-2xl gap-x-10 gap-y-2 leading-relaxed sm:grid-cols-2">
        {education.coursework.map((course) => (
          <li key={course}>{course}</li>
        ))}
      </ul>
    </Section>
  );
}
