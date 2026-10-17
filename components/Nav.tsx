"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseIcon, FileIcon, MenuIcon } from "./icons";
import ThemeToggle from "./ThemeToggle";

// Each href matches the id of a <Section> on the home page. The leading slash
// makes the links work from the resume page too.
const links = [
  { href: "/#projects", label: "Projects" },
  { href: "/#education", label: "Education" },
  { href: "/#experience", label: "Experience" },
  { href: "/#skills", label: "Skills" },
  { href: "/#contact", label: "Contact" },
];

export default function Nav({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState<string | null>(null);
  const pathname = usePathname();
  const onHome = pathname === "/";
  const onResume = pathname === "/resume";

  // Underlines the link for the section being read: the one crossing a thin
  // band 40% of the way down the window. While the hero is there, none is.
  useEffect(() => {
    if (!onHome) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setReading(entry.target.id === "top" ? null : entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of ["top", ...links.map((link) => link.href.slice(2))]) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [onHome]);
  const current = onHome ? reading : null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto max-w-6xl px-5">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href="/#top" className="font-display text-lg">
            {name}
          </Link>

          <div className="flex items-center gap-1">
            <ul className="mr-3 hidden items-center gap-6 text-sm md:flex">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    data-current={current === link.href.slice(2) || undefined}
                    className="relative text-muted transition-colors after:absolute after:inset-x-0 after:-bottom-[19px] after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-300 hover:text-fg data-current:text-fg data-current:after:scale-x-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* The one link a recruiter wants from any scroll position. */}
            <Link
              href="/resume"
              aria-current={onResume ? "page" : undefined}
              className="mr-1 inline-flex h-9 items-center gap-1.5 rounded-md border border-line px-3 text-sm font-medium transition-colors hover:border-muted aria-[current=page]:border-muted aria-[current=page]:bg-surface"
            >
              <FileIcon className="h-4 w-4" />
              Resume
            </Link>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-10 w-10 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-fg md:hidden"
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {open && (
          <ul id="mobile-menu" className="border-t border-line py-2 md:hidden">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
