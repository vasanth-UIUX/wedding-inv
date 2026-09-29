import Scene from './Scene.jsx';
import Particles from './Particles.jsx';
import SplitName from './SplitName.jsx';
import { Divider, Heart } from './Ornaments.jsx';
import { weddingConfig, copy } from '../config.js';

export default function SceneCouple() {
  return (
    <Scene index={1} id="scene-2" label="The couple" grade="g2">
      <Particles kind="petals" count={10} depth="0.62" />
      <Particles kind="dust" count={14} depth="0.36" />

      <div className="layer s2-copy" data-depth="0.21">
        <p className="eyebrow" data-reveal="0">{weddingConfig.familyText}</p>
        <h2 className="names">
          <SplitName text={weddingConfig.couple1} base={0} />
          <span className="amp" data-reveal="2" aria-hidden="true"><Heart /></span>
          <span className="visually-hidden">and</span>
          <SplitName text={weddingConfig.couple2} base={1} />
        </h2>
        <div className="orn" data-reveal="4" aria-hidden="true"><Divider /></div>
        <p className="invite" data-reveal="5">
          {copy.invite[0]}<br />{copy.invite[1]}
        </p>
      </div>
    </Scene>
  );
}
