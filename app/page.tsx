import Contact from "@/components/Contact";
import Education from "@/components/Education";
import Experience from "@/components/Experience";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import { education, profile } from "@/data/content";
import { siteUrl } from "@/lib/site";

// Tells search engines who the page is about, so a search for the name can
// connect this site with the GitHub and LinkedIn profiles.
const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: siteUrl,
  description: profile.tagline,
  sameAs: [profile.github, profile.linkedin],
  affiliation: { "@type": "CollegeOrUniversity", name: education.school },
};

// The home page. The nav and footer are in app/layout.tsx. Reorder the
// sections here; if you add or rename one, update the `links` list in
// components/Nav.tsx to match.
export default function Home() {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(person).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
      <Projects />
      <Education />
      <Experience />
      <Skills />
      <Contact />
    </main>
  );
}
