import { profile } from "@/data/content";
import { FileIcon, GitHubIcon, LinkedInIcon, MailIcon } from "./icons";
import Section from "./Section";

const iconLink =
  "grid h-11 w-11 place-items-center rounded-md border border-line text-muted transition-colors hover:border-muted hover:text-fg";

export default function Contact() {
  return (
    <Section id="contact" title="Contact">
      <p className="max-w-[55ch] text-lg leading-relaxed">
        Email is the best way to reach me. I&apos;m looking for a software
        engineering internship for summer 2027 and happy to talk about any of
        the projects above.
      </p>

      <a
        href={`mailto:${profile.email}`}
        className="mt-6 inline-block break-all font-display text-[clamp(1.125rem,6vw,1.5rem)] underline decoration-accent decoration-2 underline-offset-[6px] transition-colors hover:text-accent sm:text-3xl"
      >
        {profile.email}
      </a>

      <ul className="mt-8 flex gap-3">
        <li>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile (opens in a new tab)"
            className={iconLink}
          >
            <GitHubIcon />
          </a>
        </li>
        <li>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile (opens in a new tab)"
            className={iconLink}
          >
            <LinkedInIcon />
          </a>
        </li>
        <li>
          <a
            href={`mailto:${profile.email}`}
            aria-label={`Email ${profile.email}`}
            className={iconLink}
          >
            <MailIcon />
          </a>
        </li>
        <li>
          <a
            href={profile.resume}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Resume (PDF, opens in a new tab)"
            className={iconLink}
          >
            <FileIcon />
          </a>
        </li>
      </ul>
    </Section>
  );
}
