"use client";

import { useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";
import ThemeToggle from "./ThemeToggle";

// Each href matches the id of a <Section> on the page.
const links = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export default function Nav({ name }: { name: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <nav aria-label="Main" className="mx-auto max-w-5xl px-5">
        <div className="flex h-14 items-center justify-between gap-4">
          <a href="#top" className="font-display text-lg">
            {name}
          </a>

          <div className="flex items-center gap-1">
            <ul className="mr-3 hidden items-center gap-6 text-sm md:flex">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-muted transition-colors hover:text-fg"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

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
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
