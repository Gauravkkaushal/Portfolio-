// @ts-nocheck
// shortcut: the animation engine is the original script ported as-is and left untyped, type it when it gets split into modules
import Lenis from "lenis";
import { GH, WORDS, ART, FILMS, GATE, MAKE, OP, TICKS_AT, WHAT, SIDES, ORDER } from "./content";

export function initScene() {
// every listener, interval and frame started below is torn down by the returned cleanup
const ac = new AbortController(), timers = [];
let raf = 0;
const addEventListener = (t, f, o) => window.addEventListener(t, f, { ...o, signal: ac.signal });
const setInterval = (f, ms) => timers.push(window.setInterval(f, ms));
// ======================= helpers =======================
const $ = id => document.getElementById(id);
const clamp = (v,a=0,b=1) => Math.min(b, Math.max(a, v));
const ease = x => 1 - Math.pow(1 - clamp(x), 3);
const eio = x => (x = clamp(x), x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x + 2, 3) / 2);
const lerp = (a,b,t) => a + (b - a) * t;
const hex = h => [1,3,5].map(i => parseInt(h.slice(i, i + 2), 16));
let motion = !matchMedia("(prefers-reduced-motion: reduce)").matches;
const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const N = WORDS.length, STEP = 360 / N;

// ======================= sound: soft ticks, made on the fly =======================
// armed by the first click or key press, because browsers keep audio silent until then
let sound = true, armed = false, actx;
["pointerdown", "keydown"].forEach(t => addEventListener(t, () => armed = true, { once: true }));
function tick(f = 1400, v = .035) {
  if (!sound || !armed) return;
  actx ||= new AudioContext();
  const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
  o.type = "triangle"; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .5, t + .05);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .07);
  o.connect(g).connect(actx.destination); o.start(t); o.stop(t + .08);
}

function scramble(el, text, ms = 520) {
  if (!motion) { el.textContent = text; return; }
  const G = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>#", t0 = performance.now();
  (function f(now) {
    const k = clamp((now - t0) / ms), n = Math.floor(k * text.length);
    el.textContent = text.slice(0, n) + [...text.slice(n)].map(c => c === " " ? " " : G[Math.random() * G.length | 0]).join("");
    if (k < 1) requestAnimationFrame(f);
  })(t0);
}

// ======================= dial DOM =======================
const TICKS = 180;
const tickEls = [...$("ticks").children];
const labs = [...$("labs").children];
labs.forEach(b => b.onclick = () => enter());

// ======================= canvas =======================
const cv = $("world"); let cx = cv.getContext("2d");
const wv = $("wind"), wx = wv.getContext("2d"); // the breeze has its own canvas, over the hanging screens
let W, H, DPR, R, L, plate;
const wedgeT = new Array(N).fill(-1);  // time each wedge was revealed

function drawArt(c, i) {
  const [kind, col, word] = ART[i], r = rng(i * 977 + 13);
  const th = (i * STEP - 90) * Math.PI / 180;
  const cxp = Math.cos(th) * R * 2, cyp = Math.sin(th) * R * 2;
  c.fillStyle = "#0d1119"; c.fillRect(-L, -L, 2*L, 2*L);
  let g = c.createRadialGradient(cxp, cyp, 0, cxp, cyp, R * 1.9);
  g.addColorStop(0, col + "88"); g.addColorStop(1, col + "00");
  c.fillStyle = g; c.fillRect(-L, -L, 2*L, 2*L);
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = R * .006;
  const box = (fn, n) => { for (let k = 0; k < n; k++) fn(cxp + (r() - .5) * R * 3, cyp + (r() - .5) * R * 3, k); };
  if (kind === "code") {
    for (let y = -L; y < L; y += R * .07) { let x = cxp - R * 1.6 + (r() * 4 | 0) * R * .08;
      for (let k = 0; k < 4; k++) { const w = R * (.08 + r() * .3); c.globalAlpha = .25 + r() * .6; c.fillStyle = [col, "#f2f2ef", "#fb5e28", "#9aa0aa"][r() * 4 | 0];
        c.beginPath(); c.roundRect(x, y, w, R * .035, R * .015); c.fill(); x += w + R * .04; } }
  } else if (kind === "cards") {
    box((x, y) => { const w = R * (.4 + r() * .5), h = w * .62; c.globalAlpha = .55; c.fillStyle = "#1b2233"; c.beginPath(); c.roundRect(x, y, w, h, R*.03); c.fill();
      c.globalAlpha = .9; c.fillStyle = col; c.beginPath(); c.roundRect(x + w*.08, y + h*.12, w*.5, h*.1, R*.01); c.fill();
      c.globalAlpha = .4; c.fillStyle = "#f2f2ef"; for (let k = 0; k < 3; k++) { c.beginPath(); c.roundRect(x + w*.08, y + h*(.35 + k*.15), w*(.4 + r()*.4), h*.06, R*.01); c.fill(); }
      c.globalAlpha = .9; c.fillStyle = "#fb5e28"; c.beginPath(); c.roundRect(x + w*.6, y + h*.74, w*.3, h*.14, h*.07); c.fill(); }, 28);
  } else if (kind === "rings") {
    for (let k = 1; k < 26; k++) { c.globalAlpha = .1 + (k % 4 === 0) * .4; c.beginPath(); c.arc(cxp, cyp, k * R * .12, 0, 7); c.stroke(); }
    c.globalAlpha = .8; c.beginPath(); c.moveTo(cxp, cyp - R*.5); c.lineTo(cxp + R*.45, cyp + R*.3); c.lineTo(cxp - R*.45, cyp + R*.3); c.closePath(); c.fillStyle = "#f2f2ef"; c.fill();
  } else if (kind === "net" || kind === "cursor") {
    const P = []; box((x, y) => P.push([x, y]), 70);
    c.globalAlpha = .35; P.forEach(p => P.forEach(q => { if (p !== q && Math.hypot(p[0]-q[0], p[1]-q[1]) < R * .55) { c.beginPath(); c.moveTo(...p); c.lineTo(...q); c.stroke(); } }));
    P.forEach(p => { c.globalAlpha = .9; c.beginPath(); c.arc(p[0], p[1], R * (.012 + r() * .02), 0, 7); c.fill(); });
    if (kind === "cursor") box((x, y) => { c.globalAlpha = .9; c.fillStyle = "#f2f2ef"; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + R*.2); c.lineTo(x + R*.05, y + R*.15); c.lineTo(x + R*.13, y + R*.15); c.closePath(); c.fill();
      c.strokeStyle = "#fb5e28"; c.globalAlpha = .7; c.strokeRect(x + R*.15, y - R*.05, R*.4, R*.12); c.strokeStyle = col; }, 12);
  } else if (kind === "dots" || kind === "glow") {
    for (let x = -L; x < L; x += R * .07) for (let y = -L; y < L; y += R * .07) {
      const v = (Math.sin(x / R * 2.3 + i) + Math.cos(y / R * 1.7)) * .25 + .5; c.globalAlpha = v * .8;
      c.fillStyle = kind === "glow" ? (v > .7 ? "#fb5e28" : col) : (v > .75 ? "#3b82f6" : col);
      c.beginPath(); c.arc(x, y, R * .022 * v, 0, 7); c.fill(); }
  } else if (kind === "hex") {
    const s = R * .14; for (let y = -L, row = 0; y < L; y += s * 1.5, row++) for (let x = -L + (row % 2) * s * .866; x < L; x += s * 1.732) {
      c.globalAlpha = r() < .12 ? .9 : .25; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6; c.lineTo(x + Math.cos(a) * s * .92, y + Math.sin(a) * s * .92); } c.closePath(); c.globalAlpha > .5 ? c.fill() : c.stroke(); }
  } else if (kind === "bars") {
    for (let x = -L; x < L; x += R * .09) { const h = R * (.2 + Math.abs(Math.sin(x / R * 1.3)) * 1.2 + r() * .3); c.globalAlpha = .3 + r() * .5;
      c.fillStyle = r() < .15 ? "#f2f2ef" : col; c.fillRect(x, cyp + R * .8 - h, R * .06, h); }
    c.globalAlpha = .9; c.lineWidth = R * .03; c.beginPath(); c.arc(cxp, cyp - R*.9, R * .5, .25 * Math.PI, .75 * Math.PI); c.stroke();
  } else if (kind === "cloud") {
    box((x, y) => { c.globalAlpha = .25 + r() * .5; const s = R * (.1 + r() * .25); c.beginPath(); c.arc(x, y, s, 0, 7); c.arc(x + s, y - s * .4, s * 1.2, 0, 7); c.arc(x + s * 2.1, y, s * .9, 0, 7); c.fill(); }, 26);
  } else if (kind === "checks") {
    for (let x = -L; x < L; x += R * .16) for (let y = -L; y < L; y += R * .16) { const ok = r() > .1; c.globalAlpha = .25 + r() * .55; c.strokeStyle = ok ? col : "#fb5e28"; c.lineWidth = R * .014;
      c.beginPath(); if (ok) { c.moveTo(x, y); c.lineTo(x + R*.03, y + R*.03); c.lineTo(x + R*.08, y - R*.04); } else { c.moveTo(x, y - R*.03); c.lineTo(x + R*.06, y + R*.03); c.moveTo(x + R*.06, y - R*.03); c.lineTo(x, y + R*.03); } c.stroke(); }
  }
  c.globalAlpha = .22; c.fillStyle = "#f2f2ef"; c.font = `700 ${R * .42}px "Martian Grotesk", sans-serif`; c.textAlign = "center"; c.textBaseline = "middle";
  c.save(); c.translate(Math.cos(th) * R * 1.55, Math.sin(th) * R * 1.55); c.rotate(th + Math.PI / 2 + (i > 3 && i < 9 ? Math.PI : 0)); c.fillText(word, 0, 0); c.restore();
  c.globalAlpha = 1;
}
function buildPlate() {
  L = R * 3.4;
  const PS = Math.min(2, 4096 / (2 * L));
  plate = document.createElement("canvas"); plate.width = plate.height = Math.ceil(2 * L * PS);
  const c = plate.getContext("2d"); c.setTransform(PS, 0, 0, PS, L * PS, L * PS);
  for (let i = 0; i < N; i++) {
    const a0 = ((i - .5) * STEP - 90) * Math.PI / 180, a1 = ((i + .5) * STEP - 90) * Math.PI / 180;
    c.save(); c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, L * 1.5, a0, a1); c.closePath(); c.clip(); drawArt(c, i); c.restore();
  }
}
// the web: spokes between wedges plus rings that sag toward the centre between them, like a spider's web.
// spoke b runs between wedges b-1 and b and bows toward whichever is lit; threads near the pointer get pulled toward it
const hov = new Array(N).fill(0); let hovI = -1, wpx = 0, wpy = 0, wpa = 0, wt = 0;
const SP0 = .96; // where the spokes start: just outside the dial ring (the canvas sits at 1.1x the dial once settled)
const RINGS = [1.25, 1.75, 2.45, 3.3];
const spokeA = (b, r) => { const u = clamp((r - R * SP0) / (L - R * SP0)), bow = (hov[b % N] - hov[(b + N - 1) % N]) * 2.2;
  return ((b - .5) * STEP - 90 + bow * Math.sin(Math.PI * Math.sqrt(u))) * Math.PI / 180; };
function pull(x, y) { const dx = wpx - x, dy = wpy - y, f = wpa * .22 * Math.exp(-(dx * dx + dy * dy) / (R * R * .45)); return [x + dx * f, y + dy * f]; }
function webLine(c, b, back) {
  for (let k = 0; k <= 14; k++) { const r = lerp(R * SP0, L, (back ? 14 - k : k) / 14), th = spokeA(b, r); c.lineTo(...pull(Math.cos(th) * r, Math.sin(th) * r)); }
}
function webRing(c, i, r, j) {
  const sag = .07 + .012 * Math.sin(wt * 1.3 + j + i), a0 = spokeA(i, r), a1 = spokeA(i + 1, r);
  for (let k = 0; k <= 10; k++) { const s = k / 10, rr = r * (1 - sag * Math.sin(Math.PI * s)), th = lerp(a0, a1, s);
    const p = pull(Math.cos(th) * rr, Math.sin(th) * rr); k ? c.lineTo(...p) : c.moveTo(...p); }
}
function resize() {
  DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
  cv.width = wv.width = W * DPR; cv.height = wv.height = H * DPR;
  const nr = Math.round(Math.min(W, H) * (W < 700 ? .36 : .3));
  if (nr !== R) { R = nr; $("dial").style.setProperty("--R", R + "px"); buildPlate(); }
}
let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(resize, 120); });
resize();
document.fonts && document.fonts.ready.then(buildPlate);

// ======================= vault: a hall of rack devices lit by the film window =======================
const DEV = [];
{ const r = rng(4242);
  // [side, z, rail height, hem, how far it reaches into the hall, seed]: five rails per wall, audio cards hung close together like clothes
  [-3.7, -2.64, -1.58, -.52, .54].forEach((y, ri) => { for (let k = 0; k < 420; k++) for (const s of [-1, 1]) {
    if (r() < .06) continue;
    DEV.push([s, -2.6 + k * .17 + r() * .03, y, y + .95 * (.86 + r() * .14), .55 + r() * .15, r(), k, ri]);
  } });
  DEV.sort((a, b) => b[1] - a[1]); }
const RAIL = new Map(DEV.map((c, i) => [`${c[0]},${c[7]},${c[6]}`, i])); // side,rail,slot -> card, to find the neighbours a swing ripples to
const DUST = Array.from({ length: 90 }, (_, i) => { const r = rng(i * 31 + 7); return [(r() - .5) * 2.6, -3 + r() * 4.4, r() * 30, r()]; });
let light = hex("#ff7d32"), lightT = light.slice();
// the hall is built in zones, one per project, each lit in that project's colour; scrolling flies the camera through them
const ZL = 6, HALL0 = -2.2, ZC = GATE.map(g => hex(g[7]));
const zoneAt = z => { const u = (z - HALL0 - 2) / ZL, i = clamp(Math.floor(u), 0, ZC.length - 1), n = Math.min(ZC.length - 1, i + 1), t = u < 0 ? 0 : clamp((u - i - .8) / .2);
  return [i, ZC[i].map((c, k) => lerp(c, ZC[n][k], t))]; };
// a card never changes zone, so its colour (and the edge colour as a string) is worked out once, not every frame
for (const c of DEV) { c[8] = zoneAt(c[1])[1]; c[9] = `rgb(${c[8].map(v => v | 0).join()})`; }

function paintVault(alpha, camZ, gx, gy, gw) {
  const f = H * .95, X0 = W / 2, VY = H * .27, ZF = camZ + 34, ZG = camZ + 5.5; // ZG: depth of the light source, which travels with you
  const P = (x, y, z) => { const d = Math.max(.05, z - camZ); return [X0 + x * f / d, VY + y * f / d]; };
  const rgb = (a, k = 1) => `rgba(${Math.min(255, light[0] * k) | 0},${Math.min(255, light[1] * k) | 0},${Math.min(255, light[2] * k) | 0},${a})`;
  const rgbz = (c, a, k = 1) => `rgba(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0},${a})`;
  const lit = (x, y, z) => Math.exp(-Math.hypot(x * .7, (y + .4) * .7, (z - ZG) * .32) / 1.2);
  const quad = (q, fill) => { cx.fillStyle = fill; cx.beginPath(); cx.moveTo(...q[0]); for (const v of q.slice(1)) cx.lineTo(...v); cx.fill(); };
  cx.save(); cx.globalAlpha = alpha;
  cx.fillStyle = "#050405"; cx.fillRect(0, 0, W, H);
  let g = cx.createRadialGradient(X0, VY, 0, X0, VY, H * .5); g.addColorStop(0, rgb(.25)); g.addColorStop(1, rgb(0));
  cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  const zN = camZ + .35;
  // perforated floor
  quad([P(-1.6, 1.5, zN), P(1.6, 1.5, zN), P(1.6, 1.5, ZF), P(-1.6, 1.5, ZF)], "#0b090a");
  for (let z = Math.max(1, Math.ceil((camZ + .6) / .28) * .28); z < camZ + 24; z += .28) {
    const d = z - camZ, rs = Math.max(.5, .024 * f / d), zc = zoneAt(z)[1];
    cx.fillStyle = rgbz(zc, 1); // one colour per row, the dots differ only in alpha: parsing a colour string per dot was a real cost
    for (let x = -1.4; x <= 1.41; x += .14) { const q = P(x, 1.5, z); cx.globalAlpha = alpha * (.05 + lit(x, 1.5, z) * .75); cx.fillRect(q[0] - rs / 2, q[1] - rs * .3, rs, rs * .6); }
  }
  cx.globalAlpha = alpha;
  quad([P(-1.6, -3.8, zN), P(1.6, -3.8, zN), P(1.6, -3.8, ZF), P(-1.6, -3.8, ZF)], "#060506");
  // audio cards, far to near, each drawn in its own frame: u runs from the wall (0) to the hall side (1), v from the rail (0) to the hem (1)
  hall = [];
  // far down the hall the cards blur into one wall, so only every 2nd (then every 4th) is drawn
  const skip = (d, n) => d < .3 || d > 34 || (d > 9 && n % 2) || (d > 18 && n % 4);
  // each card is ~90% hidden by the nearer one on its rail, and painting all of every card was what made scrolling lag.
  // So note the nearer card's screen edges [inner x, top y, hem y] (pulled in a little, to stay inside its rounded corners):
  // only what shows past them is painted. A swinging card is not a clean rectangle, so it hides nothing and is painted whole
  const occ = [], near = []; let lastS = "";
  for (let i = DEV.length - 1; i >= 0; i--) { const [s, z, y0, y1, w, , n, ri] = DEV[i], d = z - camZ; if (skip(d, n)) continue;
    const k = ri * 2 + (s > 0), hh = (y1 - y0) * f / d * .045; occ[i] = near[k];
    near[k] = SW.has(i) ? null : [X0 + s * (1.6 - w * .93) * f / d, VY + y0 * f / d + hh, VY + y1 * f / d - hh]; }
  for (let i = 0; i < DEV.length; i++) { const [s, z, y0, y1, w, v, n, , zc, zs] = DEV[i];
    const d = z - camZ; if (skip(d, n)) continue;
    const xo = s * 1.6, xi = s * (1.6 - w), L = lit(xi, (y0 + y1) / 2, z), lv = L * clamp((d - .4) / 2.2);
    // hung from the rail, the hem swings along the hall: a slow sway, plus the push of moving through the hall
    // a card only moves when touched: hung from its rail, its hem swings along the hall (st.th), and it lights up while hovered (st.h)
    // the breeze at the first window swings every card a little too, in a wave that runs along the rails
    const wsw = wind > 0 ? wind * .2 * (.55 + .3 * Math.sin(windT * .7 - z * .5 + v * 3) + .15 * Math.sin(windT * .35)) : 0;
    const st = SW.get(i), sw = ((st ? st.th : 0) + wsw) * (y1 - y0), hl = st ? st.h : 0, lw2 = lv + (1 - lv) * hl * .85;
    const A = P(xo, y0, z), B = P(xi, y0, z), C = P(xi, y1, z + sw), D = P(xo, y1, z + sw);
    const uv = (u, t) => { const ax = A[0] + (B[0] - A[0]) * u, ay = A[1] + (B[1] - A[1]) * u, bx = D[0] + (C[0] - D[0]) * u, by = D[1] + (C[1] - D[1]) * u; return [ax + (bx - ax) * t, ay + (by - ay) * t]; };
    const wv = Math.abs(B[0] - A[0]), hv = D[1] - A[1], ca = .025 + lw2 * .1;
    if (wv > 3) hall.push([i, A, B, C, D]);
    // dark slabs that take a little of the hall's colour, all alike
    cx.fillStyle = `rgb(${lerp(11, zc[0], ca) | 0},${lerp(10, zc[1], ca) | 0},${lerp(12, zc[2], ca) | 0})`; cx.beginPath();
    // o: the nearer card's edges, if it covers part of this one. Still cards are upright rectangles on screen (xw: wall edge, xn: hall edge),
    // so what shows is a C: a sliver on the hall side (xn..ox) plus a strip above (yt..oy1) and below (oy2..yb) the nearer card
    const xw = A[0], xn = B[0], yt = A[1], yb = D[1], oc = st ? null : occ[i], o = oc && (oc[0] - xw) * s < 0 && oc[1] < yb && oc[2] > yt ? oc : null;
    const ox = o && ((o[0] - xn) * s > 0 ? o[0] : xn), oy1 = o && Math.max(o[1], yt), oy2 = o && Math.min(o[2], yb);
    if (o) { const rx = wv < 40 ? 0 : .07 * wv * s, ry = wv < 40 ? 0 : .045 * hv;
      cx.moveTo(xw, yt); cx.lineTo(xn + rx, yt); cx.quadraticCurveTo(xn, yt, xn, yt + ry); cx.lineTo(xn, yb - ry); cx.quadraticCurveTo(xn, yb, xn + rx, yb);
      cx.lineTo(xw, yb); cx.lineTo(xw, oy2); cx.lineTo(ox, oy2); cx.lineTo(ox, oy1); cx.lineTo(xw, oy1); }
    else if (wv < 40) { cx.moveTo(...A); cx.lineTo(...B); cx.lineTo(...C); cx.lineTo(...D); }
    else { const ru = .07, rv = .045; cx.moveTo(...uv(ru, 0)); cx.lineTo(...uv(1 - ru, 0)); cx.quadraticCurveTo(...B, ...uv(1, rv)); cx.lineTo(...uv(1, 1 - rv)); cx.quadraticCurveTo(...C, ...uv(1 - ru, 1));
      cx.lineTo(...uv(ru, 1)); cx.quadraticCurveTo(...D, ...uv(0, 1 - rv)); cx.lineTo(...uv(0, rv)); cx.quadraticCurveTo(...A, ...uv(ru, 0)); }
    cx.fill();
    // a plain slab with one round play button, low on the hall side where it shows past the card in front
    if (hv > 44 && wv > 22) {
      // hid: that point of the card sits behind the nearer card. Testing the hall-side end of a row is enough, the cover grows from the wall
      const hid = (u, t) => { if (!o) return false; const q = uv(u, t); return (q[0] - o[0]) * s > 0 && q[1] > o[1] && q[1] < o[2]; };
      if (!(hid(.95, .76) && hid(.95, .94))) {
        const [px, py] = uv(.72, .85), pr = Math.min(wv * .2, hv * .09);
        cx.fillStyle = `rgba(242,242,239,${.07 + lw2 * .22})`; cx.beginPath(); cx.arc(px, py, pr, 0, 7); cx.fill();
        cx.fillStyle = `rgba(8,7,9,${.35 + lw2 * .4})`; cx.beginPath(); cx.moveTo(px - pr * .3, py - pr * .42); cx.lineTo(px + pr * .45, py); cx.lineTo(px - pr * .3, py + pr * .42); cx.fill();
      }
    }
    // the edge colour is set only when it changes and faded with globalAlpha: a new colour string per card was a real cost
    if (hl > .01) { cx.strokeStyle = `rgba(242,242,239,${.03 + Math.max(L * .75, hl)})`; lastS = ""; }
    else { if (zs !== lastS) cx.strokeStyle = lastS = zs; cx.globalAlpha = alpha * (.03 + L * .75); }
    cx.lineWidth = Math.max(.6, .01 * f / d) * (1 + hl);
    cx.beginPath(); cx.moveTo(...C); cx.lineTo(...B); cx.lineTo(...A); cx.stroke(); cx.globalAlpha = alpha;
  }
  // the window's glow
  if (gw > 0) {
    cx.globalCompositeOperation = "lighter";
    g = cx.createRadialGradient(gx, gy, gw * .1, gx, gy, gw * 1.15); g.addColorStop(0, rgb(.55)); g.addColorStop(.45, rgb(.16)); g.addColorStop(1, rgb(0));
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    cx.globalCompositeOperation = "source-over";
  }
  g = cx.createRadialGradient(X0, H * .45, H * .25, X0, H * .45, Math.max(W, H) * .75);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.7)");
  cx.fillStyle = g; cx.fillRect(0, 0, W, H);
  cx.restore();
}
// the walls only change with scroll and light colour, so they are cached and only the dust is drawn every frame
const vc = document.createElement("canvas"); let vKey = "", vNext = 0;
// hover: the card under the pointer swings on its rail and lights up, and the push ripples a few cards down the rail
const SW = new Map(); // card -> { th: swing, om: swing speed, h: glow, at/kick: a push due later }
let hall = [], hovCard = -1, overHall = false, lastT = 0; // hall: cards on screen in the last paint, nearest last
const inQuad = (x, y, Q) => { let sg = 0; for (let k = 0; k < 4; k++) { const [ax, ay] = Q[k], [bx, by] = Q[(k + 1) % 4], c = Math.sign((bx - ax) * (y - ay) - (by - ay) * (x - ax)); if (c) { if (sg && c !== sg) return false; sg = c; } } return true; };
function hoverHall(on, time) {
  let hit = -1;
  if (on) for (let k = hall.length - 1; k >= 0; k--) { const [i, ...Q] = hall[k]; if (inQuad(mx, my, Q)) { hit = i; break; } }
  if (hit !== hovCard) {
    hovCard = hit;
    if (hit >= 0) {
      const [s, , , , , , n, ri] = DEV[hit]; tick(1900, .02);
      if (motion) for (let j = -3; j <= 3; j++) { const id = RAIL.get(`${s},${ri},${n + j}`); if (id === undefined) continue;
        const st = SW.get(id) || { th: 0, om: 0, h: 0, at: 0, kick: 0 }; st.at = time + Math.abs(j) * .07; st.kick = 2.4 / (1 + Math.abs(j) * 1.3); SW.set(id, st); }
      else if (!SW.has(hit)) SW.set(hit, { th: 0, om: 0, h: 0, at: 0, kick: 0 });
    }
  }
  const dt = clamp(time - lastT, 0, .05); lastT = time;
  for (const [i, st] of SW) {
    if (st.at && time >= st.at) { st.om += st.kick; st.at = 0; }
    st.h += ((i === hovCard ? 1 : 0) - st.h) * .15;
    st.om += (-38 * st.th - 4.5 * st.om) * dt; st.th += st.om * dt; // a damped spring: about one swing a second, settled in ~1.5s
    if (!st.at && i !== hovCard && Math.abs(st.th) < .002 && Math.abs(st.om) < .02 && st.h < .01) SW.delete(i);
  }
}
function drawCorridor(alpha, camZ, time, gx, gy, gw) {
  if (alpha <= 0) return;
  hoverHall(alpha >= 1 && overHall, time);
  { // the fade-in goes through the same cached picture, faded as a whole: painting it directly every frame made the fly-in stutter
    // the breeze sway is slow, so it repaints the hall only 20 times a second: every frame halved the frame rate
    const key = [camZ.toFixed(3), SW.size ? time : wind > 0 ? Math.floor(time * 20) : 0, light.map(v => v | 0).join(), cv.width, cv.height, gx | 0, gy | 0, gw | 0].join();
    // if a repaint was slow (over ~8ms), the next one waits twice that long: on a slow machine the hall updates less often
    // instead of dragging scrolling and everything else on the page down with it. vKey stays stale, so it catches up once at rest
    if (key !== vKey && time >= vNext) { const t0 = performance.now();
      // the swaying hall repaints often, so it is painted at reduced resolution: it is dark and soft, the screen and text stay sharp
      // sized only when the window changes: setting a canvas size throws its pixels away and allocates new ones, far too slow to do per repaint
      const VS = .7, vw = Math.round(W * VS), vh = Math.round(H * VS); vKey = key; if (vc.width !== vw || vc.height !== vh) { vc.width = vw; vc.height = vh; }
      const keep = cx; cx = vc.getContext("2d"); cx.setTransform(VS, 0, 0, VS, 0, 0); paintVault(1, camZ, gx, gy, gw); cx = keep;
      const ms = performance.now() - t0; vNext = ms > 8 ? time + ms / 500 : 0;
    }
    if (vc.width && vc.height) { cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalAlpha = alpha; cx.drawImage(vc, 0, 0, cv.width, cv.height); cx.restore(); } // empty while the window has no size
  }
  const f = H * .95, VY = H * .27, ZG = camZ + 5.5;
  cx.save(); cx.globalAlpha = alpha;
  for (const [x, y, z0, v] of DUST) {
    const z = ((z0 + time * .3 * (motion ? 1 : 0)) % 30) + camZ + .5, d = Math.max(.05, z - camZ);
    const xx = x + Math.sin(time * .3 + v * 9) * .1, l = Math.exp(-Math.hypot(xx * .7, (y + .4) * .7, (z - ZG) * .32) / 2);
    cx.fillStyle = `rgba(${Math.min(255, light[0] * 1.3) | 0},${Math.min(255, light[1] * 1.3) | 0},${Math.min(255, light[2] * 1.3) | 0},${l * v})`;
    cx.fillRect(W / 2 + xx * f / d, VY + y * f / d, 1.4, 1.4);
  }
  cx.restore();
}

// ======================= breeze: dust and air streaks blowing down the hall, over the whole first page =======================
let wind = 0, windT = 0; // breeze strength (0-1) and its clock, set each frame; the hall's cards lean with it
// the breeze blows from behind the viewer down the hall: motes and streaks drift away from the camera toward the far end
const MOTE = Array.from({ length: 320 }, (_, i) => { const r = rng(i * 41 + 11); r(); return [(r() - .5) * 7, -4.6 + r() * 8, r() * 14, r() * 7, .6 + r() * .8]; });
const GUST = Array.from({ length: 24 }, (_, i) => { const r = rng(i * 67 + 3); r(); return [(r() - .5) * 5, -4.4 + r() * 7, r() * 14, .8 + r() * 1.2, r() * 7]; });
function drawWind(alpha, t) {
  wx.setTransform(1, 0, 0, 1, 0, 0); wx.clearRect(0, 0, wv.width, wv.height);
  if (alpha <= 0 || !motion) return;
  wx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const f = H * .95, VY = H * .27, g = .8 + .2 * Math.sin(t * .5), lit = light.map(v => Math.min(255, v * 1.4 + 60) | 0).join();
  const P = (x, y, d) => [W / 2 + x * f / d, VY + y * f / d], fade = d => clamp((d - .25) / .5) * clamp((14 - d) / 5);
  wx.save(); wx.globalAlpha = alpha; wx.lineCap = "round"; wx.lineWidth = 1.4;
  for (const [x, y, z0, len, ph] of GUST) { // faint streaks of air running down the hall
    const d = .3 + (z0 + t * .9 * g) % 14, a = .2 * fade(d) * (.6 + .4 * Math.sin(t * .7 + ph));
    if (a <= .005) continue;
    const [ax, ay] = P(x, y, d), [bx, by] = P(x, y, d + len);
    const gr = wx.createLinearGradient(ax, ay, bx, by); gr.addColorStop(0, `rgba(${lit},0)`); gr.addColorStop(.4, `rgba(${lit},${a})`); gr.addColorStop(1, `rgba(${lit},0)`);
    wx.strokeStyle = gr; wx.beginPath(); wx.moveTo(ax, ay); wx.lineTo(bx, by); wx.stroke();
  }
  for (const [x, y, z0, ph, s] of MOTE) { // dust motes drifting away down the hall, wavering a little as they go
    const d = .3 + (z0 + t * .45 * g) % 14, a = fade(d) * (.55 + .4 * Math.abs(Math.sin(t * .8 + ph)));
    if (a <= .01) continue;
    const [px, py] = P(x + Math.sin(t * .6 + ph) * .05, y + Math.cos(t * .5 + ph) * .04, d), r = clamp(s * 4.5 / d, 1.1, 3.5);
    wx.fillStyle = `rgba(${lit},${a})`; wx.fillRect(px - r / 2, py - r / 2, r, r);
  }
  wx.restore();
}

// ======================= name -> particles =======================
let parts = [];
function burst() {
  const el = $("who"), r = el.getBoundingClientRect(), o = document.createElement("canvas");
  o.width = Math.ceil(r.width) + 4; o.height = Math.ceil(r.height) + 4;
  const c = o.getContext("2d"), cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
  c.fillStyle = "#fff"; c.textBaseline = "middle";
  c.font = `300 ${fs}px "Martian Grotesk"`; c.fillText("Gaurav ", 2, o.height / 2);
  const w1 = c.measureText("Gaurav ").width; c.font = `600 ${fs}px "Martian Grotesk"`; c.fillText("Kaushal", 2 + w1, o.height / 2);
  const d = c.getImageData(0, 0, o.width, o.height).data, pr = cv.getBoundingClientRect();
  // landing spots: the top-bar name, drawn where its words sit on the page; the dot's spots stay orange
  const T = [], mark = document.querySelector(".bar__mark"), mr = mark.getBoundingClientRect(), t = document.createElement("canvas");
  t.width = Math.ceil(mr.width) + 8; t.height = Math.ceil(mr.height) + 8;
  const tc = t.getContext("2d"), mfs = parseFloat(getComputedStyle(mark).fontSize); tc.textBaseline = "middle"; tc.fillStyle = "#fff";
  for (const sel of ["span", "b"]) { const el = mark.querySelector(sel), e = el.getBoundingClientRect();
    tc.font = `${getComputedStyle(el).fontWeight} ${mfs}px "Martian Grotesk"`; tc.fillText(el.textContent, e.left - mr.left + 4, e.top - mr.top + 4 + e.height / 2); }
  const td = tc.getImageData(0, 0, t.width, t.height).data;
  for (let y = 0; y < t.height; y++) for (let x = 0; x < t.width; x++) if (td[(y * t.width + x) * 4 + 3] > 110) T.push([mr.left - pr.left + x - 4, mr.top - pr.top + y - 4, 0]);
  const dot = mark.querySelector(".pt").getBoundingClientRect();
  for (let k = 0; k < 6; k++) T.push([dot.left - pr.left + dot.width / 2 + (Math.random() - .5) * 2, dot.top - pr.top + dot.height / 2 + (Math.random() - .5) * 2, 1]);
  if (!T.length) return;
  const t0 = performance.now();
  for (let y = 0; y < o.height; y += 2) for (let x = 0; x < o.width; x += 2) if (d[(y * o.width + x) * 4 + 3] > 120) {
    const [tx, ty, hot] = T[Math.random() * T.length | 0], sx = r.left - pr.left + x, sy = r.top - pr.top + y, a = Math.random() * 2 * Math.PI, s = 40 + Math.random() * 150;
    // first the name blows apart (control point), then each dot curves into its spot in the bar
    parts.push({ sx, sy, tx, ty, kx: sx + Math.cos(a) * s + (tx - sx) * .25, ky: sy + Math.sin(a) * s * .7 + (ty - sy) * .1,
      t0: t0 + x / o.width * 260 + Math.random() * 320, dur: 1050 + Math.random() * 450, ph: Math.random() * 7, hot: hot || Math.random() < .07 });
  }
  partEnd = t0 + 2100;
}
let partEnd = 0;
function drawParts(now) {
  if (!parts.length) return;
  const mark = document.querySelector(".bar__mark");
  let landed = 0;
  for (const p of parts) {
    const u = clamp((now - p.t0) / p.dur), e = eio(u), q = 1 - e, wob = Math.sin(now / 160 + p.ph) * 6 * Math.sin(Math.PI * u);
    if (u >= 1) landed++;
    const x = q * q * p.sx + 2 * q * e * p.kx + e * e * p.tx + wob, y = q * q * p.sy + 2 * q * e * p.ky + e * e * p.ty + wob * .6;
    const after = Math.max(0, now - p.t0 - p.dur) / 350, s = lerp(1.8, 1, e);
    cx.globalAlpha = clamp(u * 6) * (1 - clamp(after)); if (cx.globalAlpha <= 0) continue;
    cx.fillStyle = p.hot ? "#fb5e28" : "#f2f2ef"; cx.fillRect(x - s / 2, y - s / 2, s, s);
  }
  cx.globalAlpha = 1;
  // the real name fades in as the dots land, then the dots dissolve into it
  mark.style.opacity = eio(landed / parts.length);
  if (now > partEnd + 400 && landed === parts.length) { parts = []; mark.style.opacity = ""; }
}

// ======================= gate title cards =======================
function card(canvas) {
  const ctx = canvas.getContext("2d"); let i = 0, t0 = 0, prev = -1;
  return {
    set(k, now) { if (k === i && t0) return; prev = t0 ? i : -1; i = k; t0 = now; },
    draw(now) {
      const w = canvas.clientWidth, h = canvas.clientHeight; if (!w) return;
      const d = Math.min(2, devicePixelRatio || 1);
      if (canvas.width !== Math.round(w * d)) { canvas.width = Math.round(w * d); canvas.height = Math.round(h * d); }
      ctx.setTransform(d, 0, 0, d, 0, 0);
      const fadeIn = clamp((now - t0) / 1600);
      if (prev >= 0 && fadeIn < 1) paint(prev, 1);
      paint(i, prev >= 0 ? fadeIn : 1);
      function paint(k, a) {
        const [, lab, , bg, big, ink, und, , [l1, bigs, l3]] = GATE[k], el = (now - t0) / 1000;
        ctx.globalAlpha = a; ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
        const g = ctx.createRadialGradient(w * .3, h * .2, 0, w * .3, h * .2, w * .8); g.addColorStop(0, "rgba(255,255,255,.14)"); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        // header strip, like a broadcast slate
        const hs = Math.max(6, w * .012);
        ctx.font = `600 ${hs}px "Martian Grotesk"`; ctx.textBaseline = "middle";
        ctx.fillStyle = ink; ctx.globalAlpha = a * .75; ctx.textAlign = "left"; ctx.fillText("● GAURAV KAUSHAL", w * .035, h * .07);
        ctx.textAlign = "right"; ctx.fillText(lab.toUpperCase() + " · 2026", w * .965, h * .07);
        ctx.globalAlpha = a;
        // kinetic type: small line, big cycling word with underline swoosh, small line
        ctx.textAlign = "left";
        const s1 = w * .058, s2 = w * .135, cyc = motion ? el / 2.4 : 0, wi = Math.floor(cyc) % bigs.length, ph = cyc - Math.floor(cyc);
        const X = w * .1;
        ctx.fillStyle = ink; ctx.font = `600 ${s1}px "Martian Grotesk"`; ctx.fillText(l1, X, h * .3);
        ctx.save(); ctx.beginPath(); ctx.rect(0, h * .37, w, h * .25); ctx.clip();
        const inK = ease(ph / .16), outK = eio((ph - .88) / .12), dy = (1 - inK) * h * .22 - outK * h * .22;
        ctx.font = `800 ${s2}px "Martian Grotesk"`; let word = bigs[wi], mw = ctx.measureText(word).width;
        if (mw > w * .82) { ctx.font = `800 ${s2 * w * .82 / mw}px "Martian Grotesk"`; mw = w * .82; }
        ctx.fillStyle = big; ctx.fillText(word, X, h * .49 + dy);
        ctx.restore();
        ctx.strokeStyle = und; ctx.lineWidth = Math.max(2, w * .008); ctx.lineCap = "round";
        const uw = mw * ease((ph - .1) / .25) * (1 - outK);
        if (uw > 1) { ctx.beginPath(); ctx.moveTo(X, h * .6); ctx.quadraticCurveTo(X + uw / 2, h * .57, X + uw, h * .6); ctx.stroke(); }
        ctx.fillStyle = ink; ctx.font = `600 ${s1}px "Martian Grotesk"`; ctx.fillText(l3, X, h * .7);
        ctx.globalAlpha = 1;
      }
    }
  };
}

// ======================= chevron field (make section) =======================
// the scene is drawn small, then each pixel becomes one "v" chevron tinted by that pixel, like the reference
const PAL = [["#61dafb","#fb5e28"],["#fb5e28","#ffb26b"],["#47a248","#61dafb"],["#ff9900","#f38020"],["#14b8a6","#99f6e4"],["#3776ab","#ffd43b"]];
function film(canvas) {
  const ctx = canvas.getContext("2d"), off = document.createElement("canvas"), o = off.getContext("2d", { willReadFrequently: true });
  let title = "", pal = PAL[0], seed = 0, fade = 1;
  return {
    set(tt, k) { if (tt === title) return; title = tt; pal = PAL[k % PAL.length]; seed = k * 2.7; fade = 0; },
    draw(time) {
      const w = canvas.clientWidth, h = canvas.clientHeight; if (!w) return;
      const d = Math.min(2, devicePixelRatio || 1);
      if (canvas.width !== Math.round(w * d)) { canvas.width = Math.round(w * d); canvas.height = Math.round(h * d); }
      const cw = Math.max(9, w / 54), ch = cw * 1.06, cols = Math.floor(w / cw), rows = Math.floor(h / ch);
      off.width = cols; off.height = rows;
      o.fillStyle = pal[0]; o.fillRect(0, 0, cols, rows);
      o.fillStyle = "rgba(0,0,0,.12)"; o.fillRect(0, 0, cols, rows);
      pal.forEach((c, k) => {
        const x = cols * (.5 + .5 * Math.sin(time * .3 + k * 2.4 + seed)), y = rows * (.5 + .5 * Math.cos(time * .25 + k * 1.9 + seed));
        const g = o.createRadialGradient(x, y, 0, x, y, cols * .5); g.addColorStop(0, c); g.addColorStop(1, "rgba(0,0,0,0)");
        o.fillStyle = g; o.fillRect(0, 0, cols, rows);
      });
      // a bright card with the title cut out of it
      const bw = cols * .56, bh = rows * .5, bx = (cols - bw) / 2, by = (rows - bh) / 2 + Math.sin(time * .8) * rows * .02;
      o.fillStyle = "#fff"; o.beginPath(); o.roundRect(bx, by, bw, bh, 2); o.fill();
      let fs = bh * .5; o.font = `800 ${fs}px "Martian Grotesk", sans-serif`;
      const mw = o.measureText(title).width; if (mw > bw * .86) { fs *= bw * .86 / mw; o.font = `800 ${fs}px "Martian Grotesk", sans-serif`; }
      o.fillStyle = "#000"; o.textAlign = "center"; o.textBaseline = "middle"; o.fillText(title, cols / 2, by + bh / 2);
      const px = o.getImageData(0, 0, cols, rows).data;
      fade = Math.min(1, fade + .05);
      ctx.setTransform(d, 0, 0, d, 0, 0); ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = Math.max(1.6, cw * .2); ctx.lineCap = "round"; ctx.lineJoin = "round";
      const paths = new Map();
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        // dissolve in from the left after a change
        const q = (y * cols + x) * 4, show = fade * 1.6 - x / cols * .6 > 0;
        let r = px[q], g = px[q + 1], b = px[q + 2], l = (r + g + b) / 765;
        if (!show) { r = g = b = 0; l = 0; }
        else { const m = Math.max(r, g, b, 1), k = 255 / m; r = Math.min(255, r * k); g = Math.min(255, g * k); b = Math.min(255, b * k); }
        const key = l < .06 ? "rgba(242,242,239,.09)" : `rgba(${r & 0xf0 | 0},${g & 0xf0 | 0},${b & 0xf0 | 0},${l > .5 ? 1 : .85})`;
        let path = paths.get(key); if (!path) paths.set(key, path = new Path2D());
        const X = x * cw, Y = y * ch;
        path.moveTo(X + cw * .14, Y + ch * .28); path.lineTo(X + cw * .5, Y + ch * .7); path.lineTo(X + cw * .86, Y + ch * .28);
      }
      for (const [k, path] of paths) { ctx.strokeStyle = k; ctx.stroke(path); }
    }
  };
}
const mfilm = film($("mcv"));

// ======================= gate + pager =======================
let gi = -1;
const hero = $("top");
const heroP = () => clamp(-hero.getBoundingClientRect().top / (hero.offsetHeight - innerHeight)) || 0; // NaN while the window has no size
const pageBtns = [...$("pager").children];
pageBtns.forEach((b, i) => b.onclick = () => scrollToHero(i));
// one screen per project, each hung at its own place along the hall. Scrolling moves the camera: it flies past the current screen
// (which grows and leaves over your head) while the next one comes up from the distance. Projects without a film show a title card
const gates = [...document.querySelectorAll(".gate")];
const gcards = gates.map((g, i) => { if (g.querySelector("video")) return null; const c = card(g.querySelector("canvas")); c.set(i, 1); return c; });
gates.forEach((g, i) => { g.style.zIndex = 2 + GATE.length - i; g.querySelector(".play").onclick = e => { if (openViewer(GATE[i][0])) e.preventDefault(); }; });
// camera position in screens (0 = at the first, 1 = at the second…): each stretch of scroll rests on a screen, then travels to the next
const camQ = p => { const f = Math.min(GATE.length - 1, p * GATE.length), i = Math.floor(f); return i + sstep(.15, .85, f - i); };
function placeGates(q, gIn) {
  gates.forEach((g, k) => {
    // rel: how many screens ahead of the camera this one hangs, negative once passed. Arriving after tuning in is the same approach from afar
    const rel = k - q + (1 - gIn) * 1.2, s = rel > -.4 ? 2.6 / (2.6 + rel * 6) : 9, o = clamp((.95 - rel) / .35) * clamp((2.4 - s) / 1), near = Math.abs(rel) < .5;
    g.style.visibility = o > 0 ? "" : "hidden"; g.style.setProperty("--gs", s); g.style.setProperty("--go", o);
    g.style.setProperty("--gy", `${Math.min(0, -280 * (s - 1))}%`); // a screen you are passing rises out over your head as it grows g.classList.toggle("live", Math.abs(rel) < .06);
    const v = g.querySelector("video"); if (v && v.dataset.far !== String(+!near)) { v.dataset.far = +!near; syncVid(); } // a film only plays on the screen you are at
  });
}
function setGate(i) {
  if (i === gi) return; if (gi >= 0) tick(900, .05); gi = i;
  pageBtns.forEach((d, j) => d.setAttribute("aria-current", j === i));
}
// product films play only while shown (.on), on screen, near the camera and with motion on
const vidSeen = new WeakMap();
const vidIO = new IntersectionObserver(es => { es.forEach(e => vidSeen.set(e.target, e.isIntersecting)); syncVid(); });
document.querySelectorAll(".gvid").forEach(v => { v.muted = true; vidIO.observe(v); }); // React leaves the muted attribute off, and unmuted films cannot autoplay
function syncVid() { document.querySelectorAll(".gvid").forEach(v => v.classList.contains("on") && v.dataset.far !== "1" && motion && vidSeen.get(v) !== false ? v.play().catch(() => {}) : v.pause()); }
function scrollToHero(i) { scrollTo({ top: hero.getBoundingClientRect().top + scrollY + i / GATE.length * (hero.offsetHeight - innerHeight) + 1, behavior: motion ? "smooth" : "auto" }); }

// ======================= make section =======================
const mk = $("make");
const items = [...$("mlist").children];
items.forEach((li, i) => li.querySelector("button").onclick = () => scrollTo({ top: mk.getBoundingClientRect().top + scrollY + (i + .5) / MAKE.length * (mk.offsetHeight - innerHeight), behavior: motion ? "smooth" : "auto" }));
let mi = -1;
function setMake(i) {
  if (i === mi) return; if (mi >= 0) tick(1200); mi = i; items.forEach((li, j) => li.classList.toggle("on", j === i));
  const [n, l, h] = MAKE[i][2][0];
  $("mtab").innerHTML = `<b>${n}</b> <span>${l}</span>`; $("mtab").href = h; $("mplay").href = h;
  mfilm.set(MAKE[i][3], i);
  const v = $("mvid"), f = FILMS[n];
  if (f && v.dataset.f !== f) { v.dataset.f = f; v.poster = f + "-poster.jpg"; v.innerHTML = `<source src="${f}.webm" type="video/webm"><source src="${f}.mp4" type="video/mp4">`; v.load(); }
  v.classList.toggle("on", !!f); syncVid();
}
setMake(0);

// ======================= about: a point draws the timeline =======================
const op = $("op"), opw = $("opw"), pen = $("pen"); let ci = 0, cf = 0;
const LANE = [0, -20, 0, 20, 0, -20];
const GAP = 22; // space between the timeline and its cards           // sideways bends between chapters
const sstep = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
let S = 320;
const pathX = y => { const i = Math.max(0, Math.min(OP.length - 1, Math.floor(y / S))); const n = Math.min(OP.length - 1, i + 1);
  return y < 0 ? LANE[0] : lerp(LANE[i], LANE[n], sstep(.06, .3, (y - i * S) / S)); };
const planes = [...opw.querySelectorAll(".op-pl")], ticks = [...opw.querySelectorAll(".op-tick")];
function layoutOp() {
  S = Math.max(300, innerHeight * .46);
  planes.forEach((el, i) => {
    const y = i * S, x = pathX(y + 1);
    el.style.top = `${y - el.offsetHeight}px`;
    el.style.left = i % 2 ? `${x - el.offsetWidth - GAP}px` : `${x + GAP}px`;
  });
  ticks.forEach((el, i) => {
    const at = TICKS_AT[i][0], y = at * S, left = Number.isInteger(at) ? at % 2 === 0 : false; // right-hand card -> tick on the left
    el.style.top = y + "px"; el.classList.toggle("lt", left);
    el.style.left = left ? `${pathX(y) - 14 - el.offsetWidth}px` : `${pathX(y) + 14}px`;
  });
}
addEventListener("resize", layoutOp); document.fonts && document.fonts.ready.then(layoutOp); layoutOp();
const pathD = (a, b) => { let d = ""; for (let y = a; y <= b; y += 6) d += (d ? "L" : "M") + pathX(y).toFixed(1) + " " + y.toFixed(1); return d + `L${pathX(b).toFixed(1)} ${b.toFixed(1)}`; };
let oi = -1;
function setOp(i) {
  if (i === oi) return; if (oi >= 0) tick(700, .05); oi = i; const [yr, , tt] = OP[i];
  $("opn").textContent = `${String(i + 1).padStart(2, "0")}/${String(OP.length).padStart(2, "0")}`;
  scramble($("opt"), tt, 380); scramble($("opy"), yr, 300);
}
setOp(0);
// last card's little screen cycles through the two AI projects
const opcard = card($("opmc")); let opm = 0;
setInterval(() => { if (!motion) return; opm = 1 - opm; opcard.set(opm, performance.now()); $("opmt").textContent = GATE[opm][0]; $("opmn").textContent = `0${opm + 1}/02`; document.querySelectorAll(".gvid[data-o]").forEach(v => v.classList.toggle("on", opm === +v.dataset.o)); syncVid(); }, 3200);
$("again").onclick = () => scrollTo({ top: op.getBoundingClientRect().top + scrollY, behavior: "auto" });

// closing screen: the name as a field of chevrons
const finc = $("finc"), fctx = finc.getContext("2d"), foff = document.createElement("canvas"), fo = foff.getContext("2d", { willReadFrequently: true });
function drawFinal(k, time) {
  const w = finc.clientWidth, h = finc.clientHeight, d = Math.min(2, devicePixelRatio || 1);
  if (finc.width !== Math.round(w * d) || finc.height !== Math.round(h * d)) { finc.width = Math.round(w * d); finc.height = Math.round(h * d); }
  const cw = Math.max(7, w / 150), ch = cw * 1.1, cols = Math.ceil(w / cw), rows = Math.ceil(h / ch);
  foff.width = cols; foff.height = rows;
  fo.fillStyle = "#000"; fo.fillRect(0, 0, cols, rows);
  let fs = rows * .24; fo.font = `700 ${fs}px "Martian Grotesk"`; const t1 = "Gaurav ", t2 = "Kaushal";
  let tw = fo.measureText(t1 + t2).width; if (tw > cols * .86) { fs *= cols * .86 / tw; fo.font = `700 ${fs}px "Martian Grotesk"`; tw = fo.measureText(t1 + t2).width; }
  const x0 = (cols - tw) / 2 - fs * .15, ty = rows * .3; fo.textBaseline = "middle";
  fo.fillStyle = "#555"; fo.fillText(t1, x0, ty); fo.fillStyle = "#fff"; fo.fillText(t2, x0 + fo.measureText(t1).width, ty);
  const px = fo.getImageData(0, 0, cols, rows).data;
  fctx.setTransform(d, 0, 0, d, 0, 0); fctx.clearRect(0, 0, w, h);
  fctx.lineWidth = Math.max(1.1, cw * .17); fctx.lineCap = "round"; fctx.lineJoin = "round";
  const P = [new Path2D(), new Path2D(), new Path2D()], sweep = k * 1.4;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const v = px[(y * cols + x) * 4], on = x / cols < sweep - .3 + Math.sin(y * .7 + time) * .02;
    const b = !on || v < 40 ? 0 : v < 160 ? 1 : 2, X = x * cw, Y = y * ch;
    P[b].moveTo(X + cw * .15, Y + ch * .3); P[b].lineTo(X + cw * .5, Y + ch * .7); P[b].lineTo(X + cw * .85, Y + ch * .3);
  }
  fctx.strokeStyle = "rgba(242,242,239,.06)"; fctx.stroke(P[0]);
  fctx.strokeStyle = "rgba(242,242,239,.42)"; fctx.stroke(P[1]);
  fctx.strokeStyle = "#f2f2ef"; fctx.stroke(P[2]);
  if (k > .6) { fctx.fillStyle = "#fb5e28"; fctx.beginPath(); fctx.arc((x0 + tw) * cw + fs * cw * .2, ty * ch + fs * ch * .22, fs * cw * .07, 0, 7); fctx.fill(); }
}

function frameOp(now) {
  const orr = op.getBoundingClientRect(), vh = innerHeight;
  if (orr.bottom < 0 || orr.top > vh) return;
  const opP = clamp(-orr.top / (op.offsetHeight - vh)) || 0;
  const last = (OP.length - 1) * S, end = last + S * .7;
  // each chapter holds while its card plays, then the point travels on to the next one
  const follow = clamp(opP / .78), tt = follow * OP.length; ci = Math.min(OP.length - 1, Math.floor(tt)); cf = tt - ci;
  const penY = Math.min(end, (ci + sstep(.6, 1, cf) * (ci === OP.length - 1 ? .7 : 1)) * S);
  const ov = eio((opP - .79) / .08), fin = clamp((opP - .88) / .07);
  // camera: follow the pen, then pull back to show the whole path
  const top = -S * .9, sc = lerp(1, Math.min(1, vh * .62 / (end - top)), ov);
  const ty = lerp(-penY, (vh * .5 - vh * .72) - sc * (top + end) / 2, ov);
  opw.style.transform = `translate(0px,${ty}px) scale(${sc})`;
  opw.style.opacity = 1 - fin; $("opg").style.opacity = 1 - fin;
  $("optr").setAttribute("d", pathD(top - vh, penY));
  $("opfut").setAttribute("d", pathD(penY, end + vh));
  const px = op.querySelector(".op-stage").clientWidth * .52 + pathX(penY) * sc, py = vh * .72 + ty + penY * sc;
  pen.style.transform = `translate(${px}px,${py}px)`; pen.style.left = "0"; pen.style.top = "0"; pen.style.opacity = 1 - fin;
  const cur = Math.min(OP.length - 1, Math.floor(penY / S + .001));
  planes.forEach((el, i) => {
    const u = i < ci ? 1 : i > ci ? 0 : sstep(0, .6, cf);
    el.classList.toggle("in", penY >= i * S - 2 || ov > .3); el.classList.toggle("on", i === cur || ov > .3);
    el.style.setProperty("--u", u);
    if (i === 2) el.querySelectorAll(".op-pipe span").forEach((s, j) => s.classList.toggle("on", u * 4.2 > j + .3));
    if (i === 4) { const done = u > .45; el.classList.toggle("done", done); el.querySelector(".st").textContent = done ? "SAA-C03 · Certified" : "Exam booked"; }
  });
  setOp(cur);
  $("ophd").style.opacity = ov > .5 ? (fin > 0 ? 0 : 1) : 1; $("opy").style.opacity = 1 - ov;
  $("final").classList.toggle("in", fin > .5);
  finc.style.opacity = fin;
  if (fin > 0) drawFinal(fin, now / 1000);
  if (cur === 5 && fin < 1) opcard.draw(now);
}
opcard.set(0, performance.now());

// ======================= intro -> tune in -> vault =======================
// intro: dot (0-.6s), ring opens (.6-1.3s), knob sweeps & wedges flash in (1.3-3.3s), settle (3.3-4.1s)
// enter: knob sweeps again painting ticks orange (0-1.1s), dial collapses + name bursts (1.1-1.8s), corridor + window fly in (1.6-3.2s)
const T0 = performance.now();
let tEnter = null, entered = false;
const root = document.documentElement;
const deepLink = location.hash && location.hash !== "#top";
const lenis = new Lenis();
const lock = on => { root.classList.toggle("lock", on); lenis && (on ? lenis.stop() : lenis.start()); };
if (!deepLink && scrollY < 5) lock(true); else { tEnter = -1e9; }
if (!motion) tEnter = -1e9;
function enter() { if (tEnter === null) { tEnter = performance.now(); } }
$("tune").onclick = enter; cv.onclick = enter;
$("dial").addEventListener("click", e => { if (e.target.closest(".who,svg")) enter(); }, { signal: ac.signal });
addEventListener("wheel", e => { if (tEnter === null) { e.preventDefault(); enter(); } }, { passive: false });
addEventListener("touchmove", () => enter(), { passive: true });
addEventListener("keydown", e => { if (tEnter === null && [" ", "ArrowDown", "PageDown", "Enter"].includes(e.key)) { e.preventDefault(); enter(); } });
$("sound").onclick = e => { sound = !sound; const b = e.currentTarget; b.setAttribute("aria-pressed", sound); b.lastChild.textContent = sound ? "Sound on" : "Sound off"; tick(); };
$("motion").onclick = e => { motion = !motion; const b = e.currentTarget; b.setAttribute("aria-pressed", motion); b.lastChild.textContent = motion ? "Motion on" : "Motion off"; syncVid(); if (lenis) lenis.options.lerp = motion ? .1 : 1; };

// ======================= cursor =======================
const cur = $("cur"); let mx = 0, my = 0, cx0 = 0, cy0 = 0;
if (matchMedia("(pointer:fine)").matches) {
  root.classList.add("has-cur");
  addEventListener("pointermove", e => { if (!cur.classList.contains("on")) { cx0 = e.clientX; cy0 = e.clientY; cur.classList.add("on"); }
    mx = e.clientX; my = e.clientY; overHall = e.target === cv; cur.classList.toggle("hov", !!e.target.closest("a,button") || (e.target === cv && tEnter === null)); });
  document.addEventListener("pointerleave", () => { cur.classList.remove("on"); overHall = false; }, { signal: ac.signal });
}

// ======================= film viewer =======================
const sources = f => `<source src="${f}.webm" type="video/webm"><source src="${f}.mp4" type="video/mp4">`;
const VIEW = GATE.filter(g => FILMS[g[0]]), viewer = $("viewer"), vv = $("vv"); let vi = 0;
function fillViewer() {
  const [n, l, h] = VIEW[vi], f = FILMS[n];
  $("vn").textContent = `0${vi + 1} / 0${VIEW.length}`; $("vt").textContent = n; $("vl").textContent = l; $("vw").textContent = WHAT[n] || ""; $("vo").href = h;
  vv.poster = f + "-poster.jpg"; vv.innerHTML = sources(f); vv.load(); vv.play().catch(() => {});
}
// true if the project has a film and the viewer took it; otherwise the link goes to GitHub as before
function openViewer(name) {
  const i = VIEW.findIndex(g => g[0] === name); if (i < 0) return false;
  vi = i; fillViewer(); if (!viewer.open) { viewer.showModal(); lock(true); } return true;
}
viewer.addEventListener("close", () => { vv.pause(); lock(root.classList.contains("is-full")); }, { signal: ac.signal });
viewer.onclick = e => { if (e.target === viewer) viewer.close(); };
$("vx").onclick = () => viewer.close();
$("vprev").onclick = () => { vi = (vi + VIEW.length - 1) % VIEW.length; fillViewer(); };
$("vnext").onclick = () => { vi = (vi + 1) % VIEW.length; fillViewer(); };
$("mplay").onclick = e => { if (openViewer(MAKE[mi][2][0][0])) e.preventDefault(); };

// ======================= full view: a dial of every project =======================
const fullEl = $("full"), fvid = $("fvid"), fring = $("fring"), rctx = fring.getContext("2d");
const fItems = [...$("flist").querySelectorAll("a")], fLabs = [...$("flist").querySelectorAll("p")];
fItems.forEach((a, i) => { a.onpointerenter = a.onfocus = () => setFull(i); a.onclick = ev => { if (openViewer(ORDER[i][0])) ev.preventDefault(); }; });
let fi = -1, fm = 0, fmT = 0, FG = null, fTimer; const fAng = [];
function layoutFull() {
  const W = innerWidth, H = innerHeight, R = Math.min(H * .37, W * .24), cx = W / 2, cy = H * .455, row = Math.max(26, H * .045);
  FG = { W, H, R, cx, cy };
  fullEl.style.setProperty("--fw", R * 1.56 + "px"); fullEl.style.setProperty("--fy", cy + "px");
  SIDES.forEach((side, s) => side.forEach((e, k) => {
    // each name starts just outside the ring, so the two columns bend around it
    const i = ORDER.indexOf(e), y = cy + (k - (side.length - 1) / 2) * row, dx = Math.sqrt(Math.max(0, (R + 16) ** 2 - (y - cy) ** 2)) + 14, x = cx + (s ? -dx : dx);
    fItems[i].style.left = x + "px"; fItems[i].style.top = y + "px"; fAng[i] = Math.atan2(y - cy, x - cx);
    if (k === 0) { const y0 = y - row, d0 = Math.sqrt(Math.max(0, (R + 16) ** 2 - (y0 - cy) ** 2)) + 14;
      fLabs[s].style.left = cx + (s ? -d0 : d0) + "px"; fLabs[s].style.top = y0 + "px"; fLabs[s].className = "full__g " + (s ? "l" : "r"); }
  }));
}
function setFull(i) {
  if (i === fi) return; fi = i; const [n, l] = ORDER[i], f = FILMS[n];
  fItems.forEach((a, j) => a.classList.toggle("on", j === i));
  $("fcap").innerHTML = f ? "" : `${n}<span>${l}</span>`;
  $("fwhat").textContent = WHAT[n] || l;
  $("fhint").textContent = `${String(i + 1).padStart(2, "0")} / ${String(ORDER.length).padStart(2, "0")} · Point at a name to see it, click it to open`;
  if (f && fvid.dataset.f !== f) { fvid.dataset.f = f; fvid.poster = f + "-poster.jpg"; fvid.innerHTML = sources(f); fvid.load(); }
  fvid.classList.toggle("on", !!f); syncVid(); tick(1600, .03);
}
// the dial's ticks fly in from a flat line and fold back into it on the way out
const FT = Array.from({ length: 220 }, (_, i) => { const r = rng(i * 53 + 5); return [r(), r()]; });
function drawRing() {
  if (!FG || (fm === 0 && fmT === 0)) return;
  fm = motion ? fm + (fmT - fm) * .06 : fmT; if (Math.abs(fmT - fm) < .002) fm = fmT;
  const { W, H, R, cx, cy } = FG, d = Math.min(2, devicePixelRatio || 1);
  if (fring.width !== Math.round(W * d) || fring.height !== Math.round(H * d)) { fring.width = Math.round(W * d); fring.height = Math.round(H * d); }
  rctx.setTransform(d, 0, 0, d, 0, 0); rctx.clearRect(0, 0, W, H); rctx.lineCap = "round"; rctx.lineWidth = 1;
  const m = eio(fm), fly = Math.sin(Math.PI * fm);
  FT.forEach(([j, k], i) => {
    const a = i / FT.length * 2 * Math.PI - Math.PI / 2;
    const x = lerp(W * (i + .5) / FT.length, cx + Math.cos(a) * R, m), y = lerp(H / 2, cy + Math.sin(a) * R, m), ang = lerp(Math.PI / 2, a, m);
    const len = (i % 5 ? 4 : 9) + fly * j * 70 + (1 - m) * j * 26;
    rctx.strokeStyle = k > .93 ? "#fb5e28" : `rgba(242,242,239,${(.16 + k * .3) * clamp(fm * 5)})`;
    rctx.beginPath(); rctx.moveTo(x, y); rctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); rctx.stroke();
  });
  if (fi >= 0 && fm > .9) {
    const a = fAng[fi]; rctx.strokeStyle = "#fb5e28"; rctx.lineWidth = 2;
    rctx.beginPath(); rctx.moveTo(cx + Math.cos(a) * (R - 4), cy + Math.sin(a) * (R - 4)); rctx.lineTo(cx + Math.cos(a) * (R + 13), cy + Math.sin(a) * (R + 13)); rctx.stroke();
  }
  fullEl.classList.toggle("set", fm > .8 && fmT === 1);
}
function setView(full) {
  clearTimeout(fTimer); root.classList.toggle("is-full", full); lock(full); fmT = full ? 1 : 0; tick(500, .05);
  document.querySelectorAll("#view button").forEach(b => b.setAttribute("aria-pressed", (b.dataset.v === "full") === full));
  if (full) { layoutFull(); fullEl.classList.add("on"); const k = Math.max(0, fi); fi = -1; setFull(k); }
  else { fvid.classList.remove("on"); fvid.pause(); fTimer = setTimeout(() => fullEl.classList.remove("on"), motion ? 900 : 0); }
}
document.querySelectorAll("#view button").forEach(b => b.onclick = () => setView(b.dataset.v === "full"));
const turn = s => setFull((fi + s + ORDER.length) % ORDER.length);
let fHover = false, fWheel = 0;
$("flist").onpointerover = () => fHover = true; $("flist").onpointerleave = () => fHover = false;
setInterval(() => { if (root.classList.contains("is-full") && !fHover && motion && !viewer.open) turn(1); }, 3200);
fullEl.addEventListener("wheel", e => { const now = performance.now(); if (now - fWheel > 160) { fWheel = now; turn(Math.sign(e.deltaY) || 1); } }, { passive: true, signal: ac.signal });
addEventListener("resize", () => root.classList.contains("is-full") && layoutFull());
addEventListener("keydown", e => {
  if (!root.classList.contains("is-full") || viewer.open) return;
  if (e.key === "Escape") setView(false);
  const s = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (s) { e.preventDefault(); turn(s); }
});

let lastFilm = 0, hotTicks = 0, burstDone = false, pres = 0, kAng = 0, tlx = 0, tly = 0; const tickK = [];
function frame(now) {
  lenis && lenis.raf(now); drawRing();
  cx0 += (mx - cx0) * .3; cy0 += (my - cy0) * .3; cur.style.transform = `translate(${cx0}px,${cy0}px)`;
  const it = tEnter !== null && tEnter < 0 ? 99 : (now - T0) / 1000;
  const et = tEnter === null ? -1 : (now - tEnter) / 1000;
  const p = heroP(), vh = innerHeight;

  // ----- dial -----
  const open = ease((it - .6) / .7), sweep = clamp((it - 1.3) / 2), settle = eio((it - 3.3) / .8);
  for (let i = 0; i < N; i++) if (wedgeT[i] < 0 && sweep * 360 >= i * STEP - .5 && (sweep > 0 || it > 90)) {
    wedgeT[i] = now; labs[i].classList.add("in"); if (it < 90) scramble(labs[i], WORDS[i], 420);
  }
  // the wedge under the pointer lights up (mouse only: mx/my are not tracked for touch)
  const pdx = mx - W / 2, pdy = my - H / 2;
  let hi = tEnter === null && cur.classList.contains("on") && Math.hypot(pdx, pdy) > R * .98 ? Math.round((Math.atan2(pdx, -pdy) * 180 / Math.PI + 360) / STEP) % N : -1;
  if (hi >= 0 && wedgeT[hi] < 0) hi = -1;
  if (hi !== hovI) { hovI = hi; if (hi >= 0) tick(1600, .03); }
  for (let i = 0; i < N; i++) { hov[i] += ((i === hovI) - hov[i]) * .14; if (hov[i] < .002) hov[i] = 0; }
  // the inner dial answers the pointer: the knob turns toward it, nearby ticks swell, the dial tilts
  const pOn = tEnter === null && it > 3.3 && cur.classList.contains("on") && Math.hypot(pdx, pdy) > 8;
  pres += ((pOn ? 1 : 0) - pres) * .08;
  const kWant = pOn ? Math.atan2(pdx, -pdy) * 180 / Math.PI : 0;
  kAng += (((kWant - kAng + 540) % 360) - 180) * (tEnter === null ? .12 : .25); kAng = ((kAng + 540) % 360) - 180;
  tlx += ((pOn ? pdx / W * 2 : 0) - tlx) * .08; tly += ((pOn ? pdy / H * 2 : 0) - tly) * .08;
  const tp = tEnter === null ? pres : 0; // ticks hand back to the enter sweep at once
  tickEls.forEach((l, j) => { const d = Math.abs(((j * 2 - kAng + 540) % 360) - 180), k = Math.round(tp * Math.max(0, 1 - d / 16) ** 2 * 20) / 20;
    if (k === tickK[j]) return; tickK[j] = k;
    l.style.stroke = k ? `rgba(${lerp(242, 251, k) | 0},${lerp(242, 94, k) | 0},${lerp(239, 40, k) | 0},${lerp(.42, 1, k)})` : "";
    k ? l.setAttribute("transform", `scale(${1 + k * .05})`) : l.removeAttribute("transform"); });
  const eSweep = eio(et / 1.1), collapse = eio((et - 1.1) / .7), vault = ease((et - 1.5) / 1.6), fly = ease((et - 1.9) / 1.3);
  let rot = sweep * 360 + (et > 0 ? eSweep * 360 : 0) + kAng;
  $("arc").setAttribute("transform", `rotate(${rot - 107.2})`); $("arc").style.opacity = tp * .9;
  // orange tick fill during the enter sweep
  const want = et > 0 ? Math.floor(eSweep * TICKS) : 0;
  if (want !== hotTicks) { if (want % 6 === 0) tick(2400, .015); tickEls.forEach((l, j) => l.classList.toggle("hot", j < want)); hotTicks = want; }
  $("ring").style.strokeDasharray = `${open * 629} 629`;
  $("ring").style.stroke = collapse > 0 ? `rgba(251,94,40,${.8 * (1 - vault)})` : "";
  $("ticks").style.opacity = open * (1 - collapse);
  $("kc").setAttribute("cy", -100 * open); $("kg").setAttribute("cy", -100 * open);
  $("knob").setAttribute("transform", `rotate(${rot})`);
  $("knob").style.opacity = clamp(it / .3) * (1 - vault);
  labs.forEach(l => l.style.opacity = collapse > 0 ? .9 * (1 - collapse * 1.6) : "");
  $("who").classList.toggle("in", it > .9);
  if (collapse > 0 && !burstDone) { burstDone = true; if (it < 90) burst(); $("who").classList.add("gone"); }
  $("tune").classList.toggle("in", it > 3.6 && tEnter === null);
  const dialS = lerp(.9, 1, settle) * lerp(1, .42, collapse);
  $("dial").style.transform = `perspective(${R * 4}px) rotateX(${-tly * 6}deg) rotateY(${tlx * 6}deg) scale(${dialS})`;
  $("dial").style.opacity = 1 - vault;
  $("dial").style.pointerEvents = tEnter === null ? "" : "none";

  // ----- after entering -----
  if (et > 2.6 && !entered) { entered = true; lock(false); ["bar", "dock", "ctaPill", "pager", "view"].forEach(id => $(id).classList.add("on")); }
  if (tEnter !== null && tEnter < 0 && !entered) { entered = true; lock(false); ["bar", "dock", "ctaPill", "pager", "view"].forEach(id => $(id).classList.add("on")); }
  const gIn = tEnter !== null && tEnter < 0 ? 1 : fly, q = camQ(p), qa = Math.floor(q), qb = Math.min(GATE.length - 1, qa + 1);
  placeGates(q, gIn); setGate(Math.round(q));
  lightT = ZC[qa].map((c, k) => lerp(c, ZC[qb][k], q - qa)); // the hall's light turns to the next project's colour on the way there
  for (let k = 0; k < 3; k++) { light[k] += (lightT[k] - light[k]) * .06; if (Math.abs(lightT[k] - light[k]) < 1.5) light[k] = lightT[k]; }

  // ----- draw -----
  const heroOn = hero.getBoundingClientRect().bottom > 0;
  root.classList.toggle("past", hero.getBoundingClientRect().bottom < innerHeight * .5);
  if (heroOn) {
    cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.fillStyle = "#090c12"; cx.fillRect(0, 0, W, H);
    // wedges (dial background)
    const camS = lerp(.9, 1.1, settle) * lerp(1, .9, collapse), wedgeFade = 1 - collapse;
    wt = motion ? now / 1000 : 0; wpa += ((cur.classList.contains("on") && tEnter === null ? 1 : 0) - wpa) * .08;
    wpx = (mx - W / 2) / camS; wpy = (my - H / 2) / camS;
    if (wedgeFade > 0) {
      cx.setTransform(DPR * camS, 0, 0, DPR * camS, DPR * W / 2, DPR * H / 2);
      for (let i = 0; i < N; i++) {
        if (wedgeT[i] < 0) continue;
        const age = (now - wedgeT[i]) / 1000, a0 = ((i - .5) * STEP - 90) * Math.PI / 180, a1 = ((i + .5) * STEP - 90) * Math.PI / 180;
        // each wedge flashes bright when revealed, then rests dim; the enter sweep flashes them again
        const passed = et > 0 && eSweep * 360 >= i * STEP ? Math.exp(-Math.max(0, et - i * STEP / 360 * 1.1) * 3) : 0;
        const al = clamp(age / .25) * lerp(Math.min(1, .26 + .5 * Math.exp(-age * 1.6) + .45 * passed), 1, hov[i]) * wedgeFade;
        cx.save(); cx.beginPath(); cx.moveTo(0, 0); webLine(cx, i); cx.arc(0, 0, L, a0, a1); webLine(cx, i + 1, true); cx.closePath(); cx.clip();
        cx.globalAlpha = al; cx.drawImage(plate, -L, -L, 2 * L, 2 * L); cx.restore();
      }
      cx.globalAlpha = 1;
      const core = cx.createRadialGradient(0, 0, R * .92, 0, 0, R * 1.25);
      core.addColorStop(0, "#090c12"); core.addColorStop(1, "rgba(9,12,18,0)");
      cx.fillStyle = core; cx.beginPath(); cx.arc(0, 0, R * 1.25, 0, 7); cx.fill();
    }
    // rays outlive the wedges for a moment, as in the reference
    const rayA = Math.min(clamp(sweep * 3), 1 - clamp((et - 1.8) / .5));
    if (rayA > 0) {
      cx.setTransform(DPR * camS, 0, 0, DPR * camS, DPR * W / 2, DPR * H / 2);
      cx.strokeStyle = cx.fillStyle = "#f2f2ef"; cx.lineWidth = 1 / camS;
      const ringA = rayA * clamp(sweep * 2 - 1);
      for (let i = 0; i < N; i++) { if (wedgeT[i] < 0) continue;
        cx.globalAlpha = ringA * (.22 + .55 * hov[i]); cx.beginPath(); RINGS.forEach((m, j) => webRing(cx, i, R * m, j)); cx.stroke(); }
      for (let i = 0; i < N; i++) { if (wedgeT[i] < 0) continue; const a0 = ((i - .5) * STEP - 90) * Math.PI / 180, h = Math.max(hov[i], hov[(i + N - 1) % N]);
        cx.globalAlpha = rayA * (.32 + .6 * h); cx.beginPath(); webLine(cx, i); cx.stroke();
        cx.globalAlpha = rayA * (.5 + .5 * h); cx.beginPath(); cx.arc(Math.cos(a0) * R * SP0, Math.sin(a0) * R * SP0, 1.7 / camS, 0, 7); cx.fill(); }
      cx.globalAlpha = 1;
    }
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const vA = tEnter !== null && tEnter < 0 ? 1 : vault;
    const gr = gates[gi].getBoundingClientRect();
    wind = motion ? vA : 0; windT = now / 1000; // steady through the whole first page, every screen
    drawCorridor(vA, lerp(-16, HALL0, vA) + q * ZL, now / 1000, gr.left + gr.width / 2, gr.top + gr.height * .3, gIn > 0 ? gr.width : 0);
    drawWind(wind, windT);
    drawParts(now);
  }

  // make + about
  const mr = mk.getBoundingClientRect(), mp = clamp(-mr.top / (mk.offsetHeight - vh)) || 0;
  setMake(Math.min(MAKE.length - 1, Math.floor(mp * MAKE.length)));
  frameOp(now);

  if (now - lastFilm > 33) {
    lastFilm = now; const ts = motion ? now / 1000 : 2;
    if (heroOn && gIn > 0) gcards.forEach((c, k) => c && Math.abs(k - q) < 1.1 && c.draw(now));
    if (mr.top < vh && mr.bottom > 0) mfilm.draw(ts);
  }
  raf = requestAnimationFrame(frame);
}
raf = requestAnimationFrame(frame);
return () => { ac.abort(); cancelAnimationFrame(raf); timers.forEach(clearInterval); vidIO.disconnect(); lenis.destroy(); root.classList.remove("lock", "has-cur", "is-full", "past"); };
}
