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
 * @property {number} [maxDpr]              devicePixelRatio cap
 * @property {Element} [pointerTarget]      element whose pointer moves repel particles (canvas has pointer-events:none)
 * @property {{ shape: number, at: number }[]} [sequence]  shape changes over time (seconds); default: [{shape:0, at:0}]
 * @property {boolean} [startOnVisible]     wait until the canvas is first on screen before starting the sequence
 */

const REDUCE = matchMedia('(prefers-reduced-motion: reduce)');
const MOBILE = matchMedia('(max-width: 600px)');

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
            m.tick(dt);
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

document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
    } else {
        wake();
    }
});

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

/**
 * Draws a shape at half resolution and returns `count` target points (design coordinates).
 * @param {DrawFn} draw @param {number} W @param {number} H @param {number} count
 * @returns {{ x: Float32Array, y: Float32Array, c: Uint8Array }}
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
        if (!n) {
            out.x[k] = Math.random() * W;
            out.y[k] = Math.random() * H;
            continue;
        }
        const s = order[k % n] * 3;
        out.x[k] = pts[s];
        out.y[k] = pts[s + 1];
        out.c[k] = pts[s + 2];
    }
    return out;
}

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

        this.targets = o.shapes.map(draw => sample(draw, this.W, this.H, n));

        this.px = new Float32Array(n); this.py = new Float32Array(n);
        this.vx = new Float32Array(n); this.vy = new Float32Array(n);
        this.K = new Float32Array(n); this.JX = new Float32Array(n); this.JY = new Float32Array(n);
        this.PH = new Float32Array(n); this.DL = new Float32Array(n);
        this.TI = new Uint32Array(n); this.COL = new Uint8Array(n);
        this.QF = new Uint8Array(n);                        // 1 = particle sits over text this frame
        /** @type {number[]} */ this.quiet = [];            // [x0, y0, x1, y1, ...] in canvas CSS px
        this.quietT = -1;
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
        /** @type {number | null} */ this.mx = null;
        /** @type {number | null} */ this.my = null;

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

        this.readTheme();
        this.layout();

        this.relayout = () => {
            if (!this.layout()) return;
            if (REDUCE.matches) this.drawStill();
            else if (this.running()) this.render(1 / 60, true);
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
            if (REDUCE.matches) this.drawStill();
        };
        this.mo = new MutationObserver(this.onTheme);
        this.mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        this.onReduce = () => {
            if (REDUCE.matches) this.drawStill();
            else wake();
        };
        REDUCE.addEventListener('change', this.onReduce);

        const target = o.pointerTarget ?? canvas;
        /** @param {Event} e */
        this.onMove = e => {
            const ev = /** @type {PointerEvent} */ (e);
            const r = canvas.getBoundingClientRect();
            this.mx = (ev.clientX - r.left - this.ox) / this.scale;
            this.my = (ev.clientY - r.top - this.oy) / this.scale;
        };
        this.onLeave = () => { this.mx = this.my = null; };
        target.addEventListener('pointermove', this.onMove, { passive: true });
        target.addEventListener('pointerleave', this.onLeave);
        this.pointerTarget = target;

        const seq = o.sequence ?? [{ shape: 0, at: 0 }];
        this.seq = seq;
        if (REDUCE.matches) {
            this.enter(seq[seq.length - 1].shape, false);
            this.drawStill();
        } else {
            this.enter(seq[0].shape, false);
            this.seqIndex = 1;
        }

        instances.add(this);
        wake();
    }

    readTheme() {
        const cs = getComputedStyle(this.canvas);
        this.colors = this.o.colorVars.map(v => cs.getPropertyValue(v).trim() || 'currentColor');
        this.dustColor = this.o.dustVar ? (cs.getPropertyValue(this.o.dustVar).trim() || this.colors[0]) : this.colors[0];
        const blend = cs.getPropertyValue('--pm-blend').trim();
        this.blend = /** @type {GlobalCompositeOperation} */ (blend === 'source-over' ? 'source-over' : 'lighter');
        this.alpha = parseFloat(cs.getPropertyValue('--pm-alpha')) || 0.62;
        this.dustAlpha = parseFloat(cs.getPropertyValue('--pm-dust-alpha')) || 0.2;
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

    running() {
        return this.visible && this.started && !this.paused && !REDUCE.matches;
    }

    /** @param {number} i @param {boolean} burst */
    enter(i, burst) {
        this.cur = i;
        this.enterT = this.t;
        const n = this.N;
        const rot = (Math.random() * n) | 0; // every change sends each particle somewhere new
        const tg = this.targets[i];
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
        if (i === this.cur || !this.targets[i]) return;
        if (REDUCE.matches) {
            this.enter(i, false);
            this.drawStill();
        } else {
            this.enter(i, true);
            wake();
        }
    }

    pause() { this.paused = true; }
    resume() { this.paused = false; wake(); }

    destroy() {
        instances.delete(this);
        this.ro.disconnect();
        this.io.disconnect();
        this.mo.disconnect();
        REDUCE.removeEventListener('change', this.onReduce);
        this.dprQuery?.removeEventListener('change', this.onDpr);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.pointerTarget.removeEventListener('pointermove', this.onMove);
        this.pointerTarget.removeEventListener('pointerleave', this.onLeave);
    }

    /** @param {number} dt */
    tick(dt) {
        this.t += dt;
        while (this.seqIndex < this.seq.length && this.t >= this.seq[this.seqIndex].at) {
            this.enter(this.seq[this.seqIndex].shape, true);
            this.seqIndex++;
        }
        if (this.o.quiet && this.t - this.quietT > 0.4) {
            this.quietT = this.t;
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
        const tg = this.targets[this.cur];
        const { px, py, vx, vy, K, JX, JY, PH, DL, TI } = this;
        const mx = this.mx;
        const my = this.my;
        const R = 110;
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
                    const force = (1 - d / R) * 6;
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

    /** @param {number} dt @param {boolean} [still] */
    render(dt, still = false) {
        const { ctx, cw, ch, dpr, scale: s, ox, oy, size } = this;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (still) {
            ctx.clearRect(0, 0, cw, ch);
        } else {
            // never fully cleared: partial erase leaves trails, and keeps the canvas transparent
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = `rgba(0,0,0,${1 - Math.pow(this.o.trail ?? 0.76, Math.min(3, dt * 60))})`;
            ctx.fillRect(0, 0, cw, ch);
        }
        ctx.globalCompositeOperation = this.blend;
        // Trails accumulate once per frame, so at 120/144 Hz the same alpha would glow 2-3x brighter
        // than at 60 Hz. Scale each frame's contribution by its share of a 60 Hz frame's erase.
        const trail = this.o.trail ?? 0.76;
        const rate = still ? 1 : Math.min(1, (1 - Math.pow(trail, Math.min(3, dt * 60))) / (1 - trail));
        const a = Math.min(1, this.alpha * this.settleFactor() * rate);
        const aq = a * (this.o.quiet?.factor ?? 0.12);
        const Q = this.quiet;
        const qn = Q.length;
        const QF = this.QF;
        const h = size / 2;
        for (let p = 0; p < this.N; p++) {                                         // which particles sit over text
            let inside = 0;
            if (qn) {
                const x = ox + this.px[p] * s;
                const y = oy + this.py[p] * s;
                for (let i = 0; i < qn; i += 4) {
                    if (x > Q[i] && x < Q[i + 2] && y > Q[i + 1] && y < Q[i + 3]) { inside = 1; break; }
                }
            }
            QF[p] = inside;
        }
        const colors = this.colors;
        for (let c = 0; c < colors.length; c++) {                                  // batch by colour
            ctx.fillStyle = colors[c];
            for (let pass = 0; pass < (qn ? 2 : 1); pass++) {
                ctx.globalAlpha = pass ? aq : a;
                for (let p = 0; p < this.N; p++) {
                    if (this.COL[p] === c && QF[p] === pass) ctx.fillRect(ox + this.px[p] * s - h, oy + this.py[p] * s - h, size, size);
                }
            }
        }
        ctx.fillStyle = this.dustColor;
        for (let pass = 0; pass < (qn ? 2 : 1); pass++) {
            ctx.globalAlpha = this.dustAlpha * rate * (pass ? (this.o.quiet?.factor ?? 0.12) : 1);
            for (let p = 0; p < this.ND; p++) {
                const x = this.dx[p] * cw;
                const y = this.dy[p] * ch;
                let inside = 0;
                for (let i = 0; i < qn; i += 4) {
                    if (x > Q[i] && x < Q[i + 2] && y > Q[i + 1] && y < Q[i + 3]) { inside = 1; break; }
                }
                if (inside === pass) ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
            }
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    /** Alpha multiplier: fades in at the start, then eases to settle.factor once the sequence is over. */
    settleFactor() {
        if (REDUCE.matches) return 1; // a still frame has no trail build-up, it is already quiet
        const ease = (/** @type {number} */ u) => {
            const v = Math.min(1, Math.max(0, u));
            return v * v * (3 - 2 * v);
        };
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

    /** Reduced motion: the settled shape, drawn once. */
    drawStill() {
        const tg = this.targets[this.cur];
        if (!tg) return;
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
        pause: () => m.pause(),
        resume: () => m.resume(),
        destroy: () => m.destroy()
    };
}
