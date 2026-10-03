# CLAUDE.md

This file provides guidance for AI assistants working on this repository.

## Project Overview

**karolwilczynski.com** is a personal portfolio website for Karol Polikarp Wilczynski, showcasing work at the intersection of AI governance, legal technology, and public administration in Poland.

- **Type**: Static portfolio website
- **Stack**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Hosting**: GitHub Pages (auto-deploys from master branch)
- **Language**: Polish (pl_PL) with English project descriptions

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
# or simply open index.html directly
```

## File Structure

```
/
├── index.html      # Main HTML (~1550 lines) - All page content and structure
├── style.css       # Styles (~4800 lines) - Complete design system
├── script.js       # JavaScript (~1280 lines) - Interactive functionality
├── particle-morph.js # Particle morphing engine (ES module, // @ts-check) - see "Animations"
├── particles.js    # The hero + contact particle scenes (ES module, loaded after page load)
├── 404.html        # Custom 404 page (Polish)
├── case/<slug>/index.html # Case-study subpages (zorza, jakieprawo, parawan, urzednik-i-ai) - see "Case studies"
├── robots.txt      # Search engine crawl rules
├── sitemap.xml     # XML sitemap for SEO
├── README.md       # Project documentation for humans
├── CLAUDE.md       # This file - AI assistant guidance
└── assets/
    └── images/     # Project screenshots, profile photos, easter egg images
```

## Key Files & Their Purposes

### index.html
- Complete page structure with semantic HTML5
- Sections: nav, hero, projects, about, skills, blog, contact, footer
- SEO meta tags (Open Graph, Twitter Cards)
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
1. **ThemeManager** - Dark/light mode with localStorage persistence
2. **Mobile Navigation** - Hamburger menu toggle
3. **Smooth Scroll** - Anchor link behavior
4. **ScrollAnimations** - IntersectionObserver-based reveals
5. **MagneticButtons** - Interactive hover effects (desktop only)
6. **Navbar Scroll Effect** - Adds `.nav-scrolled` class at 100px scroll
7. **Windows 95 Clock** - Footer time display
8. **LanguageManager** - Live PL/EN toggle via `data-en` / `data-en-html` attributes (also `<title data-en>`,
   `data-en-content` on the meta description, `data-en-aria` for `aria-label`)
9. **HeroTabs** - Experience / Education / Skills tab panels (keyboard-navigable)
10. **ProjectShowcase** - Projects carousel (tabs, dots, autoplay w/ pause, swipe)
11. **EmailProtection** - Anti-scraper email obfuscation
12. **cats easter egg** - `window.cats.show()` + Konami code
13. **NumberScramble** - Numbers marked `<span class="scramble-num">` in the HTML (PL and `data-en-html`) roll
    through `§¶{}<>/01#` when scrolled into view (painted over the real number from a CSS `::after`)
14. **ScrollProgress** - JS fallback for the gold scroll-progress bar under the nav
15. **Particles loader** - `import('/particles.js')` after the `load` event, only on pages with a particle canvas

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
- **Contact finale** (`.contact-finale` + `#finaleParticles`): `§` splits into `§ … { }` when scrolled into view,
  above the motto „Od paragrafu do parametru.” (`data-en-html`: one serif, „paragrafu” in the colour of `§`,
  „parametru” in the colour of `{ }`). A static HTML formula is the no-JS fallback.
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
- Typecheck/lint the modules with `deno check particle-morph.js particles.js` and `deno lint` (no config needed).
- When changing `particle-morph.js`, bump the `?v=` in its import inside `particles.js`; when changing
  `particles.js`, bump the `?v=` in the loader at the end of `script.js`.

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

### Adding a New Project Card
1. Add HTML in `index.html` within `#projekty` section
2. Copy existing `.project-card` structure
3. Add image to `assets/images/`
4. Ensure card has proper animation class (`fade-in-up`)

### Modifying Colors
1. Edit CSS custom properties in `:root` selector in `style.css`
2. Update both light and dark mode values
3. Key variables: `--primary`, `--primary-light`, `--primary-dark`, `--accent`, `--gold`

### Adding Dark Mode Support for New Elements
1. Add base styles in light mode
2. Add dark mode overrides under `[data-theme="dark"]` selector
3. Test by toggling theme button in navigation

### Working with the PL/EN toggle
1. Add `data-en="English text"` to any new user-facing element (or `data-en-html` if it contains markup)
2. For attributes: `data-en-aria="…"` (aria-label) or `data-en-content="…"` (meta description); the page title is `<title data-en="…">`.
   Never put `data-en` on an element that has child elements (an icon inside a link would be wiped) - wrap the text in `<span data-en>`
3. The choice persists in `localStorage` and fires a `languagechange` event for JS-built UI

## Critical Guidelines

### DO
- Preserve the British Racing Green (`#004d2b`) color scheme
- Maintain responsive design (test at mobile and desktop widths)
- Keep dark mode parity with all changes
- Use existing CSS custom properties
- Test interactive elements (carousel, theme & language toggles, navigation)
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
| Hero | `#hero` | Introduction, keywords, CTA |
| Projects | `#projekty` | Portfolio showcase |
| Case studies | `#studia` | Cards linking to `/case/<slug>/` |
| About | `#o-mnie` | Personal background |
| Skills | `#kompetencje` | Core competencies |
| Blog | `#blog` | Publication previews |
| Contact | `#kontakt` | Email, newsletter |
| Footer | `footer` | Windows 95 clock |

## Easter Eggs

The site includes hidden features:
1. **Cat photos**: `window.cats.show('Pimpek' | 'Fryderyk' | 'Both')` in the devtools console, or the Konami code (Up Up Down Down Left Right Left Right B A) on the page
2. **Windows 95 clock**: Real-time clock in footer

Preserve these features when making changes.

## Performance Notes

- No build process overhead
- Minimal external dependencies (only Google Fonts)
- Images should be optimized before adding (current total ~12MB)
- Use `loading="lazy"` on images below the fold
- IntersectionObserver used for efficient scroll animations
- Particle modules are fetched only after the `load` event, so they never compete with the first paint

## Case studies

- `case/<slug>/index.html`: long-form pages (problem → constraints → architecture SVG → decisions with their cost →
  evidence with source and date → lessons). Same `style.css` / `script.js` (absolute paths), styles in the
  "CASE STUDIES" block at the end of `style.css` (`.case-*`, diagram classes `.cd-*`).
- Every number on these pages must be verifiable in the project's repository and carry a date. Private repos
  (Zorza, JakiePrawo, Urzędnik i AI) are never linked or named; only Parawan's code is public.
- When adding a page: link it from the `#studia` cards, the project's carousel CTA, the pager on the other case
  pages, `sitemap.xml` and `llms.txt`.
