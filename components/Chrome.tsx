import { EMAIL } from "@/lib/content";

// fixed controls, shown after tuning in
export default function Chrome() {
  return (
    <>
      <div className="dock ui" id="dock">
        <span className="here">EN</span>
        <button type="button" id="sound" aria-pressed="true"><i></i><span>Sound on</span></button>
        <button type="button" id="motion" aria-pressed="true"><i></i><span>Motion on</span></button>
      </div>
      <aside className="view ui" id="view" aria-label="View">
        <button type="button" data-v="featured" aria-pressed="true">Featured</button>
        <button type="button" data-v="full" aria-pressed="false" aria-controls="full">Full</button>
      </aside>
      <a className="cta-pill ui" id="ctaPill" href={EMAIL}>
        <span className="roll"><span>Write an email</span><span aria-hidden="true">Write an email</span></span>
      </a>
    </>
  );
}
