# Personal website

Benson Chen's portfolio: a single page built with Next.js (App Router), TypeScript and Tailwind CSS.

**Live site:** https://personal-website-benson-chen.vercel.app

The site is hosted on Vercel, and every push to the `main` branch redeploys it.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Run `npm run build` before pushing to catch errors the dev server lets through.

## Change the content

Everything the site says lives in [data/content.ts](data/content.ts). No component needs to change when the content does.

- `profile`: name, the intro paragraph and short facts at the top of the page, email, and links. `tagline` is the page description and the text in the link-preview image.
- `projects`: one entry per project, in the order shown. `github`, `demo` and `note` are optional; leave one out and it is not shown. `inProgress: true` adds an "In progress" label and introduces `details` as design decisions. `simulator` adds a playable demo under the project's summary: `"robot"` for Combat Toy and `"feed"` for PolyLens, which expect their own project's box ids, and `"schema"` for Nutrition Scanner.
- `flow` (inside a project, optional): the diagram of how the project's parts connect. Each box has a column and a row, and each arrow names the two boxes it joins; the comments on `FlowNode` and `FlowEdge` explain the rules. On phones the diagram turns on its side automatically.
- `education`: school, degree, GPA line and coursework.
- `experience`: software-relevant jobs, with bullet points. `otherWork`: other jobs, one short line each.
- `skills`: the groups and what is in each.

To update the resume, replace `public/anonResume.pdf`. To use a file with a different name, put it in `public/` and change `profile.resume` to match; the name is case-sensitive once deployed. The file is public once the site is live, so check what it contains. Every Resume link goes to the `/resume` page, which shows the file inside the site, and its Download PDF button saves it under your name rather than the file's.

## Change the look

- **Colors:** the tokens at the top of [app/globals.css](app/globals.css). `:root` is dark mode, which is the default, and `[data-theme="light"]` is light mode. Components use these through Tailwind classes such as `bg-surface` and `text-muted`, so changing a token changes it everywhere. The exceptions are the link-preview image in [app/opengraph-image.tsx](app/opengraph-image.tsx) and the tab icon in [app/icon.svg](app/icon.svg), which repeat the dark colors.
- **Fonts:** loaded in [app/layout.tsx](app/layout.tsx). Headings use STIX Two Text (`font-display`), body text uses Schibsted Grotesk.
- **Section order:** [app/page.tsx](app/page.tsx). If you add or rename a section, update the `links` list in [components/Nav.tsx](components/Nav.tsx) to match.
- **Hero plot:** the frame, the degrees the slider offers and the intro animation's timing are constants at the top of [components/TaylorExplorer.tsx](components/TaylorExplorer.tsx).

## How the files fit together

| File | What it does |
| --- | --- |
| `app/layout.tsx` | Page shell: fonts, the nav and footer, page title and description, and a small script that applies a saved theme before the page paints. |
| `app/page.tsx` | The home page. Lists the sections in order. |
| `app/resume/page.tsx` | The resume page: the PDF shown in the page, a download button, and the contact details the PDF leaves out. |
| `app/globals.css` | Color tokens, Tailwind setup, the hero plot's animations, the degree slider's styles, the pulses on the project diagrams, and the theme-switch transition. |
| `app/sitemap.ts`, `app/robots.ts`, `lib/site.ts` | The sitemap and robots.txt for search engines, and the site's own address they share with the page metadata. The home page also describes the person it's about in JSON-LD (`app/page.tsx`). |
| `app/opengraph-image.tsx` | The image shown when the site's link is shared. Generated at build time from the name and tagline in `data/content.ts`, using the font files in `assets/fonts/`. |
| `components/Nav.tsx` | Sticky nav with the Resume link and the mobile menu. Underlines the section you are reading. |
| `components/ThemeToggle.tsx` | Switches `data-theme` on `<html>` and saves the choice in `localStorage`. Where the browser supports view transitions, the new theme spreads out from the button in a circle. |
| `components/Section.tsx` | Layout shared by every section: title in a left margin, content beside it. Its `file` prop names the section's component for blueprint view. |
| `components/Hero.tsx` | Name, intro, facts, and the Resume, GitHub, LinkedIn and Email buttons. |
| `components/TaylorExplorer.tsx` | The hero figure: sin x and one of its Taylor polynomials, with the error hatched, a slider for the degree, and a tracer that reads out the error under the pointer. |
| `lib/taylor.ts` | The math and SVG paths behind the hero figure and the link-preview image. |
| `components/FourierInitials.tsx`, `lib/fourier.ts` | The drawing in the Contact section: a Fourier series of spinning circles tracing "BC", with a slider for how many circles. |
| `lib/initials.ts`, `scripts/trace-initials.py` | The points the Fourier drawing traces, taken from the letters' outlines in STIX Two Text. The data is generated; to change the letters, edit `TEXT` in the script and run `python scripts/trace-initials.py` (needs `pip install fonttools`). |
| `components/FlowDiagram.tsx` | Draws a project's `flow` as a grid of boxes and arrows. Hovering it sends dots along the arrows in the direction data moves. |
| `components/RobotSimulator.tsx` | Combat Toy's simulator. The robot's Arduino sketch, ported to TypeScript function for function, drives a drawing of the robot, its sonar readout and its LCD, and lights up the project's diagram as it runs. |
| `components/FeedSimulator.tsx` | PolyLens's live feed. The app's reconnect and polling rules run in real time against a simulated market; blocking the WebSocket shows the price going stale and polling taking over. |
| `components/SchemaExplorer.tsx` | Nutrition Scanner's design decisions as switches. Each starts on the planned choice; flipping one to its alternative changes the query and its rows, and marks what comes out wrong. |
| `components/useLitDiagram.ts`, `useNarrow.ts` | Shared by the robot and feed demos: lighting up a diagram's boxes and arrows by id, and checking for a phone-sized screen. |
| `components/inspect.ts`, `InspectToggle.tsx`, `InspectTag.tsx`, `Source.tsx` | Blueprint view, switched on from the nav or the footer: outlines each component and labels it with its file, size, and whether it runs on the server or in the browser, linking to its code on GitHub. To label a new component, put `<Source file="components/Name.tsx" />` first inside its root element and make that element `relative`. The links point at the `main` branch. |
| `components/ResumeViewer.tsx` | Shows the resume PDF with the browser's own viewer, or a link to it in browsers that can't (Chrome on Android). |
| `components/Projects.tsx`, `Education.tsx`, `Experience.tsx`, `Skills.tsx`, `Contact.tsx` | One per section. Each reads from `data/content.ts`. |
| `components/icons.tsx`, `buttons.ts` | The inline SVG icons, and the button styles the hero and resume page share. |

Only `Nav.tsx`, `ThemeToggle.tsx`, `TaylorExplorer.tsx`, the three project demos, `FourierInitials.tsx`, `ResumeViewer.tsx` and the blueprint view's toggle and labels run JavaScript in the browser. Everything else is rendered to static HTML at build time, and the hero figure is rendered there too, so the page is complete before any script loads.
