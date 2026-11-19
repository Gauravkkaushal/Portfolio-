import type { CSSProperties } from "react";
import { FILMS, GATE, GH, WORDS } from "@/lib/content";

const STEP = 360 / WORDS.length;
const TICKS = Array.from({ length: 180 }, (_, i) => {
  const a = (i * 2 * Math.PI) / 180, s = Math.sin(a), c = -Math.cos(a);
  return [(s * 92.5).toFixed(2), (c * 92.5).toFixed(2), (s * 96).toFixed(2), (c * 96).toFixed(2)];
});

// what each screen hangs from, joined only to the middle of its top edge: two ceiling rails running off overhead, a carriage with a status light,
// then a pole with a sleeve and a coiled cable down to a clamp on the screen
const COIL = "M73 62" + Array.from({ length: 15 }, () => "q7 3 0 6q-7 3 0 6").join("");
const HANGER = (
  <svg className="arm" viewBox="0 0 120 200" aria-hidden="true">
    <path d="M47 44L-70-260h16L55 44zM73 44L190-260h-16L65 44z" fill="#0d0b0d" stroke="#2b2523" strokeWidth=".8" />
    <rect x="30" y="50" width="60" height="3" rx="1.5" fill="#1c1817" />
    <rect x="36" y="34" width="48" height="18" rx="3" fill="#171314" stroke="#3a3230" strokeWidth=".8" />
    <rect className="arm__led" x="50" y="40" width="20" height="5" rx="1.5" />
    <rect x="57" y="52" width="6" height="124" fill="#2b2523" /><rect x="58.5" y="52" width="1.5" height="124" fill="#4a403c" />
    <rect x="52" y="92" width="16" height="46" rx="2" fill="#1c1817" stroke="#3a3230" strokeWidth=".6" />
    <path d="M52 100h16M52 108h16M52 116h16M52 124h16M52 132h16" stroke="#3a3230" strokeWidth=".8" />
    <path d={COIL} fill="none" stroke="#3a3230" strokeWidth="1.6" strokeLinecap="round" />
    <path className="arm__wire" d="M60 44q13 2 13 18M73 152q0 22-13 24" fill="none" strokeWidth="1.2" />
    <rect x="48" y="174" width="24" height="12" rx="2" fill="#1c1817" stroke="#3a3230" strokeWidth=".6" />
    <rect x="34" y="186" width="52" height="14" rx="3" fill="#161314" stroke="#3a3230" strokeWidth=".8" />
  </svg>
);

export default function Hero() {
  return (
    <section className="hero" id="top">
      <h1 className="sr">Gaurav Kaushal, full-stack and AI engineer</h1>
      <div className="hero__pin">
        <header className="bar ui" id="bar">
          <a className="bar__mark" href="#top"><span>Gaurav</span> <b>Kaushal</b><i className="pt"></i></a>
          <nav className="bar__nav" aria-label="Sections"><a href="#work">Work</a><a href="#about">About</a></nav>
          <span></span>
        </header>
        <canvas id="world" aria-hidden="true"></canvas>
        <div className="dial" id="dial">
          <svg viewBox="-130 -130 260 260" aria-hidden="true">
            <circle className="ring" id="ring" r="100" transform="rotate(-90)" />
            <circle className="arc" id="arc" r="100" strokeDasharray="60 629" />
            <g className="ticks" id="ticks">
              {TICKS.map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />)}
            </g>
            <g className="knob" id="knob"><circle className="glow" id="kg" cx="0" cy="0" r="3.4" /><circle id="kc" cx="0" cy="0" r="1.9" /></g>
          </svg>
          <div id="labs">
            {WORDS.map((w, i) => {
              const a = i * STEP;
              return <button key={w} className="lab" type="button" style={{ "--a": a + "deg", ...(a > 90 && a < 270 && { "--f": "180deg" }) } as CSSProperties}>{w}</button>;
            })}
          </div>
          <button className="tune" id="tune" type="button">Click to tune in</button>
          <p className="who" id="who"><span>Gaurav</span> <b>Kaushal</b></p>
        </div>

        {/* one screen per project, each hung at its own depth in the hall: scrolling flies past one and up to the next (lib/scene.ts places them) */}
        {GATE.map(([name, lab, href, , , , , glow]) => {
          const f = FILMS[name];
          return (
            <div className="gate" key={name} style={{ "--glow": glow } as CSSProperties}>
              <div className="frame">
                {HANGER}
                <canvas></canvas>
                {f && (
                  <video className="gvid on" muted loop playsInline preload="metadata" poster={`${f}-poster.jpg`} aria-hidden="true">
                    <source src={`${f}.webm`} type="video/webm" /><source src={`${f}.mp4`} type="video/mp4" />
                  </video>
                )}
                <span className="pill"><b>{name}</b> <span>{lab}</span></span>
                <a className="play" href={href} target="_blank" rel="noopener"><em>{f ? "Watch" : href === GH ? "Open GitHub" : "View on GitHub"}</em><svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 2.8v10.4l8.5-5.2z" /></svg></a>
              </div>
            </div>
          );
        })}
        <canvas id="wind" aria-hidden="true"></canvas>
        <div className="pager ui" id="pager" role="group" aria-label="Featured work">
          {GATE.map(g => <button key={g[0]} type="button" aria-label={g[0]}></button>)}
        </div>
      </div>
    </section>
  );
}
