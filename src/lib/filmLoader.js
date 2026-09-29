import { filmFrames } from '../config.js';

/**
 * The frame cache lives at module scope on purpose.
 *
 * The film is a singleton for the whole app, and the timeline effect can be
 * torn down and re-created — React StrictMode does exactly that in dev, and
 * a remount would otherwise abandon every in-flight request and start the
 * 145-frame download again. Keeping the cache here means a remount reuses
 * whatever has already arrived.
 *
 * Frames load in order, a few connections at a time. Anything that has not
 * arrived falls back to the nearest frame that has, so the page is usable
 * long before the sequence finishes.
 */
export const FRAME_COUNT = filmFrames.count;

const images = new Array(FRAME_COUNT);
const status = new Uint8Array(FRAME_COUNT);   /* 0 pending · 1 ready · 2 failed */
const MAXCONN = 6;

let inflight = 0;
let cursor = 0;
let readyCount = 0;
let warned = false;
let listener = null;

/** The active timeline registers here to repaint the moment a frame lands. */
export function subscribe(fn) {
  listener = fn;
  return () => { if (listener === fn) listener = null; };
}

export const isReady = (i) => status[i] === 1;
export const imageAt = (i) => images[i];
export const readyFrames = () => readyCount;

export function nearestReady(i) {
  if (status[i] === 1) return i;
  for (let d = 1; d < FRAME_COUNT; d++) {
    const a = i - d;
    const b = i + d;
    if (a >= 0 && status[a] === 1) return a;
    if (b < FRAME_COUNT && status[b] === 1) return b;
  }
  return -1;
}

export function request(i) {
  /* Number.isInteger also rejects NaN, which would otherwise sail past the
     range checks (every NaN comparison is false) and fetch /frames/fNaN.webp */
  if (!Number.isInteger(i) || i < 0 || i >= FRAME_COUNT || images[i]) return;
  const im = new Image();
  images[i] = im;
  inflight++;
  im.decoding = 'async';
  im.onload = () => {
    status[i] = 1;
    readyCount++;
    inflight--;
    if (listener) listener(i);
    pump();
  };
  im.onerror = () => {
    status[i] = 2;
    inflight--;
    if (!warned) {
      warned = true;
      console.warn(
        `[invitation] a background frame failed to load (${filmFrames.src(i + 1)}). ` +
        'Check that public/frames/ made it into the build.'
      );
    }
    pump();
  };
  im.src = filmFrames.src(i + 1);
}

export function pump() {
  while (inflight < MAXCONN && cursor < FRAME_COUNT) {
    const i = cursor++;
    if (!images[i]) request(i);
  }
}
