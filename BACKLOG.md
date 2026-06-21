# Backlog

Zadania odłożone do osobnego, świadomego podejścia. Nie ruszać „przy okazji" — każde wymaga decyzji.

## 🔴 Podstrona `projekty/` — wymaga oddzielnego podejścia

Katalog `projekty/` (`projekty/index.html`, `projekty/projekty.css`, `projekty/projekty.js`)
to nowa, rozbudowana galeria projektów. **Obecnie jest nieśledzona w gicie (`?? projekty/`),
więc nigdy nie wdrożyła się na GitHub Pages i nie jest crawlowana.** Zanim wejdzie na produkcję,
trzeba podejść do niej całościowo — to nie jest zmiana „przy okazji".

### Wdrożenie i dostępność
- [ ] `git add projekty/` + commit (bez tego strona nie istnieje publicznie).
- [ ] Dodać `<url>` dla `https://karolwilczynski.com/projekty/` do `sitemap.xml`
      (changefreq monthly, priority ~0.8).
- [ ] Dodać widoczny link z głównej strony (`index.html` `.projects-footer`, ~937–942),
      np. „Wszystkie projekty →" z `data-en="All projects →"`. **Dopiero po wdrożeniu** —
      nie linkować do niewdrożonej podstrony.

### Spójność danych z galerią na stronie głównej (jedno źródło prawdy na projekt)
- [ ] Badge statusów: JakiePrawo (podstrona ALPHA vs główna BETA), Majeranek (WIP vs ALPHA).
- [ ] Biblioteka scrapująca AutoMargiela (Playwright vs Selenium).
- [ ] Liczby LOC rozjeżdżają się między stronami (~55k/~6k, ~14k/~3k).
- [ ] Przestarzały URL UpFor: `upfor.karolwilczynski.com` → `upfor.pl`
      (`projekty/index.html` ~135 pasek URL i ~172 href; por. commit 8825ece).

### Wydajność (podstrona)
- [ ] `upfor.png` (799 KB) → `../assets/images/upfor.webp` (70 KB) i usunąć osierocony PNG
      (`projekty/index.html` ~138; plik ładowany podwójnie — `<img>` + tło w `projekty.js`:340).
- [ ] `espi.png` → `../assets/images/espi.webp` (`projekty/index.html` ~474) i usunąć orphaned PNG.
- [ ] Google Fonts asynchronicznie — wzorzec preload + `media="print"` z `index.html`:108–110
      (`projekty/index.html` ~53; przy okazji dorównać wagi, brak JetBrains Mono 600).

### Dostępność / PL-EN parytet (podstrona)
- [ ] Taby przełącznika diagramów (`projekty.js` buildBlock ~363–394): obsługa klawiatury
      (Strzałki/Home/End + roving tabindex), `aria-controls`, `data-en-aria="Diagram view"`.
- [ ] `Lang.apply()` (~34–48) nie podmienia `document.title` / meta description przy zmianie języka.
- [ ] Eyebrow „PROJEKT 01 / 07" bez `data-en` (panele ~121/188/257/323/391/458/515).
- [ ] Statyczne `aria-label`-e zostają polskie w EN (~79/91/101 + panele + kropki z buildNav).
- [ ] Licznik „Prognozy ESPI / Notebooki / Koniec" nie tłumaczy się (`data-name`, syncActive ~178).
- [ ] `aria-pressed` na przełączniku motywu (`.reel-theme`, `Theme.init` ~8–18).
- [ ] Topbar: przyciski `.reel-lang`/`.reel-theme` 36px → 44px (`projekty.css` ~39–46).

### Higiena / spójność (podstrona)
- [ ] `#2e9d62` → `var(--color-primary-on-dark)` (`projekty.css` ~31/37/48/373).
- [ ] Usunąć nieużywany atrybut `data-lang` (`index.html` ~46, `projekty.js` ~36).
- [ ] Wordmark logo „KW" → marka „kpw" (`projekty/index.html` ~79).
- [ ] Udokumentować/uporządkować martwe listy `.panel-lists` (fallback no-JS zastępowany przez
      `buildBlock`, `projekty.js`:345) — komentarz lub generowanie fallbacku z `Diagrams.data`.
- [ ] Pill „Wkrótce" — ikona zegara zamiast strzałki dla stanu disabled (Majeranek, AIgets.me).
- [ ] `og:image`/`twitter:image`: dodać `?v=3`; alt wyrównać do „AI, technologia, administracja
      publiczna" (obecny wskrzesza wycofane „AI governance, legal tech"; por. commit 835be0a).

---

## Pomysły „kiedyś" (główna strona, nie pilne)
- [ ] Per-slajdowe `aria-label` karuzeli zostają polskie w EN: „1 z 5: …" (`index.html` ~385–693)
      i „Szczegóły: …" na tablistach slajdów. `aria-roledescription` już usunięto; pełne
      tłumaczenie wymaga mechanizmu `data-aria-en` (jak na podstronie `projekty/`). Niska waga.
- [ ] Wyeksportować avatar `karol-photo.jpg` (904×916) jako ~320×320 WebP (<15 KB) —
      renderowany 160×160, `fetchpriority=high`, to najcięższy obraz above-the-fold.
- [ ] Drugi zrzut do mini-galerii UpFor (TODO w `index.html` ~476–477); przy okazji
      `aria-pressed` na aktywnej miniaturze.
- [ ] Rozważyć wspólny moduł `prefs.js` (theme/lang) współdzielony z podstroną `projekty/`.
