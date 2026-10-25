# CLAUDE.md

This file provides guidance for AI assistants working on this repository.

## Project Overview

**karolwilczynski.com** is a personal portfolio website for Karol Polikarp Wilczynski, showcasing work at the intersection of AI, law, and public administration in Poland.

- **Type**: Static portfolio website (home page + case-study subpages under `/case/<slug>/`)
- **Stack**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Hosting**: GitHub Pages (auto-deploys from master branch)
- **Language**: Polish (pl_PL) primary, with a live client-side PL/EN toggle

> ⚠️ **`projekty/` sub-page is a deferred, separate effort — see `BACKLOG.md`.**
> The `projekty/` directory (a newer projects gallery) is **untracked in git, so it is NOT
> deployed and NOT crawled.** Do not casually edit it, link to it, or commit it as a side effect
> of unrelated work — it needs its own dedicated pass (commit + sitemap + cross-page data
> consistency + perf/a11y/i18n parity). All its open items live in `BACKLOG.md`. Improvements
> elsewhere should target the main page files (`index.html`, `style.css`, `script.js`, `404.html`).

## Quick Start

```bash
# Local development - no build process required
python -m http.server 8000
# or
npx serve
# then open http://localhost:8000/ (and /case/zorza/ etc.)
```

Use a local server, not `file://`. The `/case/<slug>/` pages load `/style.css`, `/script.js`, icons and
images by absolute paths (and `script.js` imports `/particles.js`), so opened as files they render unstyled.
Opening `index.html` directly mostly works, but the particle scenes (ES module import) do not.

## File Structure

```
/
├── index.html      # Main HTML (~1600 lines) - All page content and structure
├── style.css       # Styles (~4350 lines) - Complete design system (home + case studies)
├── script.js       # JavaScript (~1160 lines) - Interactive functionality
├── particle-morph.js # Particle morphing engine (ES module, // @ts-check, ~780 lines) - see "Animations"
├── particles.js    # The hero + contact particle scenes (ES module, ~440 lines, loaded after page load)
├── 404.html        # Custom 404 page (Polish, self-contained styles)
├── case/<slug>/index.html # Case-study subpages (zorza, jakieprawo, parawan, urzednik-i-ai, upfor, automargiela, majeranek, aigets, narzedzia, analizy-danych; ~390-450 lines each) - see "Case studies"
├── robots.txt      # Search engine crawl rules
├── sitemap.xml     # XML sitemap for SEO
├── llms.txt        # Plain-text site summary for LLM crawlers (pages, case studies, projects)
├── manifest.webmanifest # Web app manifest (name, description, icons, theme colour)
├── .well-known/
│   └── security.txt # Security contact
├── deno.json       # `deno lint` config only (excludes untracked dirs, allows `window`) - no build
├── README.md       # Project documentation for humans
├── CLAUDE.md       # This file - AI assistant guidance
├── DESIGN.md       # Visual system and section rules (Gablota, tokens, what not to do)
├── BACKLOG.md      # Deferred tasks (incl. everything for the untracked `projekty/` sub-page)
└── assets/
    └── images/     # Project screenshots (WebP), profile photo, OG card, easter egg images
```

Favicons and app icons (`favicon.*`, `apple-touch-icon.png`, `icon-192/512.png`), `CNAME` and `.nojekyll` also
live in the root. Untracked local files (`projekty/`, `analytics/`, `analytics.js`, `stats.*`, notes such as
`STATUS.md` / `handoff-wrzesien.md`) are not part of the deployed site - do not commit them as a side effect.

## Key Files & Their Purposes

### index.html
- Complete page structure with semantic HTML5
- Sections: nav, hero (Experience / Education / Skills tabs), projects (`#projekty`: the „Gablota” band
  `section.gablota#studia` with one tile per project, then the Data Science bento), contact (`#kontakt`, motto + tiles), footer
- Hidden for now: `#o-mnie`, `#kompetencje`, `#blog` carry inline `style="display: none;"`. Their markup, CSS and
  JS are kept on purpose so they can be switched back on later - do not delete them as "dead code"
- SEO meta tags (Open Graph, Twitter Cards, JSON-LD)
- Google Fonts imports (Playfair Display, DM Sans, JetBrains Mono)
- Theme color: `#004d2b` (British Racing Green)

### style.css
- **CSS Custom Properties** defined in `:root` for theming
- **Design tokens**: colors, spacing, typography, shadows, transitions
- **Dark mode**: Uses `[data-theme="dark"]` selector
- **Breakpoint**: 768px (mobile/desktop)
- **Key color palette**:
  - Primary: British Racing Green (`#004d2b` with variations)
  - Accent: Gold (`#c9a962`)
  - Neutrals: Warm cream tones

### script.js
Contains modular components (in order):
1. **SafeStorage** - `get`/`set` wrappers around `localStorage` (try/catch; private mode or blocked storage must
   not stop the script). Use it instead of calling `localStorage` directly
2. **ThemeManager** - Dark/light mode, persisted via SafeStorage, `aria-pressed` on the toggle
3. **LanguageManager** - Live PL/EN toggle via `data-en` / `data-en-html` attributes (also `<title data-en>`,
   `data-en-content` on the meta description, `data-en-aria` for `aria-label`, `data-en-alt` for `alt`)
4. **Mobile Navigation** - Hamburger menu toggle
5. **Smooth Scroll** - In-page `#` links: smooth scroll (instant under reduced motion), URL hash via
   `history.pushState`, focus moved to the target (temporary `tabindex="-1"` without a focus ring)
6. **ScrollAnimations** - IntersectionObserver-based reveals (`.fade-in-up`, `.skill-card`, `.education-list li`)
7. **MagneticButtons** - Interactive hover effects (desktop only)
8. **Navbar Scroll Effect** - Adds `.nav-scrolled` class at 100px scroll
9. **Windows 95 Clock** - Footer time display
10. **cats easter egg** - `window.cats.show()` + Konami code (one overlay at a time, labels follow the language)
11. **EmailProtection** - Anti-scraper email obfuscation
12. **HeroTabs** - Experience / Education / Skills tab panels (keyboard-navigable)
13. **ProjectShowcase** - Former projects carousel; its markup was replaced by the Gablota (2026-10), the module
    exits early when `.showcase-carousel` is absent (tabs, JS-built dots and counter, screenshot galleries, swipe,
    autoplay with independent pause reasons: hover, focus, hidden tab, off-screen, user pause button)
14. **TechHighlighter** - Wraps known stack/brand names in `<span class="kw">`; re-runs on `languagechange`
15. **NumberScramble** - Numbers marked `<span class="scramble-num">` in the HTML (PL and `data-en-html`) roll
    through `§¶{}<>/01#` when scrolled into view (painted over the real number from a CSS `::after`)
16. **ScrollProgress** - JS fallback for the gold scroll-progress bar under the nav
17. **Particles loader** - `import('/particles.js')` after the `load` event, only on pages with a particle canvas

## Animations („Od paragrafu do parametru”)

Decorative layer added on top of the existing design (nothing else in the layout changes):
- **Hero particles** (`#heroParticles` inside `.hero-bg-decoration`): dust gathers into `§`, then `{ § }`,
  then settles as `§` on the left and `{ }` on the right (serif = law, mono = code). `freeSpot()` in `particles.js`
  searches the measured layout (text lines, photo, buttons, the whole timeline column) for the biggest empty spot:
  the two side margins on wide screens (`§` centred between the left edge and the text, `{ }` centred between the
  timeline and the right edge; every glyph is drawn centred on its ink, so `§` and the braces line up), otherwise one empty area (under the buttons, next to the greeting); on
  phones the sign sits behind the name. When the layout moves that spot (resize, language, tab), `reshape()`
  lets the particles flow there. Then it recedes into a quiet watermark and freezes once idle (12 s with a
  mouse, 6 s on touch; the pointer wakes it); the pointer repels particles.
- **2026-10-26:** the author moved the particle sign from the hero to the contact section: the hero scene keeps
  only the drifting dust (`count: 0` in `heroScene`, `particles.js`), the coloured glow spots behind it are off
  (`.hero-bg-decoration::before { content: none }`), and `.contact-finale` with `#finaleParticles` holds the motto:
  `§` forms behind „paragrafu”, `{ }` behind „parametru”; the particles are faint and step back where the words
  are (`quiet` on `#kontakt .motto-text` in `finaleScene`).
- **Contact motto** (`.contact-motto`): „Od paragrafu do parametru.” (`data-en-html`: one serif, „paragrafu” in
  the colour of `§`, „parametru” in the colour of `{ }`). The contact particle finale was removed (2026-10: too much
  on top of the marble, and a repeat of the hero); `particles.js` still has `finaleScene()` and starts it only
  if a `#finaleParticles` canvas exists.
- **Number scramble**, **scroll progress bar**, **hero-tab timeline drawing** (CSS on
  `.hero-tab-panel.active`), **scroll-driven reveal** (`animation-timeline: view()` inside `@supports`).
- Particle colours come from `--pm-0/1`, `--pm-dust`, `--pm-blend`, `--pm-alpha`, `--pm-size` (both themes, `style.css`).
  Light theme: deep inks (`--color-primary`, `--pm-gold-deep`), opaque `source-over`, 1.3x dots; dark theme: additive glow.
  The light hero also gets the warm glow the dark hero has (`[data-theme="light"] .hero`).
- Engine: one shared `requestAnimationFrame` loop for all canvases, pauses off-screen and in hidden tabs,
  freezes once settled and idle (12 s with a mouse, 6 s on touch; the pointer wakes it), `devicePixelRatio`
  capped, mobile particle counts at the site breakpoint (768px). Shapes are sampled after the fonts load;
  `reshape()` re-samples them when the hero layout moves the sign (or late fonts arrive) and the particles
  flow to the new spot. Without particles the hero keeps a soft static glow (`.hero-bg-decoration::before`).
- **Every effect honours `prefers-reduced-motion`**: particles draw the settled shape once, scramble and
  the scroll progress bar are off, CSS animations are wrapped in `prefers-reduced-motion: no-preference`.
- Typecheck/lint with `deno check particle-morph.js particles.js` and `deno lint`. `deno.json` holds the lint
  config: it excludes the untracked/deferred code (`projekty/`, `analytics/`, `analytics.js`, `stats.js`,
  `.claude/`) and turns off `no-window` / `no-window-prefix` (browser code); every other recommended rule stays on.
- When changing `particle-morph.js`, bump the `?v=` in its import inside `particles.js`; when changing
  `particles.js`, bump the `?v=` in the loader at the end of `script.js` (see also "Cache busting").

## Cache busting (`?v=`)

- **Changing `style.css` or `script.js` requires bumping its `?v=` in `index.html` AND in every
  `case/*/index.html`, all to one shared value** (the case pages load the same files by absolute path, so a
  page left on the old value serves a stale stylesheet/script from cache). Check before committing - each file
  must show exactly one value across all five pages:
  ```bash
  grep -n 'style.css?v=\|script.js?v=' index.html case/*/index.html
  ```
- `404.html` has its own inline styles and does not load `style.css` / `script.js`.
- Images use their own `?v=` on the `src` when a file is replaced under the same name.

## Coding Conventions

### HTML
- Use semantic elements (`<section>`, `<article>`, `<nav>`, etc.)
- Include ARIA labels on interactive elements
- Polish-primary content; give every new user-facing string a `data-en` (or `data-en-html`) counterpart for the live PL/EN toggle
- Classes use kebab-case (e.g., `hero-content`, `project-card`)

### CSS
- Use CSS custom properties for colors, not hardcoded values
- Follow existing naming: `.section-name`, `.section-name-element`
- Mobile-first approach with `@media (min-width: 768px)` for desktop
- Transitions use `var(--transition-base)` (250ms)
- Maintain dark mode support: always add `[data-theme="dark"]` variants

### JavaScript
- Vanilla ES6+ only - no frameworks or libraries
- Module pattern with object literals (e.g., `const ThemeManager = { ... }`); exception: the particle engine
  (`particle-morph.js`) is an ES module with a class, because one page runs several instances
- Use `addEventListener` for event binding
- Desktop-only (mouse) features: new code checks `matchMedia('(hover: hover) and (pointer: fine)')` (a touch
  laptop with a mouse counts as desktop); older modules still use `'ontouchstart' in window` / width checks
- Use `requestAnimationFrame` for animations
- Use `IntersectionObserver` for scroll-triggered effects

## Common Tasks

### Adding a New Project to the Gablota
1. In `index.html` (`section.gablota` → `.gablota-grid`), copy an `<article class="g-tile …">`; size class
   `g-tile--xl` / `--m` / `--s` plus a grid-placement class (see the block at the end of `style.css` and `DESIGN.md`)
2. Tile = `.g-main` stretched link to the project's live site in a new tab (`/case/<slug>/` when there is none;
   `aria-label` + `data-en-aria`), `.g-shot` with a WebP screenshot
   (`width`/`height`, `alt` + `data-en-alt`), `.g-cap` with status line, name, kind, two `.g-points`, optionally one number (`.g-num-v`, `.g-num-k`, `.g-num-d`), `.g-ext` live/repo links
   (in `.g-links`), and the closing `.g-read` bar (its own link to `/case/<slug>/`) „Czytaj studium przypadku … N min →” (reading time of the case page, ~200 words/min)
3. Small tools go into the `.g-tools-list` (link to `/case/narzedzia/#<anchor>`)

### Modifying Colors
1. Edit CSS custom properties in `:root` selector in `style.css`
2. Update both light and dark mode values (dark values live in the `[data-theme="dark"]` block right after `:root`)
3. Key variables: `--color-primary` (+ `-light`, `-dark`, `-subtle`, `-glow`, `-gradient`; dark mode adds
   `--color-primary-on-dark`), `--color-accent` (+ `-light`, `-dark`, `-subtle`), `--color-burgundy*`,
   neutrals `--color-bg`, `--color-bg-alt`, `--color-bg-accent`, `--color-surface`, `--color-border*`,
   `--color-text`, `--color-text-secondary`, `--color-text-tertiary`; particle colours `--pm-*`

### Adding Dark Mode Support for New Elements
1. Add base styles in light mode
2. Add dark mode overrides under `[data-theme="dark"]` selector
3. Test by toggling theme button in navigation

### Working with the PL/EN toggle
1. Add `data-en="English text"` to any new user-facing element (or `data-en-html` if it contains markup)
2. For attributes: `data-en-aria="…"` (aria-label), `data-en-alt="…"` (image alt) or `data-en-content="…"` (meta description); the page title is `<title data-en="…">`.
   Never put `data-en` on an element that has child elements (an icon inside a link would be wiped) - wrap the text in `<span data-en>`
3. The choice persists in `localStorage` and fires a `languagechange` event for JS-built UI

## Critical Guidelines

### DO
- Preserve the British Racing Green (`#004d2b`) color scheme
- Maintain responsive design (test at mobile and desktop widths)
- Keep dark mode parity with all changes
- Use existing CSS custom properties
- Test interactive elements (Gablota tiles and links, theme & language toggles, navigation)
- Preserve the Windows 95 aesthetic elements

### DO NOT
- Add npm dependencies or build tools (keep vanilla stack)
- Remove or break the cats easter egg (`window.cats.show` / Konami code)
- Hardcode colors - use CSS variables
- Break the email obfuscation security feature
- Remove ARIA labels or accessibility features
- Add user-facing text without a `data-en` counterpart (it silently won't translate)

## Testing Checklist

Before committing changes, verify:
- [ ] Page loads without console errors
- [ ] Theme toggle works and persists on reload
- [ ] Mobile navigation opens/closes correctly
- [ ] All sections scroll smoothly
- [ ] PL/EN toggle translates every section
- [ ] Animations trigger on scroll
- [ ] Layout works at 375px, 768px, and 1440px widths
- [ ] Dark mode displays correctly

## Deployment

- **Automatic**: Push to `master` branch triggers GitHub Pages deployment
- **URL**: https://karolwilczynski.com
- **No build step**: Files are served directly

## Git Workflow

- Feature branches: `claude/[feature-name]-[id]`
- PR workflow with merge to master
- Commit messages: Descriptive, present tense

## Project Sections Reference

| Section | ID | Purpose |
|---------|-----|---------|
| Navigation | `.nav` | Logo, links, theme toggle |
| Hero | `#hero` | Introduction, Experience / Education / Skills tabs, CTA, `§ { }` particles |
| Projects | `#projekty` | Gablota band (one tile per project), Data Science bento |
| Case studies | `#studia` | The Gablota band itself; every tile links to `/case/<slug>/` |
| About | `#o-mnie` | Personal background (**hidden**, `display: none`, kept for later) |
| Skills | `#kompetencje` | Core competencies (**hidden**, kept for later) |
| Blog | `#blog` | Publication previews (**hidden**, kept for later) |
| Contact | `#kontakt` | Email (obfuscated), GitHub, LinkedIn, motto |
| Footer | `footer` | Windows 95 clock |

## Easter Eggs

The site includes hidden features:
1. **Cat photos**: `window.cats.show('Pimpek' | 'Fryderyk' | 'Both')` in the devtools console, or the Konami code (Up Up Down Down Left Right Left Right B A) on the page
2. **Windows 95 clock**: Real-time clock in footer

Preserve these features when making changes.

## Performance Notes

- No build process overhead
- Minimal external dependencies (only Google Fonts)
- Images should be optimized before adding (WebP preferred; `assets/images/` is ~3.7 MB in total)
- Use `loading="lazy"` on images below the fold
- IntersectionObserver used for efficient scroll animations
- Particle modules are fetched only after the `load` event, so they never compete with the first paint

## Case studies

- `case/<slug>/index.html`: long-form pages (problem → constraints → architecture SVG → decisions with their cost →
  evidence with source and date → lessons). Same `style.css` / `script.js` (absolute paths), styles in the
  "CASE STUDIES" block at the end of `style.css` (`.case-*`, diagram classes `.cd-*`).
- Every number on these pages must be verifiable in the project's repository and carry a date. Private repos
  (Zorza, JakiePrawo and its local variant, Urzędnik i AI, UpFor, AutoMargiela, Majeranek, AIgets.me) are never linked
  or named; public: Parawan, the small tools and the `ds-*` notebooks. No user or audience data on case pages.
- Two pages are combined: `narzedzia` (one `§` section per small tool, anchors `#claude-usage`, `#isap-scraper`,
  `#stefka`, `#anonimizator-ai`, `#clicker`, linked from the tool cards) and `analizy-danych` (ESPI + the notebooks).
- Pager ring: zorza → jakieprawo → parawan → urzednik-i-ai → upfor → automargiela → majeranek → aigets → narzedzia →
  analizy-danych → zorza.
- When adding a page: link it from its Gablota tile, the pager on the other case
  pages, `sitemap.xml` and `llms.txt`; keep the nav order Projekty, Studia przypadków, Kontakt (as on the home page).
- Each page has `TechArticle` JSON-LD with `datePublished` / `dateModified`; update `dateModified` (and the
  sitemap `lastmod`) when the text changes.
