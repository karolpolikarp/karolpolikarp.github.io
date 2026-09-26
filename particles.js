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

import { createMorph, INK } from './particle-morph.js?v=4';

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
 * Hero scene. Narrow screens stack the hero, so the scene gets a narrower design box pinned behind
 * the name instead of floating over the tabs.
 * @param {HTMLCanvasElement} hero @param {boolean} narrow
 */
function heroScene(hero, narrow) {
    const W = narrow ? 800 : 1600;
    const H = 900;
    return createMorph(hero, {
        width: W,
        height: H,
        originY: narrow ? 0.14 : 0.5,
        shapes: [
            c => section(c, W / 2, H * 0.51, 620),
            c => braced(c, W / 2, H * 0.51, narrow ? 330 : 400),
            // final: "§" on the left, "θ" on the right — on desktop both sit in the free space
            // between the name and the timeline
            c => (narrow ? pair(c, 240, 560, H * 0.51, 300) : pair(c, 610, 905, H * 0.5, 300))
        ],
        count: 1500,
        mobileCount: 700,
        dust: 260,
        mobileDust: 110,
        colorVars: COLOR_VARS,
        dustVar: '--pm-dust',
        maxDpr: 1.5,
        trail: 0.66,
        // a grand entrance, then the sign recedes into a quiet watermark behind the text
        fadeIn: 1.6,
        settle: { after: 1.6, factor: 0.55, duration: 2.2 },
        // particles fade to a whisper behind the text, so every line stays readable
        quiet: {
            selector: '#hero .hero-greeting, #hero .hero-avatar, #hero .hero-title, #hero .hero-subtitle, ' +
                '#hero .hero-cta a, #hero .hero-tabs, #hero .hero-tab-panel.active li, ' +
                '#hero .hero-tab-panel.active .skills-bento-card',
            factor: 0.22,
            pad: 6
        },
        pointerTarget: hero.closest('section') ?? hero,
        sequence: [{ shape: 0, at: 0 }, { shape: 1, at: 2.2 }, { shape: 2, at: 4.4 }]
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
                const narrowQuery = matchMedia('(max-width: 768px)');
                let scene = heroScene(hero, narrowQuery.matches);
                hero.classList.add('is-live');
                narrowQuery.addEventListener('change', e => { // rotation / resize across the breakpoint
                    scene.destroy();
                    scene = heroScene(hero, e.matches);
                });
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
