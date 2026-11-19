import type { CSSProperties, ReactNode } from "react";
import { EMAIL, OP, TICKS_AT } from "@/lib/content";
import Flock from "./Flock";

const bar = (v: string, k = true) => <u className={k ? "k" : undefined} style={{ "--v": v } as CSSProperties}></u>;
const film = (o: string, f: string, on = false) => (
  <video className={on ? "gvid on" : "gvid"} data-o={o} muted loop playsInline preload="metadata" poster={`/${f}-poster.jpg`} aria-hidden="true">
    <source src={`/${f}.webm`} type="video/webm" /><source src={`/${f}.mp4`} type="video/mp4" />
  </video>
);
// the extra markup inside each timeline card, in chapter order
const EXTRA: ReactNode[] = [
  <div className="op-board"><p className="op-row">Overall{bar("83%")}</p><p className="op-row">Maths{bar("88%", false)}</p><p className="op-row">Physics{bar("80%", false)}</p></div>,
  <>
    <p className="op-big">KIET Group of Institutions</p><p className="op-city">Ghaziabad · CGPA 8.5 / 10</p>
    <svg className="op-art" viewBox="0 0 120 100" preserveAspectRatio="xMidYMax meet"><path pathLength="1" d="M4 96h112M14 96V52h92v44M24 96V64h12v32M54 96V60h12v36M84 96V64h12v32M10 52l50-26 50 26M60 26V8m0 0h12v8H60" /></svg>
  </>,
  <div className="op-pipe"><span>Idea</span><span>Prototype</span><span>Pitch</span><span>Finalist</span></div>,
  <div className="op-board"><p className="op-row">React{bar("92%")}</p><p className="op-row">Firebase{bar("74%")}</p><p className="op-row">R2 media{bar("58%")}</p></div>,
  <span className="op-st"><i></i><span className="st">Exam booked</span></span>,
  <div className="op-media">
    <canvas id="opmc"></canvas>
    {film("0", "creatorflow-video/creatorflow-ai", true)}
    {film("1", "netrashield-video/netrashield")}
    <span className="tab" id="opmt">CreatorFlow AI</span><span className="cnt" id="opmn">01/02</span>
  </div>,
];

export default function About() {
  return (
    <section className="op" id="about" aria-labelledby="op-h">
      <div className="op-track" id="op">
        <div className="op-stage">
          <canvas id="finc" aria-hidden="true"></canvas>
          <div className="op-guide" id="opg"></div>
          <div className="op-world" id="opw">
            <svg width="1" height="1" aria-hidden="true"><path className="op-future" id="opfut" /><path className="op-trail" id="optr" /></svg>
            {OP.map(([, y, tt, bd, cls], i) => (
              <article key={tt} className={`op-pl ${i % 2 ? "l" : "r"} ${cls}`}>
                <p className="op-yr">{y}</p><h3 className="op-tt">{tt}</h3>{bd && <p className="op-bd">{bd}</p>}{EXTRA[i]}
              </article>
            ))}
            {TICKS_AT.map(([, t]) => <span key={t} className="op-tick">{t}</span>)}
          </div>
          <div className="op-pen" id="pen"></div>
          <div className="op-fade"></div>
          <div className="op-head" id="ophd">
            <h2 className="op-h" id="op-h"><Flock />About</h2>
            <p className="op-chap"><span className="op-n" id="opn">01/06</span><span id="opt"></span></p>
          </div>
          <div className="op-year" id="opy"></div>
          <div className="op-final" id="final">
            <p className="lead">You get the whole build from one person: the interface, the API, auth, the cloud it runs on and, where it helps, an AI agent on top. Currently studying CSE (AI &amp; ML) at KIET.</p>
            <p className="facts"><b><span>Based in</span>Delhi NCR, India</b><b><span>Certified</span>AWS SAA-C03</b><b><span>Works</span>Remote or on-site</b></p>
            <p className="cta">
              <a className="go" href={EMAIL}><span className="roll"><span>Write an email</span><span aria-hidden="true">Write an email</span></span></a>
              <a href={EMAIL}>{EMAIL.slice(7)}</a>
              <a href="https://linkedin.com/in/gauravkkaushal" target="_blank" rel="noopener">LinkedIn</a>
              <a href="https://github.com/Gauravkkaushal" target="_blank" rel="noopener">GitHub</a>
            </p>
            <p className="small"><span>A point, a path, a portfolio.</span><button type="button" id="again">↺ Draw it again</button></p>
          </div>
        </div>
      </div>
    </section>
  );
}
