import Link from "next/link";
import { Fragment } from "react";
import { profile } from "@/data/content";
import { primaryButton as primary, secondaryButton as secondary } from "./buttons";
import { FileIcon, GitHubIcon, LinkedInIcon, MailIcon } from "./icons";
import Source from "./Source";
import TaylorExplorer from "./TaylorExplorer";

const icon = "h-[18px] w-[18px]";

export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative mx-auto max-w-6xl px-5 pb-20 pt-12 md:pb-24 md:pt-16"
    >
      <Source file="components/Hero.tsx" className="left-5 top-3" />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] lg:items-end lg:gap-12">
        <div>
          <h1
            id="hero-heading"
            className="font-display text-[clamp(3.25rem,11vw,6.75rem)] leading-[0.95] tracking-tight"
          >
            {profile.name}
          </h1>
          <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-muted md:text-xl">
            {profile.intro}
          </p>
        </div>

        <div>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2.5 text-[15px] leading-snug">
            {profile.facts.map((fact) => (
              <Fragment key={fact.label}>
                <dt className="text-muted">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </Fragment>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <Link href="/resume" className={primary}>
              <FileIcon className={icon} />
              Resume
            </Link>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className={secondary}
            >
              <GitHubIcon className={icon} />
              GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={secondary}
            >
              <LinkedInIcon className={icon} />
              LinkedIn
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={`mailto:${profile.email}`} className={secondary}>
              <MailIcon className={icon} />
              Email
            </a>
          </div>
        </div>
      </div>

      <div className="relative mt-14 md:mt-16">
        <Source
          file="components/TaylorExplorer.tsx"
          runs="client"
          className="left-0 top-0 -translate-y-1/2"
        />
        <TaylorExplorer />
      </div>
    </section>
  );
}
