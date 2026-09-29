import Scene from './Scene.jsx';
import Particles from './Particles.jsx';
import SplitName from './SplitName.jsx';
import { Divider } from './Ornaments.jsx';
import { weddingConfig, copy } from '../config.js';

function Cta({ href, children, solid }) {
  const unset = !href || href === '#';
  return (
    <a
      className={solid ? 'btn btn-solid' : 'btn'}
      href={unset ? '#' : href}
      target={unset ? undefined : '_blank'}
      rel="noopener"
      onClick={unset ? (e) => e.preventDefault() : undefined}
    >
      {children}
    </a>
  );
}

export default function SceneBlessing() {
  return (
    <Scene index={3} id="scene-4" label="With love and blessings" grade="g4">
      <Particles kind="petals" count={12} depth="0.60" />
      <Particles kind="dust" count={16} depth="0.34" />

      <div className="layer s4-copy" data-depth="0.19">
        <p className="eyebrow" data-reveal="0">{copy.closingEyebrow}</p>
        <h2 className="names">
          <SplitName text={weddingConfig.couple1} base={0} />
          <span className="amp small" data-reveal="2" aria-hidden="true">&amp;</span>
          <span className="visually-hidden">and</span>
          <SplitName text={weddingConfig.couple2} base={1} />
        </h2>
        <div className="orn" data-reveal="4" aria-hidden="true"><Divider /></div>
        <p className="closing" data-reveal="5">{copy.closing}</p>
        <p className="sub" data-reveal="6">{copy.closingSub}</p>
        <div className="cta" data-reveal="7">
          <Cta href={weddingConfig.venueUrl}>{copy.venueButton}</Cta>
          <Cta href={weddingConfig.rsvpUrl} solid>{copy.rsvpButton}</Cta>
        </div>
        <p className="tam blessing-end" data-reveal="8">{copy.blessingEnd}</p>
      </div>
    </Scene>
  );
}
