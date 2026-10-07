import { skills } from "@/data/content";
import Section from "./Section";

export default function Skills() {
  return (
    <Section id="skills" title="Skills">
      <dl>
        {skills.map((group) => (
          <div
            key={group.group}
            className="grid gap-1 border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6"
          >
            <dt className="text-muted">{group.group}</dt>
            <dd className="text-lg leading-relaxed">{group.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
