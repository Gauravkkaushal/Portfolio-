import { Fragment } from "react";
import { MAKE } from "@/lib/content";
import Flock from "./Flock";

export default function Work() {
  return (
    <section className="make" id="work" aria-labelledby="make-h">
      <div className="make__scene" id="make">
        <div className="make__pin">
          <div className="make__side">
            <h2 className="make__h" id="make-h"><Flock />What I make</h2>
            <ol className="make__list" id="mlist">
              {MAKE.map(([title, s, ex], i) => (
                <li key={title} className="make__item">
                  <button className="make__b" type="button"><span className="make__n">{String(i + 1).padStart(2, "0")}</span><span>{title}</span></button>
                  <div className="make__more"><div>
                    <p className="make__s">{s}</p>
                    <p className="make__ex">{ex.map(([n, l, h], k) => <Fragment key={n}>{k > 0 && ", "}<a href={h} target="_blank" rel="noopener">{n}</a> <span>{l}</span></Fragment>)}</p>
                  </div></div>
                </li>
              ))}
            </ol>
            <p className="make__tools">Stack: React, Next.js, TypeScript, Tailwind, Node, Express, MongoDB, Firebase, AWS, Cloudflare R2, Python, FastAPI, Jest, Vitest.</p>
          </div>
          <div className="make__frame">
            <div className="frame">
              <canvas id="mcv"></canvas>
              <video className="gvid" id="mvid" muted loop playsInline preload="none" aria-hidden="true"></video>
              <a className="pill" id="mtab" target="_blank" rel="noopener"></a>
              <a className="play" id="mplay" target="_blank" rel="noopener" aria-label="Open on GitHub"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 11L11 5M6 5h5v5" /></svg></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
