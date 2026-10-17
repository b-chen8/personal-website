import Contact from "@/components/Contact";
import Education from "@/components/Education";
import Experience from "@/components/Experience";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";

// The home page. The nav and footer are in app/layout.tsx. Reorder the
// sections here; if you add or rename one, update the `links` list in
// components/Nav.tsx to match.
export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Projects />
      <Education />
      <Experience />
      <Skills />
      <Contact />
    </main>
  );
}
