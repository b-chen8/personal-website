import { profile } from "@/data/content";
import { FileIcon, GitHubIcon } from "./icons";
import TaylorPlot from "./TaylorPlot";

const button =
  "inline-flex h-11 items-center gap-2 rounded-md px-5 text-[15px] font-medium transition-colors";
const primary = `${button} bg-accent text-on-accent hover:opacity-90`;
const secondary = `${button} border border-line hover:border-muted`;

export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="mx-auto grid max-w-5xl items-center gap-12 px-5 pb-20 pt-16 md:pt-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 lg:pb-28"
    >
      <div>
        <h1
          id="hero-heading"
          className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          {profile.name}
        </h1>
        <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-muted md:text-xl">
          {profile.tagline}
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href={profile.resume}
            target="_blank"
            rel="noopener noreferrer"
            className={primary}
          >
            <FileIcon className="h-[18px] w-[18px]" />
            Resume
            <span className="sr-only"> (PDF, opens in a new tab)</span>
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className={secondary}
          >
            <GitHubIcon className="h-[18px] w-[18px]" />
            GitHub
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href="#contact" className={secondary}>
            Contact
          </a>
        </div>
      </div>
      <TaylorPlot />
    </section>
  );
}
