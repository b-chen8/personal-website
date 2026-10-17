"use client";

import { useSyncExternalStore } from "react";
import { secondaryButton } from "./buttons";

// Shows the resume PDF inside the page with the browser's own PDF viewer.
//
// Some browsers can't show a PDF inside a page: Chrome on Android, and the
// in-app browsers built on it. They report navigator.pdfViewerEnabled as
// false, and get a link to the file instead. Older browsers leave the property
// undefined, so only an explicit false counts. The server can't check, so it
// renders the viewer, and <object> shows the same link by itself if it can't
// display the file (an <iframe> might download it instead).

const subscribe = () => () => {};
const canShowPdf = () => navigator.pdfViewerEnabled !== false;
const assumeCanShowPdf = () => true;

// The hash hides the viewer's toolbar and fits the page to the frame's width
// (Chrome and Edge read it; other browsers ignore it).
const viewerOptions = "#toolbar=0&navpanes=0&view=FitH";

export default function ResumeViewer({ src, title }: { src: string; title: string }) {
  const inline = useSyncExternalStore(subscribe, canShowPdf, assumeCanShowPdf);

  const fallback = (
    <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
      <p className="font-medium">This browser can&apos;t show the PDF inside the page.</p>
      <p className="mt-1 text-[15px] text-muted">
        Open it on its own, or use Download PDF above.
      </p>
      <a href={src} className={`${secondaryButton} mt-5`}>
        Open the PDF
      </a>
    </div>
  );

  if (!inline) return fallback;

  return (
    <div>
      {/* The frame has the shape of a US letter page, 8.5 by 11 inches.
          Chrome's viewer leaves a gray margin around the page (5px at the
          sides, 3px on top), so the viewer is drawn that much larger than the
          frame and the margin is clipped off. */}
      <div className="relative aspect-[8.5/11] overflow-hidden rounded-md border border-line bg-surface">
        <object
          data={`${src}${viewerOptions}`}
          type="application/pdf"
          aria-label={title}
          className="absolute -left-[5px] -top-[3px] h-[calc(100%+10px)] w-[calc(100%+10px)]"
        >
          {fallback}
        </object>
      </div>
      {/* On a phone the page is too small to read in place. */}
      <a
        href={src}
        className="mt-4 inline-block text-[15px] text-muted underline decoration-line underline-offset-4 transition-colors hover:text-fg hover:decoration-accent sm:hidden"
      >
        Open the PDF full size
      </a>
    </div>
  );
}
