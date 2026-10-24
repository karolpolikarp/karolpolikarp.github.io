# DESIGN.md — karolwilczynski.com

Source of truth for visual decisions. Tokens live in `style.css` (`:root` + `[data-theme="dark"]`).

## Identity (do not change without the author)
- **Colours:** British Racing Green `--color-primary` #004d2b, gold `--color-accent` #c9a962, warm cream
  neutrals (`--color-bg` #fdfcfa). Dark theme keeps the same roles on near-black (#12100d).
- **Type:** Playfair Display (names, headings), DM Sans (text, UI), JetBrains Mono (numbers, measurements
  and code only — not as decoration).
- **Signature:** the § → { } particle sign in the hero and the contact finale, motto „Od paragrafu do
  parametru”. Win95 clock + Start button in the footer.

## Sections
- **Hero:** name, claim, photo, Experience / Education / Skills tabs. Untouched by later polish passes.
- **Projekty → „Gablota” (`section.gablota#studia`):** one full-bleed deep-green band (dark in both
  themes: `--g-field`), a 12-column bento of exhibit tiles. Every project appears once. A tile =
  real screenshot (the lit object) + name in Playfair + optional one-line kind in gold + one decision
  sentence from the case study + one number (gold mono value, muted label). The whole tile links to
  `/case/<slug>/` (stretched `.g-main` link with an aria-label); live site / repo are small `.g-ext`
  links above it. Hierarchy by size: Zorza, JakiePrawo.pl large; Urzędnik i AI tall; then medium tiles;
  small tools as one 3×2 list linking to `/case/narzedzia/#<anchor>`.
- **Data Science:** green bento tiles with the notebook screenshot under a green veil (author's choice —
  keep the veil).
- **Contact + footer:** unchanged.

## Rules
- Contrast ≥ 4.5:1 for text in both themes. Gold is a foreground only on dark fields; on cream use
  `--color-primary`. Focus ring: `--color-focus` (green on light, gold on dark).
- Tech stack as plain text („TypeScript · Fastify”), never a row of uppercase pills.
- No sparkles/AI glyphs, no eyebrow labels above headings, no gradient top stripes on cards, no
  icon-tile + h3 + text card grids, no badge soup.
- Motion: one authored moment per element — tile screenshot scales 1.03 and caption lifts 3px on
  hover/focus (200 ms, ease-out `cubic-bezier(0.23,1,0.32,1)`); nothing under `prefers-reduced-motion`.
- Every visible string has a `data-en` / `data-en-html` / `data-en-aria` / `data-en-alt` counterpart.
