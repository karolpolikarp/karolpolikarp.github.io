// @ts-check
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="esnext" />

/*
 * particles.js — the two particle scenes of the site (decoration only, aria-hidden canvases):
 *   hero:    dust gathers into "§", then "{ § }", and settles as "§" on the left, "θ" on the right
 *   contact: the finale — "§" splits into "§ … θ" when the section comes into view
 * Serif (Playfair Display) = law, mono (JetBrains Mono) = code.
 * Colours come from --pm-* custom properties (style.css), so both themes are covered.
 */

import { createMorph, INK } from './particle-morph.js?v=5';

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const MONO = "'JetBrains Mono', 'Fira Code', Consolas, monospace";
const COLOR_VARS = ['--pm-0', '--pm-1'];

/**
 * The final sign: "§" (law) on the left and "θ" (parameter) on the right — no arrow between them.
 * @param {CanvasRenderingContext2D} c @param {number} xPara @param {number} xTheta @param {number} cy @param {number} size
 */
function pair(c, xPara, xTheta, cy, size) {
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = INK[0];
    c.font = `700 ${size}px ${SERIF}`;
    c.fillText('§', xPara, cy + size * 0.04);
    c.fillStyle = INK[1];
    c.font = `600 ${size}px ${MONO}`;
    c.fillText('θ', xTheta, cy);
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
        document.fonts.load(`600 100px ${MONO}`, 'θ')
    ]).catch(() => []);
    await Promise.race([load, new Promise(r => setTimeout(r, 2500))]);
}

/** @param {() => void} fn */
function idle(fn) {
    if ('requestIdleCallback' in globalThis) requestIdleCallback(fn, { timeout: 1500 });
    else setTimeout(fn, 200);
}

/**
 * Hero geometry in canvas pixels, measured from the real layout.
 * Final sign: on wide screens "§" sits in the empty margin left of the content and "θ" in the margin
 * on the right; where there are no margins, both sit in the gap between the name and the timeline
 * (on phones: behind the name).
 * @param {HTMLCanvasElement} hero
 */
function heroLayout(hero) {
    const cw = Math.max(1, Math.round(hero.clientWidth));
    const ch = Math.max(1, Math.round(hero.clientHeight));
    const narrow = matchMedia('(max-width: 768px)').matches;
    // fallback: the fixed design box of the previous layout, fitted into the canvas
    const DW = narrow ? 800 : 1600;
    const DH = 900;
    const s = Math.min(cw / DW, ch / DH);
    const ox = (cw - DW * s) / 2;
    const oy = (ch - DH * s) * (narrow ? 0.14 : 0.5);
    const intro = { cx: ox + (DW / 2) * s, cy: oy + DH * 0.51 * s, big: 620 * s, braced: (narrow ? 330 : 400) * s };
    let fin = narrow
        ? { xp: ox + 240 * s, xt: ox + 560 * s, y: oy + DH * 0.51 * s, size: 300 * s }
        : { xp: ox + 610 * s, xt: ox + 905 * s, y: oy + DH * 0.5 * s, size: 300 * s };
    const content = document.querySelector('#hero .hero-content');
    const visual = document.querySelector('#hero .hero-visual');
    const box = document.querySelector('#hero .container');
    if (!narrow && content && visual && box) {
        const base = hero.getBoundingClientRect();
        const left = content.getBoundingClientRect().left - base.left;
        const right = base.right - visual.getBoundingClientRect().right;
        const margin = Math.min(left, right);
        if (margin >= 190) {
            const b = box.getBoundingClientRect();
            fin = {
                xp: left / 2,
                xt: cw - right / 2,
                y: b.top + b.height / 2 - base.top,
                size: Math.min(margin * 1.45, ch * 0.55)
            };
        }
    }
    return { cw, ch, intro, fin };
}

/**
 * Hero scene: dust -> "§" -> "{ § }" -> "§ … θ", then a quiet watermark.
 * @param {HTMLCanvasElement} hero @param {boolean} settled  start on the final sign (after a resize)
 */
function heroScene(hero, settled) {
    const L = heroLayout(hero);
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

async function init() {
    const hero = /** @type {HTMLCanvasElement | null} */ (document.getElementById('heroParticles'));
    const finale = /** @type {HTMLCanvasElement | null} */ (document.getElementById('finaleParticles'));
    if (!hero && !finale) return;
    await fontsReady();

    idle(() => {
        // createMorph throws when the canvas can't be read back (anti-fingerprinting); the page
        // then simply keeps its static look — the contact formula fallback stays visible
        try {
            if (hero) {
                let scene = heroScene(hero, false);
                hero.classList.add('is-live');
                // the sign follows the layout: rebuild (already settled) after a real resize or rotation
                let w = hero.clientWidth;
                let h = hero.clientHeight;
                /** @type {ReturnType<typeof setTimeout> | undefined} */
                let timer;
                new ResizeObserver(() => {
                    clearTimeout(timer);
                    timer = setTimeout(() => {
                        if (Math.abs(hero.clientWidth - w) < 24 && Math.abs(hero.clientHeight - h) < 24) return;
                        w = hero.clientWidth;
                        h = hero.clientHeight;
                        scene.destroy();
                        scene = heroScene(hero, true);
                    }, 300);
                }).observe(hero);
            }
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
