"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalIcon } from "./icons";
import { useInspecting } from "./inspect";

// The label on one component in blueprint view: its name, whether it runs on
// the server or in the browser, its current size, and a link to its code. It
// sits on the edge of its parent, which globals.css outlines while the label
// is there. Rendered through Source.tsx, which supplies the link.
export default function InspectTag({
  file,
  href,
  runs,
  className = "left-3 top-0 -translate-y-1/2",
}: {
  file: string;
  href: string;
  runs: "server" | "client";
  className?: string;
}) {
  const on = useInspecting();
  const tag = useRef<HTMLAnchorElement>(null);
  const [size, setSize] = useState("");

  useEffect(() => {
    const parent = tag.current?.parentElement;
    if (!on || !parent) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize[0];
      setSize(`${Math.round(box.inlineSize)} × ${Math.round(box.blockSize)}`);
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, [on]);

  if (!on) return null;

  // components/Hero.tsx reads as <Hero />; app files keep their path.
  const base = file.split("/").pop()!.replace(/\.tsx?$/, "");
  const name = /^[A-Z]/.test(base) ? `<${base} />` : file;

  return (
    <a
      ref={tag}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inspect-tag absolute z-30 inline-flex items-center gap-2 whitespace-nowrap rounded border border-accent bg-bg px-2 py-1 font-mono text-[11px] leading-none text-fg shadow-md transition-colors hover:bg-accent hover:text-on-accent ${className}`}
    >
      <span className="font-semibold">{name}</span>
      <span className="opacity-70">{runs} component</span>
      {size && <span className="opacity-70 tabular-nums">{size}</span>}
      <ExternalIcon className="h-3 w-3" />
      <span className="sr-only">: open {file} on GitHub (opens in a new tab)</span>
    </a>
  );
}
