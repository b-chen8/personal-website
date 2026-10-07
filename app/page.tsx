import About from "@/components/About";
import Contact from "@/components/Contact";
import Experience from "@/components/Experience";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import { profile } from "@/data/content";

// The whole site is this one page. Reorder the sections here; if you add or
// rename one, update the `links` list in components/Nav.tsx to match.
export default function Home() {
  return (
    <>
      <Nav name={profile.name} />
      <main id="main">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <footer className="border-t border-line">
        <p className="mx-auto max-w-5xl px-5 py-8 text-sm text-muted">
          © {profile.name}. Built with Next.js and Tailwind CSS.
        </p>
      </footer>
    </>
  );
}
