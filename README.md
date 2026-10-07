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

- `profile`: name, tagline, About paragraphs, email, GitHub and LinkedIn links.
- `projects`: one entry per project card. `github`, `demo` and `note` are optional; leave one out and it is not shown.
- `experience`: one entry per job, shown in the order listed.
- `skills`: the groups and what is in each.

To update the resume, replace `public/anonResume.pdf`. To use a file with a different name, put it in `public/` and change `profile.resume` to match; the name is case-sensitive once deployed. The file is public once the site is live, so check what it contains.

## Change the look

- **Colors:** the tokens at the top of [app/globals.css](app/globals.css). `:root` is dark mode, which is the default, and `[data-theme="light"]` is light mode. Components use these through Tailwind classes such as `bg-surface` and `text-muted`, so changing a token changes it everywhere. The one exception is the link-preview image, which repeats the dark colors in [app/opengraph-image.tsx](app/opengraph-image.tsx).
- **Fonts:** loaded in [app/layout.tsx](app/layout.tsx). Headings use STIX Two Text (`font-display`), body text uses Schibsted Grotesk.
- **Section order:** [app/page.tsx](app/page.tsx). If you add or rename a section, update the `links` list in [components/Nav.tsx](components/Nav.tsx) to match.

## How the files fit together

| File | What it does |
| --- | --- |
| `app/layout.tsx` | Page shell: fonts, page title and description, and a small script that applies a saved theme before the page paints. |
| `app/page.tsx` | Lists the sections in order. |
| `app/globals.css` | Color tokens, Tailwind setup, and the hero plot's draw-on animation. |
| `app/opengraph-image.tsx` | The image shown when the site's link is shared. Generated at build time from the name and tagline in `data/content.ts`, using the font files in `assets/fonts/`. |
| `components/Nav.tsx` | Sticky nav and the mobile menu. |
| `components/ThemeToggle.tsx` | Switches `data-theme` on `<html>` and saves the choice in `localStorage`. |
| `components/Section.tsx` | Layout shared by every section: title in a left margin, content beside it. |
| `components/Hero.tsx` | Name, tagline, and the Resume, GitHub and Contact buttons. |
| `components/TaylorPlot.tsx` | The hero figure: sin x and its Taylor polynomials, drawn as SVG. |
| `components/About.tsx`, `Projects.tsx`, `Experience.tsx`, `Skills.tsx`, `Contact.tsx` | One per section. Each reads from `data/content.ts`. |
| `components/icons.tsx` | The inline SVG icons. |

Only `Nav.tsx` and `ThemeToggle.tsx` run JavaScript in the browser. Everything else is rendered to static HTML at build time.
