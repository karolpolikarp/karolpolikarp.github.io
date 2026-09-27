// @ts-check
/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="esnext" />

/*
 * particle-morph.js — Canvas 2D particle morphing, zero dependencies.
 *
 * Shapes are drawn with plain Canvas 2D calls on a hidden canvas, read back as pixels and turned
 * into particle targets (sampled once, after fonts load). Particles fly between shapes on damped
 * springs, burst and regroup in waves on every change, breathe when settled, leave short trails
 * and glow through additive blending. A little dust drifts in the background.
 *
 * - Many instances share ONE requestAnimationFrame loop; an instance only runs while its canvas
 *   is on screen and the tab is visible.
 * - Once the sequence has settled, touch screens freeze the scene on its last frame (no CPU/GPU work)
 *   until the next touch, resize or theme change; with a mouse it keeps breathing at the full frame rate
 *   (a capped rate lands on uneven frame intervals and reads as stutter).
 * - devicePixelRatio aware (capped), resizes by rescaling — shapes are never resampled.
 * - prefers-reduced-motion: the final shape is drawn once, with no motion at all.
 * - The canvas is decoration: keep it aria-hidden, all content stays in the HTML.
 *
 * Colours are palette INDICES: shapes draw with INK[i]; the rendered colour of index i comes from
 * the CSS custom property colorVars[i] on the canvas, so themes recolour particles for free.
 */

/** Colours used ONLY while drawing shapes; each maps to palette index 0..3. */
export const INK = /** @type {const} */ (['#ff0000', '#00ff00', '#0000ff', '#ffff00']);
const INK_RGB = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0]];

/** @typedef {(ctx: CanvasRenderingContext2D) => void} DrawFn  draws one shape in design coordinates */
/** @typedef {{ x: Float32Array, y: Float32Array, c: Uint8Array }} Targets */

/**
 * @typedef {object} MorphOptions
 * @property {number} width                 design width (shape coordinates)
 * @property {number} height                design height
 * @property {DrawFn[]} shapes
 * @property {number} count                 shape particles on larger screens
 * @property {number} [mobileCount]         shape particles when (max-width: 600px)
 * @property {number} [dust]                ambient dust particles
 * @property {number} [mobileDust]
 * @property {string[]} colorVars           CSS custom properties for palette indices 0..3
 * @property {string} [dustVar]             CSS custom property for the dust colour
 * @property {number} [originX]             0..1 — where the design box sits horizontally when narrower than the canvas
 * @property {number} [originY]             0..1 — where the design box sits vertically when shorter than the canvas
 * @property {number} [trail]               0..1 — how much of the previous frame survives (longer trails near 1); default 0.76
 * @property {{ after: number, factor: number, duration: number }} [settle]
 *     after the last sequence step + `after` seconds, fade the particle alpha to `factor` over `duration` seconds
 * @property {number} [fadeIn]              seconds over which the particles fade in at the start (quieter first burst)
 * @property {{ selector: string, factor?: number, pad?: number }} [quiet]
 *     text-safe zones: particles over elements matching `selector` are drawn at `factor` × alpha (default 0.12),
 *     so the scene never competes with the text on top of it; zones are re-measured continuously
 * @property {{ fps?: number, freezeAfter?: number }} [idle]
 *     once settled: optionally cap the frame rate at `fps` (default: none) and freeze after `freezeAfter`
 *     seconds without pointer activity
 *     (default: 6 on touch screens, never with a mouse)
 * @property {number} [maxDpr]              devicePixelRatio cap
 * @property {Element} [pointerTarget]      element whose pointer moves repel particles (canvas has pointer-events:none)
 * @property {{ radius?: number, force?: number }} [repel]  how far (design units, default 110) and how hard (default 6)
 *     the pointer pushes particles away
 * @property {{ shape: number, at: number }[]} [sequence]  shape changes over time (seconds); default: [{shape:0, at:0}]
 * @property {boolean} [startOnVisible]     wait until the canvas is first on screen before starting the sequence
 * @property {boolean} [startSettled]       skip the sequence: start on the last shape, already settled (used to rebuild after a resize)
 */

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
// Chrome refreshes a MediaQueryList's state whenever .matches is read, so reading it every frame would
// swallow the 'change' event (and leave a mid-animation frame on screen): read it once, then follow events.
let reduced = REDUCE.matches;
const MOBILE = matchMedia('(max-width: 600px)');
const FINE = matchMedia('(hover: hover) and (pointer: fine)');

// ------------------------------------------------------------------ shared loop
/** @type {Set<Morph>} */
const instances = new Set();
let rafId = 0;
let last = 0;

function frame(/** @type {number} */ now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    let active = false;
    for (const m of instances) {
        if (m.running()) {
            m.advance(dt);
            active = true;
        }
    }
    rafId = active ? requestAnimationFrame(frame) : 0;
}

function wake() {
    if (rafId || document.hidden) return;
    for (const m of instances) {
        if (m.running()) {
            last = performance.now();
            rafId = requestAnimationFrame(frame);
            return;
        }
    }
}

REDUCE.addEventListener('change', e => {
    reduced = e.matches;
    for (const m of instances) m.onReduce();
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
    } else {
        wake();
    }
});

// the pointer is mapped through the canvas rect, which moves when the page scrolls
addEventListener('scroll', () => {
    for (const m of instances) m.rectDirty = true;
}, { passive: true, capture: true });

// ------------------------------------------------------------------ helpers
/** @param {number[]} rgb */
function nearestInk(rgb) {
    let best = 0;
    let bd = Infinity;
    for (let i = 0; i < INK_RGB.length; i++) {
        const [r, g, b] = INK_RGB[i];
        const d = (rgb[0] - r) ** 2 + (rgb[1] - g) ** 2 + (rgb[2] - b) ** 2;
        if (d < bd) {
            bd = d;
            best = i;
        }
    }
    return best;
}

/** A CSS number that may legitimately be 0. @param {string} v @param {number} fallback */
function num(v, fallback) {
    const n = parseFloat(v);
    return Number.isNaN(n) ? fallback : n;
}

/**
 * Draws a shape at half resolution and returns `count` target points (design coordinates).
 * @param {DrawFn} draw @param {number} W @param {number} H @param {number} count
 * @returns {Targets}
 */
function sample(draw, W, H, count) {
    const OW = Math.ceil(W / 2);
    const OH = Math.ceil(H / 2);
    const off = document.createElement('canvas');
    off.width = OW;
    off.height = OH;
    const oc = /** @type {CanvasRenderingContext2D} */ (off.getContext('2d', { willReadFrequently: true }));
    oc.setTransform(0.5, 0, 0, 0.5, 0, 0);
    draw(oc);
    const d = oc.getImageData(0, 0, OW, OH).data;
    /** @type {number[]} */
    const pts = [];
    for (let y = 0; y < OH; y++) {
        for (let x = 0; x < OW; x++) {
            const i = (y * OW + x) * 4;
            if (d[i + 3] > 150) pts.push(x * 2 + 1, y * 2 + 1, nearestInk([d[i], d[i + 1], d[i + 2]]));
        }
    }
    const n = pts.length / 3;
    if (n === 0 || n > OW * OH * 0.5) {
        // blank or randomised pixels (e.g. anti-fingerprinting): no usable shape
        throw new Error('particle-morph: canvas readback unavailable');
    }
    const order = new Uint32Array(n);
    for (let i = 0; i < n; i++) order[i] = i;
    for (let i = n - 1; i > 0; i--) { // shuffle = even thinning of the shape
        const j = (Math.random() * (i + 1)) | 0;
        const t = order[i];
        order[i] = order[j];
        order[j] = t;
    }
    const out = { x: new Float32Array(count), y: new Float32Array(count), c: new Uint8Array(count) };
    for (let k = 0; k < count; k++) {
        const s = order[k % n] * 3;
        out.x[k] = pts[s];
        out.y[k] = pts[s + 1];
        out.c[k] = pts[s + 2];
    }
    return out;
}

const ease = (/** @type {number} */ u) => {
    const v = Math.min(1, Math.max(0, u));
    return v * v * (3 - 2 * v);
};

// ------------------------------------------------------------------ instance
class Morph {
    /** @param {HTMLCanvasElement} canvas @param {MorphOptions} o */
    constructor(canvas, o) {
        this.canvas = canvas;
        this.o = o;
        this.ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
        this.W = o.width;
        this.H = o.height;
        const n = this.N = MOBILE.matches ? (o.mobileCount ?? Math.round(o.count / 2)) : o.count;
        const nd = this.ND = MOBILE.matches ? (o.mobileDust ?? Math.round((o.dust ?? 0) / 2)) : (o.dust ?? 0);

        const seq = o.sequence ?? [{ shape: 0, at: 0 }];
        this.seq = seq;
        this.lastShape = seq[seq.length - 1].shape;
        const settled = !!o.startSettled || reduced;
        /** @type {(Targets | null)[]} */
        this.targets = o.shapes.map(() => null);
        // a settled start only ever shows the last shape; otherwise sample everything now,
        // so no sampling happens in the middle of the entrance
        if (settled) this.target(this.lastShape);
        else o.shapes.forEach((_, i) => this.target(i));

        this.px = new Float32Array(n); this.py = new Float32Array(n);
        this.vx = new Float32Array(n); this.vy = new Float32Array(n);
        this.K = new Float32Array(n); this.JX = new Float32Array(n); this.JY = new Float32Array(n);
        this.PH = new Float32Array(n); this.DL = new Float32Array(n);
        this.TI = new Uint32Array(n); this.COL = new Uint8Array(n);
        this.QF = new Uint8Array(n);                        // 1 = particle sits over text this frame
        /** @type {number[]} */ this.quiet = [];            // [x0, y0, x1, y1, ...] in canvas CSS px
        this.quietT = -Infinity;
        for (let p = 0; p < n; p++) {
            this.px[p] = Math.random() * this.W;
            this.py[p] = Math.random() * this.H;
            this.K[p] = 0.02 + Math.random() * 0.032;       // spring stiffness 0.020–0.052
            this.JX[p] = (Math.random() - 0.5) * 3;          // ±1.5 px hides duplicated points
            this.JY[p] = (Math.random() - 0.5) * 3;
            this.PH[p] = Math.random() * 6.283;
            this.DL[p] = Math.random() * 0.75;              // staggered regroup delay
        }
        // dust lives in normalised canvas space, so it always fills the whole canvas
        this.dx = new Float32Array(nd); this.dy = new Float32Array(nd); this.dph = new Float32Array(nd);
        this.DF = new Uint8Array(nd);
        for (let p = 0; p < nd; p++) {
            this.dx[p] = Math.random();
            this.dy[p] = Math.random();
            this.dph[p] = Math.random() * 6.283;
        }

        this.t = 0;              // seconds of animation time (advances only while running)
        this.cur = -1;           // current shape
        this.enterT = 0;         // time of the last shape change
        this.seqIndex = 0;
        this.started = !o.startOnVisible;
        this.visible = false;
        this.paused = false;
        this.frozen = false;     // idle: the last frame stays on the canvas, nothing runs
        this.acc = 0;            // time accumulated towards the next throttled frame
        this.eraseAcc = 0;       // time accumulated towards the next trail erase
        this.activeT = 0;        // animation time of the last pointer activity

        // pointer, kept in client coordinates and mapped through the (scroll-aware) canvas rect
        this.pin = false;
        this.pcx = 0;
        this.pcy = 0;
        this.rectDirty = true;
        this.rx = 0;
        this.ry = 0;

        // filled in by layout() and readTheme()
        this.cw = 0;
        this.ch = 0;
        this.dpr = 1;
        this.scale = 1;
        this.ox = 0;
        this.oy = 0;
        this.size = 2;
        /** @type {string[]} */ this.colors = [];
        this.dustColor = '';
        /** @type {GlobalCompositeOperation} */ this.blend = 'lighter';
        this.alpha = 0.62;
        this.dustAlpha = 0.2;
        this.sizeMul = 1;

        this.readTheme();
        this.layout();

        this.relayout = () => {
            if (!this.layout()) return;
            if (reduced) this.drawStill();
            else {
                this.render(1 / 60, true);   // the backing store was cleared: repaint before the next paint
                this.unfreeze();
            }
        };
        this.ro = new ResizeObserver(this.relayout);
        this.ro.observe(canvas);
        /** @type {MediaQueryList | null} */
        this.dprQuery = null;
        this.onDpr = () => {
            this.relayout();
            this.watchDpr();
        };
        this.watchDpr();

        this.io = new IntersectionObserver(entries => {
            this.visible = entries[entries.length - 1].isIntersecting;
            if (this.visible) this.started = true;
            wake();
        }, { rootMargin: '80px' });
        this.io.observe(canvas);

        this.onTheme = () => {
            this.readTheme();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, canvas.width, canvas.height); // drop trails in the old colours
            if (reduced) this.drawStill();
            else {
                this.render(1 / 60, true);
                this.unfreeze();
            }
        };
        this.mo = new MutationObserver(this.onTheme);
        this.mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        const target = o.pointerTarget ?? canvas;
        /** @param {Event} e */
        this.onMove = e => {
            const ev = /** @type {PointerEvent} */ (e);
            this.pin = true;
            this.pcx = ev.clientX;
            this.pcy = ev.clientY;
            this.activeT = this.t;
            if (this.frozen) this.unfreeze();
        };
        this.onLeave = () => { this.pin = false; };
        target.addEventListener('pointermove', this.onMove, { passive: true });
        target.addEventListener('pointerleave', this.onLeave);
        this.pointerTarget = target;

        if (settled) {
            this.settleNow();
            if (reduced) this.drawStill();
            else this.render(1 / 60, true);   // no blank frame while the loop spins up
        } else {
            this.enter(seq[0].shape, false);
            this.seqIndex = 1;
        }

        instances.add(this);
        wake();
    }

    /** prefers-reduced-motion changed (called for every instance by the shared listener). */
    onReduce() {
        if (reduced) {
            this.settleNow();         // switching mid-entrance must still show the final sign
            this.drawStill();
        } else {
            this.unfreeze();          // already settled: breathing resumes, no replay
        }
    }

    /** Lazily sampled targets for shape i. @param {number} i @returns {Targets} */
    target(i) {
        let t = this.targets[i];
        if (!t) {
            t = sample(this.o.shapes[i], this.W, this.H, this.N);
            this.targets[i] = t;
        }
        return t;
    }

    /** Jumps past the whole sequence: last shape, particles on their targets, alpha already settled. */
    settleNow() {
        const o = this.o;
        const lastStep = this.seq[this.seq.length - 1];
        this.enter(this.lastShape, false);
        this.seqIndex = this.seq.length;
        this.t = Math.max(this.t, Math.max(lastStep.at, o.fadeIn ?? 0) + (o.settle ? o.settle.after + o.settle.duration : 0));
        this.enterT = this.t - 10;
        this.activeT = this.t;
        const tg = this.target(this.cur);
        for (let p = 0; p < this.N; p++) {
            const k = this.TI[p];
            this.px[p] = tg.x[k] + this.JX[p];
            this.py[p] = tg.y[k] + this.JY[p];
            this.vx[p] = this.vy[p] = 0;
        }
    }

    readTheme() {
        const cs = getComputedStyle(this.canvas);
        // computed custom properties already have their var() chains substituted, so the value is a
        // plain colour the canvas understands (don't round-trip through `color`: the site's
        // reduced-motion rule gives every element a tiny transition, which would return the old colour)
        const read = (/** @type {string} */ prop) => cs.getPropertyValue(prop).trim();
        this.colors = this.o.colorVars.map(v => read(v) || 'currentColor');
        this.dustColor = (this.o.dustVar && read(this.o.dustVar)) || this.colors[0];
        this.blend = /** @type {GlobalCompositeOperation} */ (read('--pm-blend') === 'source-over' ? 'source-over' : 'lighter');
        this.alpha = num(read('--pm-alpha'), 0.62);
        this.dustAlpha = num(read('--pm-dust-alpha'), 0.2);
        this.sizeMul = num(read('--pm-size'), 1);   // bigger dots read better on light backgrounds
    }

    /** Re-arms a one-shot listener for the current devicePixelRatio. */
    watchDpr() {
        this.dprQuery?.removeEventListener('change', this.onDpr);
        this.dprQuery = matchMedia(`(resolution: ${devicePixelRatio || 1}dppx)`);
        this.dprQuery.addEventListener('change', this.onDpr);
    }

    /** @returns {boolean} whether the backing store changed (and was therefore cleared) */
    layout() {
        const c = this.canvas;
        const cw = c.clientWidth;
        const ch = c.clientHeight;
        const dpr = Math.min(devicePixelRatio || 1, this.o.maxDpr ?? 2);
        this.cw = cw;
        this.ch = ch;
        this.dpr = dpr;
        const bw = Math.max(1, Math.round(cw * dpr));
        const bh = Math.max(1, Math.round(ch * dpr));
        const changed = c.width !== bw || c.height !== bh;
        if (changed) {
            c.width = bw;
            c.height = bh;
        }
        const s = Math.min(cw / this.W, ch / this.H) || 1;
        this.scale = s;
        this.ox = (cw - this.W * s) * (this.o.originX ?? 0.5);
        this.oy = (ch - this.H * s) * (this.o.originY ?? 0.5);
        this.size = Math.max(1.3, Math.min(2.6, 2.5 * s * (this.W / 1600)));
        this.rectDirty = true;
        this.measureQuiet();
        return changed;
    }

    /**
     * Re-reads the text-safe zones: tight rectangles around each line of text inside the matched
     * elements (Range client rects), or the element box when it holds no text (e.g. an image).
     */
    measureQuiet() {
        const q = this.o.quiet;
        if (!q) return;
        const pad = q.pad ?? 8;
        const base = this.canvas.getBoundingClientRect();
        const range = document.createRange();
        /** @type {number[]} */
        const out = [];
        /** @param {DOMRect} r */
        const push = r => {
            if (r.width && r.height) out.push(r.left - base.left - pad, r.top - base.top - pad, r.right - base.left + pad, r.bottom - base.top + pad);
        };
        document.querySelectorAll(q.selector).forEach(el => {
            if (getComputedStyle(el).visibility === 'hidden') return;
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            let any = false;
            for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                if (!(n.nodeValue ?? '').trim()) continue;
                range.selectNodeContents(n);
                for (const r of range.getClientRects()) {
                    push(r);
                    any = true;
                }
            }
            if (!any) push(el.getBoundingClientRect());
        });
        this.quiet = out;
    }

    /** Whether the sequence is over and the alpha has settled. */
    settled() {
        const o = this.o;
        if (this.seqIndex < this.seq.length) return false;
        const lastStep = this.seq[this.seq.length - 1];
        return this.t >= Math.max(lastStep.at, o.fadeIn ?? 0) + (o.settle ? o.settle.after + o.settle.duration : 0);
    }

    running() {
        return this.visible && this.started && !this.paused && !this.frozen && !reduced;
    }

    unfreeze() {
        this.frozen = false;
        this.activeT = this.t;
        wake();
    }

    /** @param {number} i @param {boolean} burst */
    enter(i, burst) {
        this.cur = i;
        this.enterT = this.t;
        const n = this.N;
        const rot = (Math.random() * n) | 0; // every change sends each particle somewhere new
        const tg = this.target(i);
        for (let p = 0; p < n; p++) {
            const k = (p + rot) % n;
            this.TI[p] = k;
            this.COL[p] = tg.c[k];
            if (burst) {
                const a = Math.random() * 6.283;
                const s = 3 + Math.random() * 10;
                this.vx[p] += Math.cos(a) * s;
                this.vy[p] += Math.sin(a) * s;
            }
        }
    }

    /** Public: jump to a shape now (with a burst). @param {number} i */
    goTo(i) {
        if (i === this.cur || i < 0 || i >= this.targets.length) return;
        if (reduced) {
            this.enter(i, false);
            this.drawStill();
        } else {
            this.enter(i, true);
            this.unfreeze();
            wake();
        }
    }

    /** Public: re-measure the text zones (tab switch, language change) and repaint if needed. */
    refresh() {
        this.rectDirty = true;
        this.measureQuiet();
        if (reduced) this.drawStill();
        else this.unfreeze();
    }

    pause() { this.paused = true; }
    resume() { this.paused = false; wake(); }

    destroy() {
        instances.delete(this);
        this.ro.disconnect();
        this.io.disconnect();
        this.mo.disconnect();
        this.dprQuery?.removeEventListener('change', this.onDpr);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.pointerTarget.removeEventListener('pointermove', this.onMove);
        this.pointerTarget.removeEventListener('pointerleave', this.onLeave);
    }

    /** Called by the shared loop every animation frame; freezes (and optionally throttles) once settled. @param {number} dt */
    advance(dt) {
        if (this.settled()) {
            const idle = this.o.idle ?? {};
            if (this.t - this.activeT > (idle.freezeAfter ?? (FINE.matches ? Infinity : 6)) && !this.pin) {
                this.frozen = true;           // the last frame stays on screen; nothing runs
                return;
            }
            if (idle.fps) {
                this.acc += dt;
                if (this.acc < 1 / idle.fps) return;
                dt = Math.min(0.05, this.acc);
                this.acc = 0;
            }
        }
        this.tick(dt);
    }

    /** @param {number} dt */
    tick(dt) {
        this.t += dt;
        while (this.seqIndex < this.seq.length && this.t >= this.seq[this.seqIndex].at) {
            this.enter(this.seq[this.seqIndex].shape, true);
            this.seqIndex++;
        }
        if (this.o.quiet && this.t - this.quietT > (this.settled() ? 1 : 0.4)) {
            this.quietT = this.t;
            this.rectDirty = true;   // cheap insurance against layout shifts that don't scroll
            this.measureQuiet();
        }
        this.step(dt);
        this.render(dt);
    }

    /** @param {number} dt */
    step(dt) {
        const f = Math.min(3, dt * 60);       // normalise to 60 fps
        const dm = Math.pow(0.87, f);         // frame-rate independent damping
        const t = this.t;
        const lt = t - this.enterT;
        const tg = this.target(this.cur);
        const { px, py, vx, vy, K, JX, JY, PH, DL, TI } = this;
        /** @type {number | null} */ let mx = null;
        /** @type {number | null} */ let my = null;
        if (this.pin) {
            if (this.rectDirty) {
                const r = this.canvas.getBoundingClientRect();
                this.rx = r.left;
                this.ry = r.top;
                this.rectDirty = false;
            }
            mx = (this.pcx - this.rx - this.ox) / this.scale;
            my = (this.pcy - this.ry - this.oy) / this.scale;
        }
        const R = this.o.repel?.radius ?? 110;
        const F = this.o.repel?.force ?? 6;
        for (let p = 0; p < this.N; p++) {
            const k = TI[p];
            const tx = tg.x[k] + JX[p] + Math.sin(t * 1.7 + PH[p]) * 1.3;          // breathing
            const ty = tg.y[k] + JY[p] + Math.cos(t * 1.3 + PH[p] * 1.4) * 1.3;
            const kk = lt > DL[p] ? K[p] : K[p] * 0.07;
            vx[p] = (vx[p] + (tx - px[p]) * kk * f) * dm;
            vy[p] = (vy[p] + (ty - py[p]) * kk * f) * dm;
            if (mx !== null && my !== null) {                                      // cursor repels
                const dx = px[p] - mx;
                const dy = py[p] - my;
                const d2 = dx * dx + dy * dy;
                if (d2 < R * R && d2 > 0.01) {
                    const d = Math.sqrt(d2);
                    const force = (1 - d / R) * F;
                    vx[p] += (dx / d) * force * f;
                    vy[p] += (dy / d) * force * f;
                }
            }
            px[p] += vx[p] * f;
            py[p] += vy[p] * f;
        }
        const cw = this.cw || 1;
        const ch = this.ch || 1;
        for (let p = 0; p < this.ND; p++) {                                        // dust drifts and wraps
            this.dx[p] += ((Math.sin(t * 0.3 + this.dph[p]) * 0.18 + 0.1) * f) / cw;
            this.dy[p] += (Math.cos(t * 0.25 + this.dph[p] * 1.3) * 0.14 * f) / ch;
            if (this.dx[p] > 1.01) this.dx[p] = -0.01;
            if (this.dy[p] < -0.01) this.dy[p] = 1.01;
            if (this.dy[p] > 1.01) this.dy[p] = -0.01;
        }
    }

    /** @param {number} x @param {number} y */
    inQuiet(x, y) {
        const Q = this.quiet;
        for (let i = 0; i < Q.length; i += 4) {
            if (x > Q[i] && x < Q[i + 2] && y > Q[i + 1] && y < Q[i + 3]) return 1;
        }
        return 0;
    }

    /** @param {number} dt @param {boolean} [still] */
    render(dt, still = false) {
        const { ctx, cw, ch, dpr, scale: s, ox, oy } = this;
        if (this.cur < 0) return;
        const size = this.size * this.sizeMul;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const trail = this.o.trail ?? 0.76;
        if (still) {
            ctx.clearRect(0, 0, cw, ch);
            this.eraseAcc = 0;
        } else {
            // never fully cleared: partial erase leaves trails, and keeps the canvas transparent.
            // At most ~60 erases a second: on faster screens a tiny erase per frame gets rounded away
            // by the 8-bit alpha, and faint trails would stay on the canvas for good.
            this.eraseAcc += dt;
            if (this.eraseAcc >= 0.9 / 60) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fillStyle = `rgba(0,0,0,${1 - Math.pow(trail, Math.min(3, this.eraseAcc * 60))})`;
                ctx.fillRect(0, 0, cw, ch);
                this.eraseAcc = 0;
            }
        }
        // a still frame (reduced motion, resize) has no trail build-up to glow with: plain
        // painting keeps the true colours instead of summing dense particles into white
        ctx.globalCompositeOperation = still ? 'source-over' : this.blend;
        // Paint builds up between erases, so at 120/144 Hz the same alpha would glow 2-3x brighter
        // than at 60 Hz. Scale each frame's contribution by its share of a 60 Hz frame.
        const rate = still ? 1 : Math.min(1, dt * 60);
        const a = Math.min(1, this.alpha * this.settleFactor() * rate);
        const qf = this.o.quiet?.factor ?? 0.12;
        const qn = this.quiet.length;
        const QF = this.QF;
        const DF = this.DF;
        const h = size / 2;
        for (let p = 0; p < this.N; p++) QF[p] = qn ? this.inQuiet(ox + this.px[p] * s, oy + this.py[p] * s) : 0;
        for (let p = 0; p < this.ND; p++) DF[p] = qn ? this.inQuiet(this.dx[p] * cw, this.dy[p] * ch) : 0;
        const colors = this.colors;
        for (let c = 0; c < colors.length; c++) {                                  // batch by colour
            ctx.fillStyle = colors[c];
            for (let pass = 0; pass < (qn ? 2 : 1); pass++) {
                ctx.globalAlpha = pass ? a * qf : a;
                for (let p = 0; p < this.N; p++) {
                    if (this.COL[p] === c && QF[p] === pass) ctx.fillRect(ox + this.px[p] * s - h, oy + this.py[p] * s - h, size, size);
                }
            }
        }
        ctx.fillStyle = this.dustColor;
        for (let pass = 0; pass < (qn ? 2 : 1); pass++) {
            ctx.globalAlpha = this.dustAlpha * rate * (pass ? qf : 1);
            for (let p = 0; p < this.ND; p++) {
                if (DF[p] === pass) ctx.fillRect(this.dx[p] * cw - 0.8, this.dy[p] * ch - 0.8, 1.6, 1.6);
            }
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    /** Alpha multiplier: fades in at the start, then eases to settle.factor once the sequence is over. */
    settleFactor() {
        if (reduced) return 1; // a still frame has no trail build-up, it is already quiet
        let k = 1;
        const fi = this.o.fadeIn;
        if (fi) k *= 0.3 + 0.7 * ease(this.t / fi);
        const st = this.o.settle;
        if (st) {
            const begin = this.seq[this.seq.length - 1].at + st.after;
            k *= 1 - (1 - st.factor) * ease((this.t - begin) / st.duration);
        }
        return k;
    }

    /** Reduced motion: the current shape, settled, drawn once. */
    drawStill() {
        if (this.cur < 0) return;
        const tg = this.target(this.cur);
        this.measureQuiet();
        for (let p = 0; p < this.N; p++) {
            const k = this.TI[p];
            this.px[p] = tg.x[k] + this.JX[p];
            this.py[p] = tg.y[k] + this.JY[p];
            this.vx[p] = this.vy[p] = 0;
        }
        this.render(0, true);
    }
}

/**
 * Creates a particle morph on a canvas. Call after the fonts used by the shapes have loaded.
 * Throws when the canvas cannot be read back (the caller should keep its static fallback).
 * @param {HTMLCanvasElement} canvas
 * @param {MorphOptions} options
 */
export function createMorph(canvas, options) {
    const m = new Morph(canvas, options);
    return {
        goTo: (/** @type {number} */ i) => m.goTo(i),
        refresh: () => m.refresh(),
        pause: () => m.pause(),
        resume: () => m.resume(),
        destroy: () => m.destroy()
    };
}
