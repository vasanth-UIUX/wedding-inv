import Scene from './Scene.jsx';
import Particles from './Particles.jsx';
import { Divider, TempleLine } from './Ornaments.jsx';
import { weddingConfig, copy } from '../config.js';

export default function SceneCard() {
  return (
    <Scene index={2} id="scene-3" label="Wedding details" grade="g3">
      <Particles kind="petals" count={8} depth="0.58" />

      <div className="layer card-hold" data-depth="0.26">
        <article className="card" data-reveal="0">
          <div className="card-frame" aria-hidden="true" />
          <i className="sheen" aria-hidden="true" />

          <p className="tam kicker" data-reveal="1">{copy.cardKicker}</p>
          <h2 className="card-title" data-reveal="2">{copy.cardTitle}</h2>
          <div className="orn" data-reveal="3" aria-hidden="true"><Divider /></div>

          <p className="card-names" data-reveal="4">
            <span>{weddingConfig.couple1}</span>
            <em aria-hidden="true">&amp;</em>
            <span>{weddingConfig.couple2}</span>
          </p>

          <dl className="details" data-reveal="5">
            <div className="d"><dt>Date</dt><dd>{weddingConfig.date}</dd></div>
            <div className="d"><dt>Time</dt><dd>{weddingConfig.time}</dd></div>
            <div className="d wide">
              <dt>Venue</dt>
              <dd>
                {weddingConfig.venue}
                <br />
                <span className="city">{weddingConfig.city}</span>
              </dd>
            </div>
          </dl>

          <p className="blessing" data-reveal="6">{copy.cardBlessing}</p>
          <div className="card-temple" data-reveal="7" aria-hidden="true"><TempleLine /></div>
        </article>
      </div>
    </Scene>
  );
}
