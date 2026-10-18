import { projects } from "@/data/content";
import FeedSimulator from "./FeedSimulator";
import FlowDiagram from "./FlowDiagram";
import { ExternalIcon, GitHubIcon } from "./icons";
import RobotSimulator from "./RobotSimulator";
import SchemaExplorer from "./SchemaExplorer";
import Section from "./Section";
import Source from "./Source";

const link =
  "inline-flex items-center gap-2 text-[15px] font-medium underline decoration-line decoration-2 underline-offset-4 transition-colors hover:decoration-accent";

export default function Projects() {
  return (
    <Section id="projects" title="Projects" file="components/Projects.tsx">
      <ul>
        {projects.map((project) => {
          const diagram = project.flow && (
            <FlowDiagram
              nodes={project.flow.nodes}
              edges={project.flow.edges}
              label={`How the parts of ${project.title} connect`}
            />
          );
          const demo =
            project.simulator === "robot" ? (
              <RobotSimulator
                diagram={diagram}
                tag={<Source file="components/RobotSimulator.tsx" runs="client" />}
              />
            ) : project.simulator === "feed" ? (
              <FeedSimulator
                diagram={diagram}
                tag={<Source file="components/FeedSimulator.tsx" runs="client" />}
              />
            ) : project.simulator === "schema" ? (
              <SchemaExplorer
                tag={<Source file="components/SchemaExplorer.tsx" runs="client" />}
              />
            ) : (
              diagram
            );
          return (
            <li
              key={project.title}
              className="border-t border-line py-14 first:border-t-0 first:pt-0 last:pb-0 md:py-16"
            >
              <article>
                <header className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4">
                  <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-3xl">
                    {project.title}
                    {project.note && (
                      <span className="rounded-full border border-accent/50 px-2.5 py-0.5 font-sans text-xs font-medium text-accent">
                        {project.note}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted">
                    {project.inProgress && (
                      <span className="mr-3 text-fg">In progress</span>
                    )}
                    {project.period}
                  </p>
                </header>

                <p className="mt-3 max-w-[60ch] text-lg leading-relaxed">
                  {project.summary}
                </p>

                {demo && <div className="mt-7">{demo}</div>}

                {project.inProgress && (
                  <p className="mt-7 text-[15px] text-muted">
                    Design decisions so far
                  </p>
                )}
                <ul
                  className={`${project.inProgress ? "mt-3" : "mt-7"} max-w-[68ch] list-disc space-y-2.5 pl-5 leading-relaxed marker:text-muted`}
                >
                  {project.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-col gap-x-8 gap-y-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <ul
                    aria-label="Built with"
                    className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted"
                  >
                    {project.tech.map((tech) => (
                      <li key={tech}>{tech}</li>
                    ))}
                  </ul>

                  {(project.github || project.demo) && (
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
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
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
