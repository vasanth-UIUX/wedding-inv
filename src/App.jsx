import { useEffect } from 'react';
import { useFilmTimeline } from './hooks/useFilmTimeline.js';
import SceneDoors from './components/SceneDoors.jsx';
import SceneCouple from './components/SceneCouple.jsx';
import SceneCard from './components/SceneCard.jsx';
import SceneBlessing from './components/SceneBlessing.jsx';
import Chapters from './components/Chapters.jsx';
import MusicButton from './components/MusicButton.jsx';
import { weddingConfig } from './config.js';

export default function App() {
  const goTo = useFilmTimeline();

  useEffect(() => {
    document.title = `${weddingConfig.couple1} & ${weddingConfig.couple2} — Wedding Invitation`;
  }, []);

  return (
    <>
      <a className="skip" href="#panel-3">Skip to wedding details</a>

      {/* Everything you see lives in this fixed stage. */}
      <div className="stage" id="stage">
        <canvas id="film" className="film" aria-hidden="true" />
        <div className="film-veil" aria-hidden="true" />

        <SceneDoors onGo={goTo} />
        <SceneCouple />
        <SceneCard />
        <SceneBlessing />

        <div className="bloom" aria-hidden="true" />
        <div className="sweep" aria-hidden="true" />
      </div>

      {/* The page's actual height — four viewports of scroll to play the film. */}
      <div className="track" aria-hidden="true">
        <div className="panel" id="panel-1" />
        <div className="panel" id="panel-2" />
        <div className="panel" id="panel-3" />
        <div className="panel" id="panel-4" />
      </div>

      <Chapters onGo={goTo} />
      <MusicButton />

      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
