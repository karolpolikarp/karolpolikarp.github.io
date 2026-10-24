# DESIGN.md — karolwilczynski.com

Source of truth for visual decisions. Tokens live in `style.css` (`:root` + `[data-theme="dark"]`).

## Identity (do not change without the author)
- **Colours:** British Racing Green `--color-primary` #004d2b, gold `--color-accent` #c9a962, warm cream
  neutrals (`--color-bg` #fdfcfa). Dark theme keeps the same roles on near-black (#12100d).
- **Phthalo green (accent only):** `--color-phthalo` #123524, `--color-phthalo-mid` #1d5c43,
  `--color-phthalo-light` #3a9a70 — selection, scrollbar, logo sparkle, primary-button gradient, the short
  rule under section titles, tile hover/focus edge (light theme), status badges, speaking-role badges.
  Never as a page ground (the author rejected green grounds that drift to blue/grey). No cyan/mint.
- **Type:** Playfair Display (names, headings), DM Sans (text, UI), JetBrains Mono (numbers, measurements
  and code only — not as decoration).
- **Signature:** the § → { } particle sign in the hero and the contact finale, motto „Od paragrafu do
  parametru”. Win95 clock + Start button in the footer.

## Sections
- **Hero:** name, claim, photo, Experience / Education / Skills tabs. Untouched by later polish passes.
- **Projekty → „Gablota” (`section.gablota#studia`):** one full-bleed deep-green band (dark in both
  themes: `--g-field`), a 12-column bento of exhibit tiles. Every project appears once. A tile =
  real screenshot (the lit object; a short silent clip plays over it on hover, `data-video`) + badges
  (status in gold outline, then 2–3 stack chips) + name in Playfair + one-line kind in gold + one
  decision sentence with 1–2 key phrases in gold (`.g-hl`) + one number (Playfair gold value, label
  with source and date in DM Sans). The whole tile links to
  `/case/<slug>/` (stretched `.g-main` link with an aria-label); live site / repo are small `.g-ext`
  links above it („Strona projektu” where the app itself is not open). Order: law and public
  administration first — Urzędnik i AI + JakiePrawo.pl, then Zorza + Parawan, then AutoMargiela,
  UpFor.pl, Majeranek, then AIgets.me + the small-tools list (`/case/narzedzia/#<anchor>`).
- **Wystąpienia (`#wystapienia`):** dot-matrix map of Europe (static inline SVG generated offline from
  Natural Earth 1:50m, gold pins sized by event count; sticky on the right on desktop, on top on mobile)
  next to the list by year (big Playfair year numeral). Item = date tile (Playfair day + month; ranges,
  „od”, month-only in italics) + role badge (speaking: green pill; expert roles: gold square tag;
  attendance/delegation: dashed outline) + city with a pin dot + event in Playfair + topic. Pins drop in
  once on scroll; hovering an event lights its pin and vice versa (`TalksMap`).
- **Data Science:** green bento tiles with the notebook screenshot under a green veil (author's choice —
  keep the veil).
- **Contact + footer:** unchanged.

## Rules
- Contrast ≥ 4.5:1 for text in both themes. Gold is a foreground only on dark fields; on cream use
  `--color-primary`. Focus ring: `--color-focus` (green on light, gold on dark).
- Badges are welcome (author's preference) but sentence case, small and few: one status + up to
  three stack chips per tile; never uppercase pill rows.
- The author dislikes grey (mono) small print: labels in DM Sans at near-full ink, not grey mono.
- No sparkles/AI glyphs, no eyebrow labels above headings, no gradient top stripes on cards, no
  icon-tile + h3 + text card grids.
- Motion: one authored moment per element — tile screenshot scales 1.03 and caption lifts 3px on
  hover/focus (200 ms, ease-out `cubic-bezier(0.23,1,0.32,1)`); nothing under `prefers-reduced-motion`.
- Every visible string has a `data-en` / `data-en-html` / `data-en-aria` / `data-en-alt` counterpart.
