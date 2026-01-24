# CLAUDE.md

This file provides guidance for AI assistants working on this repository.

## Project Overview

**karolpolikarp.github.io** is a personal portfolio website for Karol Polikarp Wilczynski, showcasing work at the intersection of AI governance, legal technology, and public administration in Poland.

- **Type**: Static portfolio website
- **Stack**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Hosting**: GitHub Pages (auto-deploys from master branch)
- **Language**: Polish (pl_PL) with English project descriptions

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
├── index.html      # Main HTML (937 lines) - All page content and structure
├── style.css       # Styles (3127 lines) - Complete design system
├── script.js       # JavaScript (690 lines) - Interactive functionality
├── README.md       # Project documentation for humans
├── CLAUDE.md       # This file - AI assistant guidance
└── assets/
    └── images/     # Project screenshots, profile photos, easter egg images
```

## Key Files & Their Purposes

### index.html
- Complete page structure with semantic HTML5
- Sections: nav, hero, projects, about, skills, stack, blog, contact, footer
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
2. **ParallaxEffect** - Floating background shapes (desktop only)
3. **Mobile Navigation** - Hamburger menu toggle
4. **Smooth Scroll** - Anchor link behavior
5. **Counter Animation** - Animated statistics with requestAnimationFrame
6. **ScrollAnimations** - IntersectionObserver-based reveals
7. **MagneticButtons** - Interactive hover effects (desktop only)
8. **Navbar Scroll Effect** - Adds `.nav-scrolled` class at 100px scroll
9. **Windows 95 Clock** - Footer time display
10. **LegalConsole** - Interactive terminal simulator with command parsing
11. **EmailProtection** - Anti-scraper email obfuscation

## Coding Conventions

### HTML
- Use semantic elements (`<section>`, `<article>`, `<nav>`, etc.)
- Include ARIA labels on interactive elements
- Keep Polish language content; English for code/technical terms
- Classes use kebab-case (e.g., `hero-content`, `project-card`)

### CSS
- Use CSS custom properties for colors, not hardcoded values
- Follow existing naming: `.section-name`, `.section-name-element`
- Mobile-first approach with `@media (min-width: 768px)` for desktop
- Transitions use `var(--transition-base)` (250ms)
- Maintain dark mode support: always add `[data-theme="dark"]` variants

### JavaScript
- Vanilla ES6+ only - no frameworks or libraries
- Module pattern with object literals (e.g., `const ThemeManager = { ... }`)
- Use `addEventListener` for event binding
- Desktop-only features check for touch: `'ontouchstart' in window`
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

### Adding Console Commands
1. Edit `LegalConsole` object in `script.js`
2. Add command pattern to `commands` array with regex and response
3. Follow existing pattern: `{ pattern: /regex/i, response: 'output text' }`

## Critical Guidelines

### DO
- Preserve the British Racing Green (`#004d2b`) color scheme
- Maintain responsive design (test at mobile and desktop widths)
- Keep dark mode parity with all changes
- Use existing CSS custom properties
- Test interactive elements (console, theme toggle, navigation)
- Preserve the Windows 95 aesthetic elements

### DO NOT
- Add npm dependencies or build tools (keep vanilla stack)
- Remove or break the LegalConsole easter eggs (cats.show command)
- Hardcode colors - use CSS variables
- Break the email obfuscation security feature
- Remove ARIA labels or accessibility features
- Add English translations (site is intentionally in Polish)

## Testing Checklist

Before committing changes, verify:
- [ ] Page loads without console errors
- [ ] Theme toggle works and persists on reload
- [ ] Mobile navigation opens/closes correctly
- [ ] All sections scroll smoothly
- [ ] Legal console responds to commands
- [ ] Animations trigger on scroll
- [ ] Layout works at 375px, 768px, and 1440px widths
- [ ] Dark mode displays correctly

## Deployment

- **Automatic**: Push to `master` branch triggers GitHub Pages deployment
- **URL**: https://karolpolikarp.github.io
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
| Legal Console | `.console-window` | Interactive terminal |
| Projects | `#projekty` | Portfolio showcase |
| About | `#o-mnie` | Personal background |
| Skills | `#kompetencje` | Core competencies |
| Tech Stack | `#stack` | Tools and technologies |
| Blog | `#blog` | Publication previews |
| Contact | `#kontakt` | Email, newsletter |
| Footer | `footer` | Windows 95 clock |

## Easter Eggs

The site includes hidden features:
1. **Cat photos**: `cats.show('Pimpek')`, `cats.show('Fryderyk')`, `cats.show('Both')` in console
2. **Windows 95 clock**: Real-time clock in footer
3. **Auto-demo**: Console types commands automatically on page load

Preserve these features when making changes.

## Performance Notes

- No build process overhead
- Minimal external dependencies (only Google Fonts)
- Images should be optimized before adding (current total ~23MB)
- Use `loading="lazy"` on images below the fold
- IntersectionObserver used for efficient scroll animations
