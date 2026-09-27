// @ts-check
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="esnext" />

/*
 * particles.js — the two particle scenes of the site (decoration only, aria-hidden canvases):
 *   hero:    dust gathers into "§", then "{ § }", and settles as "§" on the left, "{ }" on the right
 *   contact: the finale — "§" splits into "§ … { }" when the section comes into view
 * Serif (Playfair Display) = law, mono (JetBrains Mono) = code.
 * Colours come from --pm-* custom properties (style.css), so both themes are covered.
 */

import { createMorph, INK } from './particle-morph.js?v=10';

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', 'Fira Code', Consolas, monospace";
const COLOR_VARS = ['--pm-0', '--pm-1'];
const BRACE = 0.4;   // braces sit ±0.4 em around the centre of "{ }"

/**
 * The final sign: "§" (law) on the left and "{ }" (code) on the right — no arrow between them.
 * The braces are drawn one by one around xCode, so their spacing does not depend on the font.
 * @param {CanvasRenderingContext2D} c @param {number} xPara @param {number} xCode @param {number} cy @param {number} size
 */
function pair(c, xPara, xCode, cy, size) {
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = INK[0];
    c.font = `700 ${size}px ${SERIF}`;
    c.fillText('§', xPara, cy + size * 0.04);
    c.fillStyle = INK[1];
    c.font = `600 ${size}px ${MONO}`;
    const d = size * BRACE;
    c.fillText('{', xCode - d, cy);
    c.fillText('}', xCode + d, cy);
}

/** @param {CanvasRenderingContext2D} c @param {number} cx @param {number} cy @param {number} size */
function section(c, cx, cy, size) {
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = INK[0];
    c.font = `700 ${size}px ${SERIF}`;
    c.fillText('§', cx, cy + size * 0.04);
}

/** @param {CanvasRenderingContext2D} c @param {number} cx @param {number} cy @param {number} size */
function braced(c, cx, cy, size) {
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = INK[1];
    c.font = `500 ${size * 1.05}px ${MONO}`;
    c.fillText('{', cx - size * 0.72, cy);
    c.fillText('}', cx + size * 0.72, cy);
    section(c, cx, cy, size);
}

/** Resolves once the page (incl. the async font stylesheet) and the glyphs are ready, or after 2.5 s. */
async function fontsReady() {
    if (document.readyState !== 'complete') {
        await new Promise(r => addEventListener('load', r, { once: true }));
    }
    const load = Promise.all([
        document.fonts.load(`700 100px ${SERIF}`, '§'),
        document.fonts.load(`500 100px ${MONO}`, '{}'),
        document.fonts.load(`600 100px ${MONO}`, '{}')
    ]).catch(() => []);
    await Promise.race([load, new Promise(r => setTimeout(r, 2500))]);
}

/** @param {() => void} fn */
function idle(fn) {
    if ('requestIdleCallback' in globalThis) requestIdleCallback(fn, { timeout: 1500 });
    else setTimeout(fn, 200);
}

/**
 * Ink extents of the final sign per 1 px of font size, measured with the real fonts
 * (left/right of the glyph centre, top/bottom of the line centre).
 * @typedef {{ l: number, r: number, t: number, b: number }} Ext
 * @returns {{ para: Ext, code: Ext }}
 */
function signExtents() {
    /** @type {{ para: Ext, code: Ext }} */
    const fallback = { para: { l: 0.28, r: 0.28, t: 0.42, b: 0.5 }, code: { l: 0.62, r: 0.62, t: 0.5, b: 0.5 } };
    const c = document.createElement('canvas').getContext('2d');
    if (!c) return fallback;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = `700 100px ${SERIF}`;
    const p = c.measureText('§');
    c.font = `600 100px ${MONO}`;
    const o = c.measureText('{');
    const e = c.measureText('}');
    const para = { l: p.actualBoundingBoxLeft / 100, r: p.actualBoundingBoxRight / 100, t: p.actualBoundingBoxAscent / 100 - 0.04, b: p.actualBoundingBoxDescent / 100 + 0.04 };
    const code = {
        l: BRACE + o.actualBoundingBoxLeft / 100,
        r: BRACE + e.actualBoundingBoxRight / 100,
        t: Math.max(o.actualBoundingBoxAscent, e.actualBoundingBoxAscent) / 100,
        b: Math.max(o.actualBoundingBoxDescent, e.actualBoundingBoxDescent) / 100
    };
    const sane = (/** @type {Ext} */ x) => [x.l, x.r, x.t, x.b].every(v => Number.isFinite(v) && v > 0 && v < 2);
    return sane(para) && sane(code) ? { para, code } : fallback;
}

/**
 * Everything the final sign must keep clear of, in canvas pixels: the lines of text, the photo,
 * the buttons and the whole timeline column (its height covers every tab).
 * @param {HTMLCanvasElement} hero
 * @returns {number[][]} [x0, y0, x1, y1] boxes
 */
function heroObstacles(hero) {
    const base = hero.getBoundingClientRect();
    /** @type {number[][]} */
    const out = [];
    /** @param {DOMRect} r */
    const add = r => {
        if (r.width && r.height) out.push([r.left - base.left, r.top - base.top, r.right - base.left, r.bottom - base.top]);
    };
    const range = document.createRange();
    document.querySelectorAll('#hero .hero-greeting, #hero .hero-title, #hero .hero-subtitle').forEach(el => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if (!(n.nodeValue ?? '').trim()) continue;
            range.selectNodeContents(n);
            for (const r of range.getClientRects()) add(r);
        }
    });
    document.querySelectorAll('#hero .hero-avatar, #hero .greeting-line, #hero .hero-cta a, #hero .hero-visual')
        .forEach(el => add(el.getBoundingClientRect()));
    return out;
}

/**
 * Finds a free spot for the final sign. Prefers the two side margins of wide screens — "§" and "{ }"
 * mirrored: the same distance from the left and the right edge, "{ }" centred in its margin with room
 * to breathe — as long as the sign is big enough there; otherwise both side by side in one shared
 * empty area (under the buttons, next to the greeting). Returns null when nothing reasonably big fits.
 * @param {number} cw @param {number} ch @param {number} top  first usable y (below the fixed nav)
 * @param {number[][]} obstacles
 * @returns {{ xp: number, xt: number, y: number, size: number } | null}
 */
function freeSpot(cw, ch, top, obstacles) {
    const E = signExtents();
    const pad = 22;      // clearance around text and controls
    const edge = 14;     // clearance from the canvas edges
    const breathe = 0.15; // "{ }" keeps at least this share of its margin free on each side
    const sMax = Math.min(ch * 0.55, 480);
    const sMin = 96;
    const sMargins = 120;  // smallest sign worth splitting into the margins (depends only on the columns,
                           // so PL and EN always agree)

    /**
     * Largest size (then closest to the middle of the hero) at which `place` finds room.
     * @param {(free: number[][], s: number) => { xp: number, xt: number } | null} place
     */
    const search = place => {
        // a fixed ladder of sizes (not one starting at sMax), so a slightly taller or shorter hero
        // (another language) cannot tip a size over the threshold
        for (let s = 480; s >= sMin; s *= 0.94) {
            if (s > sMax) continue;
            const up = Math.max(E.para.t, E.code.t) * s;
            const down = Math.max(E.para.b, E.code.b) * s;
            /** @type {{ xp: number, xt: number, y: number, size: number } | null} */
            let best = null;
            let bestScore = Infinity;
            for (let y = top + pad + up; y + down + edge <= ch; y += 6) {
                const y0 = y - up - pad;
                const y1 = y + down + pad;
                const spans = obstacles.filter(o => o[1] < y1 && o[3] > y0).map(o => [o[0] - pad, o[2] + pad]).sort((a, b) => a[0] - b[0]);
                /** @type {number[][]} */
                const free = [];
                let x = edge;
                for (const [a, b] of spans) {
                    if (a > x) free.push([x, a]);
                    x = Math.max(x, b);
                }
                if (cw - edge > x) free.push([x, cw - edge]);
                const spot = place(free, s);
                const score = Math.abs(y - (top + ch) / 2);
                if (spot && score < bestScore) {
                    bestScore = score;
                    best = { ...spot, y, size: s };
                }
            }
            if (best) return best;
        }
        return null;
    };

    // the side margins: empty areas touching the left and the right edge
    const margins = search((free, s) => {
        const left = free[0];
        const right = free[free.length - 1];
        if (!left || left === right || left[0] !== edge || right[1] !== cw - edge) return null;
        const mL = left[1] + pad;            // left edge -> content
        const mR = cw - (right[0] - pad);    // timeline -> right edge
        const wp = (E.para.l + E.para.r) * s;
        const wc = (E.code.l + E.code.r) * s;
        const g = (mR - wc) / 2;             // "{ }" centred in its margin: g on both sides
        if (g < breathe * mR || g + wp + pad > mL) return null;
        // mirrored: the ink of "§" starts g from the left edge, the ink of "{ }" ends g from the right one
        return { xp: g + E.para.l * s, xt: cw - g - E.code.r * s };
    });

    // one shared area, the pair centred in it
    const shared = search((free, s) => {
        const wp = (E.para.l + E.para.r) * s;
        const wc = (E.code.l + E.code.r) * s;
        const gap = 0.5 * s;
        const one = free.find(iv => iv[1] - iv[0] >= wp + gap + wc);
        if (!one) return null;
        const x0 = (one[0] + one[1] - (wp + gap + wc)) / 2;
        return { xp: x0 + E.para.l * s, xt: x0 + wp + gap + E.code.l * s };
    });

    return margins && (margins.size >= sMargins || !shared) ? margins : shared;
}

/**
 * Hero geometry in canvas pixels, measured from the real layout.
 * @param {HTMLCanvasElement} hero
 */
function heroLayout(hero) {
    const cw = Math.max(1, Math.round(hero.clientWidth));
    const ch = Math.max(1, Math.round(hero.clientHeight));
    const narrow = matchMedia('(max-width: 768px)').matches;
    // the intro (and the phone layout) use a fixed design box fitted into the canvas
    const DW = narrow ? 800 : 1600;
    const DH = 900;
    const s = Math.min(cw / DW, ch / DH);
    const ox = (cw - DW * s) / 2;
    const oy = (ch - DH * s) * (narrow ? 0.14 : 0.5);
    const intro = { cx: ox + (DW / 2) * s, cy: oy + DH * 0.51 * s, big: 620 * s, braced: (narrow ? 330 : 400) * s };
    // phones: the sign sits behind the name (particles over text are dimmed)
    /** @type {{ xp: number, xt: number, y: number, size: number } | null} */
    let fin = null;
    if (!narrow) {
        const nav = document.querySelector('.nav');
        fin = freeSpot(cw, ch, nav ? nav.getBoundingClientRect().height : 0, heroObstacles(hero));
    }
    fin ??= { xp: ox + 240 * s, xt: ox + 560 * s, y: oy + DH * 0.51 * s, size: 280 * s };
    const key = [cw, ch, fin.xp, fin.xt, fin.y, fin.size].map(Math.round).join(',');
    return { cw, ch, intro, fin, key };
}

/**
 * Hero scene: dust -> "§" -> "{ § }" -> "§ … { }", then a quiet watermark.
 * @param {HTMLCanvasElement} hero @param {ReturnType<typeof heroLayout>} L
 * @param {boolean} settled  start on the final sign (rebuild after a layout change)
 */
function heroScene(hero, L, settled) {
    return createMorph(hero, {
        width: L.cw,          // design space = canvas pixels, so shapes can follow the layout
        height: L.ch,
        shapes: [
            c => section(c, L.intro.cx, L.intro.cy, L.intro.big),
            c => braced(c, L.intro.cx, L.intro.cy, L.intro.braced),
            c => pair(c, L.fin.xp, L.fin.xt, L.fin.y, L.fin.size)
        ],
        count: 1500,
        mobileCount: 700,
        dust: 260,
        mobileDust: 110,
        colorVars: COLOR_VARS,
        dustVar: '--pm-dust',
        maxDpr: 1.5,
        trail: 0.5,       // short trails: the streaks vanish quickly
        // a grand entrance, then the sign recedes into a quiet watermark
        fadeIn: 1.6,
        settle: { after: 1.6, factor: 0.7, duration: 2.2 },
        // particles fade to a whisper behind the text, so every line stays readable
        quiet: {
            selector: '#hero .hero-greeting, #hero .hero-avatar, #hero .hero-title, #hero .hero-subtitle, ' +
                '#hero .hero-cta a, #hero .hero-tabs, #hero .hero-tab-panel.active li, ' +
                '#hero .hero-tab-panel.active .skills-bento-card',
            factor: 0.22,
            pad: 6
        },
        pointerTarget: hero.closest('section') ?? hero,
        sequence: [{ shape: 0, at: 0 }, { shape: 1, at: 2.2 }, { shape: 2, at: 4.4 }],
        startSettled: settled
    });
}

/** @param {HTMLCanvasElement} finale */
function finaleScene(finale) {
    return createMorph(finale, {
        width: 1600,
        height: 560,
        shapes: [
            c => section(c, 800, 280, 400),
            c => pair(c, 520, 1080, 280, 320)
        ],
        count: 1200,
        mobileCount: 600,
        dust: 140,
        mobileDust: 60,
        colorVars: COLOR_VARS,
        dustVar: '--pm-dust',
        maxDpr: 2,
        trail: 0.6,
        pointerTarget: finale.parentElement ?? finale,
        startOnVisible: true,
        sequence: [{ shape: 0, at: 0 }, { shape: 1, at: 1.8 }]
    });
}

/** @param {HTMLCanvasElement} hero */
function initHero(hero) {
    let L = heroLayout(hero);
    let scene = heroScene(hero, L, false);
    hero.classList.add('is-live');
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let timer;
    const ro = new ResizeObserver(() => check(300));
    const panels = document.querySelector('#hero .hero-tab-panels');
    const mo = new MutationObserver(() => check(400));   // after the panel slide-in
    const onLang = () => check(50);
    const stop = () => {
        clearTimeout(timer);
        ro.disconnect();
        mo.disconnect();
        document.removeEventListener('languagechange', onLang);
    };
    // the sign follows the layout: rebuild (already settled) whenever its spot moves — resize,
    // rotation, a longer translation or another tab; otherwise only re-read the text zones
    /** @param {number} delay */
    function check(delay) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            try {
                const next = heroLayout(hero);
                if (next.key === L.key) {
                    scene.refresh();
                    return;
                }
                scene.destroy();
                L = next;
                scene = heroScene(hero, L, true);
            } catch {
                // the canvas can no longer be read back: drop the effect, keep the page as it is
                stop();
                scene.destroy();
                hero.classList.remove('is-live');
            }
        }, delay);
    }
    ro.observe(hero);
    if (panels) mo.observe(panels, { subtree: true, attributes: true, attributeFilter: ['class'] });
    document.addEventListener('languagechange', onLang);
}

async function init() {
    const hero = /** @type {HTMLCanvasElement | null} */ (document.getElementById('heroParticles'));
    const finale = /** @type {HTMLCanvasElement | null} */ (document.getElementById('finaleParticles'));
    if (!hero && !finale) return;
    await fontsReady();

    idle(() => {
        // createMorph throws when the canvas can't be read back (anti-fingerprinting); the page
        // then simply keeps its static look — the contact formula fallback stays visible
        try {
            if (hero) initHero(hero);
        } catch {
            hero?.classList.remove('is-live');
        }
        try {
            if (finale) {
                finaleScene(finale);
                finale.parentElement?.classList.add('is-live');
            }
        } catch {
            finale?.parentElement?.classList.remove('is-live');
        }
    });
}

init();
