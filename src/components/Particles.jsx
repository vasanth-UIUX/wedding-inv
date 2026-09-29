import { useMemo } from 'react';
import { prefersReducedMotion, isSmallScreen } from '../lib/math.js';

const rnd = (a, b) => a + Math.random() * (b - a);

/**
 * Falling jasmine petals and drifting gold dust. Generated once and then left
 * alone — the CSS keyframes do the work, and the timeline nudges the whole
 * layer with scroll velocity so they gust when you move fast.
 */
export default function Particles({ kind, count, depth }) {
  const reduced = prefersReducedMotion();
  const small = isSmallScreen();

  const bits = useMemo(() => {
    if (reduced) return [];
    const n = Math.round(count * (small ? 0.6 : 1));
    return Array.from({ length: n }, () =>
      kind === 'petals'
        ? {
            '--x': `${rnd(-6, 102)}%`,
            '--w': `${rnd(9, 19)}px`,
            '--drift': `${rnd(-16, 16)}vw`,
            '--dur': `${rnd(14, 28)}s`,
            '--delay': `${rnd(-24, 4)}s`,
            '--o': rnd(0.35, 0.9),
            '--b': `${rnd(0, 1.6)}px`,
          }
        : {
            '--x': `${rnd(0, 100)}%`,
            '--y': `${rnd(40, 108)}%`,
            '--w': `${rnd(2, 6)}px`,
            '--drift': `${rnd(-9, 9)}vw`,
            '--dur': `${rnd(12, 24)}s`,
            '--delay': `${rnd(-22, 2)}s`,
            '--o': rnd(0.3, 0.95),
          }
    );
  }, [kind, count, reduced, small]);

  if (reduced) return null;

  return (
    <div className={`layer fx fx-${kind}`} data-depth={depth} aria-hidden="true">
      {bits.map((style, i) => (
        <i className={kind === 'petals' ? 'petal' : 'dust'} style={style} key={i} />
      ))}
    </div>
  );
}
