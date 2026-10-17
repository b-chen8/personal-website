import type { Metadata } from "next";
import { Schibsted_Grotesk, STIX_Two_Text } from "next/font/google";
import InspectToggle, { InspectBar } from "@/components/InspectToggle";
import Nav from "@/components/Nav";
import Source, { onContentEdge } from "@/components/Source";
import { profile } from "@/data/content";
import "./globals.css";

const bodyFont = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
});

const displayFont = STIX_Two_Text({
  variable: "--font-stix",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// The link-preview image (app/opengraph-image.tsx) needs an absolute URL.
// Vercel provides the project's production domain at build time, so this
// follows a domain change on the next deploy without any edit here.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${profile.name} | Software engineering student`,
  description: profile.tagline,
  openGraph: {
    title: profile.name,
    description: profile.tagline,
    type: "website",
  },
};

// Runs before the first paint so a saved light-mode choice never flashes dark.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-bg font-sans text-fg">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent"
        >
          Skip to content
        </a>
        <Nav
          name={profile.name}
          tag={
            <Source
              file="components/Nav.tsx"
              runs="client"
              className="bottom-0 left-[max(0.75rem,calc((100%-72rem)/2+1.25rem))] translate-y-1/2"
            />
          }
        />
        {children}
        <footer className="relative border-t border-line">
          <Source file="app/layout.tsx" className={onContentEdge} />
          <p className="mx-auto max-w-6xl px-5 py-8 text-sm text-muted">
            © {profile.name}. Built with Next.js and Tailwind CSS.{" "}
            <a
              href={profile.source}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-line underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
            >
              Read the source on GitHub
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            . <InspectToggle variant="text" />.
          </p>
        </footer>
        <InspectBar />
      </body>
    </html>
  );
}
