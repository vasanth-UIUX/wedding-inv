import { useCallback, useRef, useState } from 'react';
import { weddingMusic } from '../config.js';

/**
 * Never autoplays, and never breaks the page when the mp3 is missing — it
 * just marks itself unavailable.
 */
export default function MusicButton() {
  const audioRef = useRef(null);
  const fadeRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  const fadeTo = useCallback((target, done) => {
    clearInterval(fadeRef.current);
    fadeRef.current = setInterval(() => {
      const a = audioRef.current;
      if (!a) return clearInterval(fadeRef.current);
      const d = target - a.volume;
      if (Math.abs(d) < 0.03) {
        a.volume = target;
        clearInterval(fadeRef.current);
        if (done) done();
        return;
      }
      a.volume = Math.max(0, Math.min(1, a.volume + Math.sign(d) * 0.03));
    }, 40);
  }, []);

  const toggle = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio(weddingMusic);
      a.loop = true;
      a.volume = 0;
      a.preload = 'auto';
      a.addEventListener('error', () => { setAvailable(false); setPlaying(false); });
      audioRef.current = a;
    }
    const a = audioRef.current;
    if (playing) {
      fadeTo(0, () => a.pause());
      setPlaying(false);
    } else {
      const pr = a.play();
      if (pr && pr.catch) pr.catch(() => { setAvailable(false); setPlaying(false); });
      fadeTo(0.55);
      setPlaying(true);
    }
  }, [playing, fadeTo]);

  return (
    <button
      id="music"
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? 'Pause background music' : 'Play background music'}
      data-unavailable={available ? undefined : 'true'}
      title={available ? 'Music' : 'Music file not found — add public/music/wedding-music.mp3'}
    >
      <span className="note" aria-hidden="true">&#9834;</span>
      <span className="bars" aria-hidden="true"><i /><i /><i /></span>
    </button>
  );
}
