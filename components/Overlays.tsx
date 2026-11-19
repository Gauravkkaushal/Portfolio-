import { ORDER, isRepo } from "@/lib/content";

// full view of every project, the film viewer dialog, and the custom cursor
export default function Overlays() {
  return (
    <>
      <section className="full" id="full" aria-label="All work">
        <canvas id="fring" aria-hidden="true"></canvas>
        <div className="full__win"><video className="gvid" id="fvid" muted loop playsInline preload="none" aria-hidden="true"></video><p id="fcap"></p></div>
        <div className="full__lists" id="flist">
          {ORDER.map(e => isRepo(e)
            ? <a key={e[0]} className="full__it l" href={e[2]} target="_blank" rel="noopener"><span>{e[1]}</span><b>{e[0]}</b></a>
            : <a key={e[0]} className="full__it r" href={e[2]} target="_blank" rel="noopener"><b>{e[0]}</b><span>{e[1]}</span></a>)}
          <p>Projects</p><p>Repos and more</p>
        </div>
        <p className="full__hint"><b id="fwhat"></b><span id="fhint"></span></p>
      </section>
      <dialog className="viewer" id="viewer" aria-labelledby="vt">
        <div className="viewer__frame"><video id="vv" controls loop playsInline></video></div>
        <div className="viewer__meta">
          <span className="viewer__n" id="vn"></span>
          <div><p className="viewer__t"><b id="vt"></b><span id="vl"></span></p><p className="viewer__w" id="vw"></p></div>
          <a className="vbtn" id="vo" target="_blank" rel="noopener">Open on GitHub ↗</a>
          <button className="vbtn rnd" id="vprev" type="button" aria-label="Previous film">‹</button>
          <button className="vbtn rnd" id="vnext" type="button" aria-label="Next film">›</button>
        </div>
        <button className="vbtn rnd viewer__x" id="vx" type="button" aria-label="Close">✕</button>
      </dialog>
      <div className="cur" id="cur" aria-hidden="true"><b></b><i></i></div>
    </>
  );
}
