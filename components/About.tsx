import { profile } from "@/data/content";
import Section from "./Section";

export default function About() {
  return (
    <Section id="about" title="About">
      <div className="max-w-[62ch] space-y-5 text-lg leading-relaxed">
        {profile.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </Section>
  );
}
