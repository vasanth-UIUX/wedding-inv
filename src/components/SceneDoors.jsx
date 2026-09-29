import Scene from './Scene.jsx';
import Particles from './Particles.jsx';
import { Divider } from './Ornaments.jsx';
import { weddingConfig, copy } from '../config.js';

export default function SceneDoors({ onGo }) {
  return (
    <Scene index={0} id="scene-1" label="A beautiful beginning" grade="g1">
      <Particles kind="dust" count={20} depth="0.30" />
      <Particles kind="petals" count={12} depth="0.55" />

      <div className="layer s1-copy" data-depth="0.17">
        <p className="tam sm" data-reveal="0">{copy.openingSmall}</p>
        <h1 className="tam title" data-reveal="1">{copy.openingTitle}</h1>
        <div className="orn" data-reveal="2" aria-hidden="true"><Divider /></div>
        <p className="s1-names" data-reveal="3">
          <span>{weddingConfig.couple1}</span>
          <em>&amp;</em>
          <span>{weddingConfig.couple2}</span>
        </p>
      </div>

      <button className="hint" type="button" data-reveal="4" onClick={() => onGo(1)}>
        <span>{copy.scrollHint}</span>
      </button>
    </Scene>
  );
}
