import type { Metadata } from "next";
import { primaryButton } from "@/components/buttons";
import { DownloadIcon } from "@/components/icons";
import ResumeViewer from "@/components/ResumeViewer";
import Source from "@/components/Source";
import { profile } from "@/data/content";

export const metadata: Metadata = {
  title: `Resume | ${profile.name}`,
};

// The name the PDF is saved under, whatever the file in public/ is called.
const fileName = `${profile.name.replaceAll(" ", "-")}-Resume.pdf`;

export default function ResumePage() {
  // The resume PDF leaves contact details out, so this page puts them beside
  // it, along with the one fact a recruiter needs that the resume doesn't say.
  const lookingFor = profile.facts[0];

  return (
    <main id="main" className="relative mx-auto max-w-6xl px-5 pb-20 pt-12 md:pb-24 md:pt-16">
      <Source file="app/resume/page.tsx" className="left-5 top-3" />
      <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,51rem)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="font-display text-5xl leading-none tracking-tight md:text-6xl">
            Resume
          </h1>
          <a href={profile.resume} download={fileName} className={`${primaryButton} mt-7`}>
            <DownloadIcon className="h-[18px] w-[18px]" />
            Download PDF
          </a>
          <dl className="mt-8 space-y-4 text-[15px] leading-snug">
            <div>
              <dt className="text-muted">{lookingFor.label}</dt>
              <dd className="mt-0.5">{lookingFor.value}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-0.5">
                <a
                  href={`mailto:${profile.email}`}
                  className="break-all underline decoration-line underline-offset-4 transition-colors hover:decoration-accent"
                >
                  {profile.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <Source file="components/ResumeViewer.tsx" runs="client" />
          <ResumeViewer src={profile.resume} title={`${profile.name}'s resume`} />
        </div>
      </div>
    </main>
  );
}
