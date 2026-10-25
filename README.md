# karolwilczynski.com

Personal website of Karol Polikarp Wilczyński: work where AI meets law and public administration, and the
tools built along the way.

**Live site**: [karolwilczynski.com](https://karolwilczynski.com)

## What is on the site

- **Hero**: introduction with Experience / Education / Skills tabs (keyboard-navigable) and calls to action.
- **Projects** (`#projekty`):
  - an apps carousel (Zorza, Parawan, JakiePrawo.pl, UpFor.pl, AutoMargiela, Majeranek, AIgets.me) with
    screenshot galleries, Overview / Technical / Challenges tabs, swipe and a pausable autoplay;
  - **case studies** (`#studia`): cards linking to long-form pages;
  - **tools**: smaller open tools and scripts;
  - **Data Science**: notebook projects in a bento grid.
- **Case studies** at `/case/<slug>/` (`zorza`, `jakieprawo`, `parawan`, `urzednik-i-ai`): problem, constraints,
  architecture diagram, decisions and what they cost, dated evidence, lessons.
- **Contact** (`#kontakt`): email (obfuscated against scrapers), GitHub, LinkedIn.
- About / Skills / Blog sections exist in the markup but are hidden for now.

## Features

- **Animations „Od paragrafu do parametru”** ("from paragraph to parameter"): particles gather into `§` (law)
  and `{ }` (code) in the hero, plus number scramble, a scroll progress bar and
  scroll-driven reveals. All of it honours `prefers-reduced-motion` and pauses when off-screen.
- **PL/EN toggle**: the page is Polish-first. English is swapped in live on the client from `data-en*`
  attributes, and the choice is remembered.
- **Dark / light mode**: theme toggle with a remembered preference.
- **Responsive**: mobile and desktop layouts around a 768px breakpoint.
- **Accessibility**: semantic HTML, skip links, ARIA labels (translated too), keyboard-operable tabs and carousel.
- **SEO**: Open Graph / Twitter cards, JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt`.
- **Easter eggs**: a Windows 95-style footer clock, and something behind the Konami code.

## Tech stack

- Vanilla HTML5, CSS3 (custom properties) and JavaScript (ES6+). No framework, no npm, no build step.
- Fonts: Playfair Display, DM Sans and JetBrains Mono (Google Fonts, loaded asynchronously).
- Particle engine: a small ES module (`particle-morph.js`) on canvas, fetched only after the page has loaded.
- Hosting: GitHub Pages with a custom domain.

## Running locally

```bash
python -m http.server 8000
# or
npx serve
```

Then open <http://localhost:8000/>. Use a local server rather than opening files directly: the case-study pages
load styles, scripts and images by absolute paths (`/style.css`, `/script.js`), so they will not render from
`file://`.

Optional checks (needs [Deno](https://deno.com); config in `deno.json`):

```bash
deno lint
deno check particle-morph.js particles.js
```

## Deployment

Pushing to `master` deploys the site through GitHub Pages. Files are served as they are; there is nothing to
build. After changing `style.css` or `script.js`, bump the `?v=` cache-busting query in `index.html` and in
every `case/*/index.html`.

## Project structure

```
.
├── index.html             # Home page
├── style.css              # All styles (home + case studies)
├── script.js              # Theme, language, navigation, carousel, tabs, effects
├── particle-morph.js      # Particle morphing engine (ES module)
├── particles.js           # Hero and contact particle scenes
├── case/<slug>/index.html # Case-study pages
├── 404.html               # Custom 404 page
├── assets/images/         # Screenshots (WebP), photo, social card
├── sitemap.xml, robots.txt, llms.txt, manifest.webmanifest
├── .well-known/security.txt
├── deno.json              # Lint config (no build)
├── BACKLOG.md             # Deferred tasks
└── CLAUDE.md              # Notes for AI coding assistants
```

## Contact

- **Email**: on the website
- **GitHub**: [@karolpolikarp](https://github.com/karolpolikarp)
- **LinkedIn**: [Karol Polikarp Wilczyński](https://linkedin.com/in/karolpwilczynski)

## License

© 2025–2026 Karol Polikarp Wilczyński. All rights reserved.
