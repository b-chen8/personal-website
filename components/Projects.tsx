import { projects } from "@/data/content";
import { ExternalIcon, GitHubIcon } from "./icons";
import Section from "./Section";

const link =
  "inline-flex items-center gap-2 text-[15px] font-medium underline decoration-line decoration-2 underline-offset-4 transition-colors hover:decoration-accent";

export default function Projects() {
  return (
    <Section id="projects" title="Projects">
      <ul className="grid gap-5">
        {projects.map((project) => (
          <li key={project.title}>
            <article className="rounded-lg border border-line bg-surface p-6 md:p-7">
              <header className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4">
                <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-2xl">
                  {project.title}
                  {project.note && (
                    <span className="rounded-full border border-accent/50 px-2.5 py-0.5 font-sans text-xs font-medium text-accent">
                      {project.note}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted">{project.period}</p>
              </header>

              <p className="mt-3 max-w-[65ch] leading-relaxed">
                {project.description}
              </p>

              <ul aria-label="Built with" className="mt-5 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <li
                    key={tech}
                    className="rounded border border-line px-2 py-0.5 text-[13px] text-muted"
                  >
                    {tech}
                  </li>
                ))}
              </ul>

              {(project.github || project.demo) && (
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={link}
                    >
                      <GitHubIcon className="h-[18px] w-[18px]" />
                      Code
                      <span className="sr-only">
                        {" "}
                        for {project.title} on GitHub (opens in a new tab)
                      </span>
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={link}
                    >
                      <ExternalIcon className="h-[18px] w-[18px]" />
                      Demo
                      <span className="sr-only">
                        {" "}
                        of {project.title} (opens in a new tab)
                      </span>
                    </a>
                  )}
                </div>
              )}
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
