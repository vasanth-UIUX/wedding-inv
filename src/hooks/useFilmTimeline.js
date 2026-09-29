import { useCallback, useLayoutEffect, useRef } from 'react';
import {
  FRAME_COUNT, subscribe, request, pump, nearestReady, imageAt, readyFrames,
} from '../lib/filmLoader.js';
import {
  clamp01, easeOutExpo, easeOutCubic, smooth,
  prefersReducedMotion, isSmallScreen,
} from '../lib/math.js';

/**
 * The whole motion system.
 *
 * Deliberately imperative: it runs one requestAnimationFrame loop and writes
 * styles straight onto DOM nodes through refs. Driving this through React
 * state would re-render the tree ~60 times a second for no benefit — React
 * owns the markup here, this hook owns the pixels.
 *
 * scrollY / viewportHeight gives a position `p` from 0 to 3 across the four
 * scenes. `p` is eased toward the real scroll each frame, so one flick of the
 * wheel plays out as a slow camera move. Everything below — including which
 * film frame is on screen — is a pure function of `p`.
 */
export function useFilmTimeline() {
  const vhRef = useRef(typeof window === 'undefined' ? 800 : window.innerHeight);
  const lastRef = useRef(3);

  const goTo = useCallback((i) => {
    const vh = vhRef.current || window.innerHeight;
    const last = lastRef.current;
    window.scrollTo({ top: Math.max(0, Math.min(last, i)) * vh, behavior: 'smooth' });
  }, []);

  useLayoutEffect(() => {
    const reduced = prefersReducedMotion();
    const small = isSmallScreen();

    const stage = document.getElementById('stage');
    const canvas = document.getElementById('film');
    if (!stage || !canvas) return undefined;

    const ctx = canvas.getContext('2d', { alpha: false });
    const bloomEl = stage.querySelector('.bloom');
    const sweepEl = stage.querySelector('.sweep');
    const veilEl = stage.querySelector('.film-veil');
    const grainEl = document.querySelector('.grain');
    const chips = [...document.querySelectorAll('.chapters [data-go]')];
    const conns = [...document.querySelectorAll('.chapters i')];

    const SCENES = [...document.querySelectorAll('.scene')].map((el, i) => ({
      el, i,
      layers: [...el.querySelectorAll('[data-depth]')].map((l) => ({
        el: l,
        d: +l.dataset.depth || 0,
        x: +(l.dataset.x || 0),
        fx: l.classList.contains('fx'),
      })),
      reveals: [...el.querySelectorAll('[data-reveal]')]
        .filter((r) => !r.classList.contains('card'))
        .map((r) => ({ el: r, o: +r.dataset.reveal || 0 })),
      charSets: [...el.querySelectorAll('[data-chars]')].map((c) => ({
        base: +c.dataset.chars || 0,
        chars: [...c.querySelectorAll('.ch')],
      })),
      card: el.querySelector('.card'),
      sheen: el.querySelector('.sheen'),
      shown: null,
    }));
    const LAST = Math.max(1, SCENES.length - 1);
    lastRef.current = LAST;

    /* the film — see lib/filmLoader.js for why the cache is module-scoped */
    let wanted = 0, drawn = -1;
    let filmReadyAt = 0;

    function paint() {
      const i = nearestReady(wanted);
      if (i < 0 || i === drawn) return;
      const img = imageAt(i);
      const cw = canvas.width, ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) * 0.5, (ch - h) * 0.5, w, h);
      drawn = i;
    }

    const unsubscribe = subscribe((i) => {
      if (drawn < 0 || i === wanted) paint();
    });

    /* ------------------------------ state ------------------------------ */
    let vh = Math.max(1, window.innerHeight), vw = Math.max(1, window.innerWidth);
    let p = 0, vel = 0, lastT = performance.now();
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    let introT = 0;
    const INTRO = 4200;
    const MAXBLUR = small ? 9 : 20;

    function sizeFilm() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(vw * dpr));
      canvas.height = Math.max(1, Math.round(vh * dpr));
      ctx.imageSmoothingQuality = 'high';
      drawn = -1;
      paint();
    }

    function measure() {
      /* a hidden pane or an un-laid-out iframe can report 0 here, and a zero
         height would make scrollY/vh a NaN that poisons the whole timeline */
      vh = Math.max(1, window.innerHeight);
      vw = Math.max(1, window.innerWidth);
      vhRef.current = vh;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      sizeFilm();
    }

    /* ------------------------------ render ----------------------------- */
    function render() {
      for (const sc of SCENES) {
        const t = p - sc.i;
        const a = Math.abs(t);

        if (a > 1.18) {
          if (sc.shown !== false) {
            sc.el.classList.remove('on', 'live');
            sc.el.style.opacity = '0';
            sc.shown = false;
          }
          continue;
        }
        if (sc.shown !== true) { sc.el.classList.add('on'); sc.shown = true; }
        sc.el.classList.toggle('live', a < 0.5);

        /* camera: push in on approach, drift back and soften on exit */
        const fade = 1 - smooth(clamp01((a - 0.04) / 0.72));
        let scale = t < 0 ? 1 + 0.17 * -t : 1 - 0.09 * t;
        let bright = 1 - a * 0.34;
        const sat = 1 - a * 0.30;
        const ty = -t * vh * 0.11;
        const roll = t * 1.1;

        if (sc.i === 0 && !reduced) {
          const lift = easeOutCubic(clamp01(introT / 0.5));
          scale *= 1 + 0.04 * (1 - easeOutCubic(introT));
          bright *= 0.30 + 0.70 * lift;
        }

        const settled = a < 0.002 && (sc.i > 0 || introT >= 1);
        sc.el.style.opacity = fade.toFixed(3);
        sc.el.style.transform = settled
          ? 'none'
          : `translate3d(0,${ty.toFixed(1)}px,0) scale(${scale.toFixed(4)}) rotate(${roll.toFixed(2)}deg)`;
        const blur = a * MAXBLUR;
        sc.el.style.filter = settled
          ? 'none'
          : blur < 0.2
            ? `brightness(${bright.toFixed(3)}) saturate(${sat.toFixed(3)})`
            : `blur(${blur.toFixed(2)}px) brightness(${bright.toFixed(3)}) saturate(${sat.toFixed(3)})`;

        /* parallax: every layer travels at its own depth */
        for (const L of sc.layers) {
          let py = -t * vh * L.d * 0.46 + my * L.d * 14;
          if (L.fx) py += vel * -1500;              /* petals gust with scroll speed */
          const px = L.x * a * vw * 0.01 + mx * L.d * 28;
          const z = 1 + a * L.d * 0.10;
          L.el.style.transform =
            `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) scale(${z.toFixed(4)})`;
        }

        /* copy: staggered rise, lit last */
        const r = sc.i === 0
          ? clamp01(1 - Math.max(0, t) / 0.55)
          : clamp01(1 - a / 0.58);

        for (const R of sc.reveals) {
          let rr;
          if (sc.i === 0) {
            const s = 0.22 + R.o * 0.13;
            rr = clamp01((introT - s) / 0.24) * r;
          } else {
            const s = R.o * 0.075;
            rr = clamp01((r - s) / (1 - s));
          }
          const e = easeOutExpo(rr);
          R.el.style.opacity = e.toFixed(3);
          R.el.style.transform = `translate3d(0,${((1 - e) * 40 - t * 58).toFixed(1)}px,0)`;
        }

        /* the names arrive letter by letter */
        for (const C of sc.charSets) {
          const n = C.chars.length;
          for (let j = 0; j < n; j++) {
            const s = 0.05 + C.base * 0.10 + (j / Math.max(1, n)) * 0.34;
            const rr = clamp01((r - s) / Math.max(0.16, 1 - s));
            const e = easeOutExpo(rr);
            const st = C.chars[j].style;
            st.opacity = e.toFixed(3);
            st.transform =
              `translate3d(0,${((1 - e) * 36).toFixed(1)}px,0) scale(${(0.88 + 0.12 * e).toFixed(3)})`;
          }
        }

        /* the invitation card tilts up out of the dark */
        if (sc.card) {
          const e = easeOutExpo(r);
          sc.card.style.opacity = e.toFixed(3);
          sc.card.style.transform =
            `translate3d(0,${((1 - e) * 72 - t * 52).toFixed(1)}px,0) ` +
            `rotateX(${((1 - e) * 15).toFixed(2)}deg) scale(${(0.93 + 0.07 * e).toFixed(4)})`;
          if (sc.sheen && !reduced) {              /* gold light sweeps the paper */
            const sh = clamp01((r - 0.42) / 0.5);
            sc.sheen.style.opacity = (Math.sin(sh * Math.PI) * 0.95).toFixed(3);
            sc.sheen.style.transform = `translateX(${(-80 + sh * 260).toFixed(1)}%) skewX(-12deg)`;
          }
        }
      }

      /* light between scenes — soft, because the film underneath never cuts */
      const f = p - Math.floor(p);
      const g = Math.sin(Math.PI * f) ** 2;
      if (bloomEl) bloomEl.style.opacity = (g * 0.34).toFixed(3);
      if (sweepEl) {
        sweepEl.style.opacity = (g * 0.40).toFixed(3);
        sweepEl.style.transform =
          `translate3d(${((f - 0.5) * 260).toFixed(1)}%,0,0) skewX(-14deg) scaleX(1.5)`;
      }
      if (grainEl) grainEl.style.opacity = (0.045 + g * 0.03).toFixed(3);

      /* hold black until the first frame is actually on screen, then lift */
      if (veilEl) {
        veilEl.style.opacity = reduced
          ? '0'
          : filmReadyAt
            ? (1 - clamp01((performance.now() - filmReadyAt) / 1500)).toFixed(3)
            : '1';
      }

      const near = Math.round(p);
      for (let i = 0; i < chips.length; i++) {
        chips[i].setAttribute('aria-current', i === near ? 'true' : 'false');
      }
      for (let i = 0; i < conns.length; i++) {
        conns[i].style.setProperty('--f', clamp01(p - i).toFixed(3));
      }
    }

    /* ------------------------------- loop ------------------------------ */
    let rafId = 0;
    function frame(now) {
      const gap = now - lastT;              /* long gap = tab was hidden/throttled */
      const dt = Math.min(3, gap / 16.667);
      lastT = now;

      /* The title sequence starts once there is actually something on screen.
         Checked here rather than only in the load callback: a frame that lands
         while the effect is being torn down must not leave the page on black. */
      if (!filmReadyAt && readyFrames() > 0) { paint(); filmReadyAt = now; }
      introT = reduced ? 1 : filmReadyAt ? clamp01((now - filmReadyAt) / INTRO) : 0;

      const raw = Math.max(0, Math.min(LAST, window.scrollY / vh));
      const before = p;
      if (reduced || gap > 400) {
        p = raw;                            /* catch up instantly, never crawl back */
      } else {
        p += (raw - p) * (1 - Math.pow(1 - 0.125, dt));
        if (Math.abs(raw - p) < 0.0004) p = raw;
      }
      vel = p - before;

      /* the whole page maps onto the whole film: bottom of page = final frame */
      const idx = Math.round(clamp01(p / LAST) * (FRAME_COUNT - 1));
      if (idx !== wanted && Number.isInteger(idx)) {
        wanted = idx;
        request(idx);                       /* jumped ahead? fetch that one now */
        paint();
      }

      const mk = 1 - Math.pow(1 - 0.07, dt);
      mx += (tmx - mx) * mk;
      my += (tmy - my) * mk;

      render();
      rafId = requestAnimationFrame(frame);
    }

    /* ----------------------------- listeners --------------------------- */
    const onKey = (e) => {
      if (e.target.closest('a,button') && (e.key === ' ' || e.key === 'Enter')) return;
      const cur = Math.round(p);
      switch (e.key) {
        case 'ArrowDown': case 'ArrowRight': case 'PageDown': case ' ':
          e.preventDefault(); goTo(cur + 1); break;
        case 'ArrowUp': case 'ArrowLeft': case 'PageUp':
          e.preventDefault(); goTo(cur - 1); break;
        case 'Home': e.preventDefault(); goTo(0); break;
        case 'End': e.preventDefault(); goTo(LAST); break;
        case 'Escape': goTo(0); break;
        default: break;
      }
    };

    const fine = matchMedia('(pointer:fine)').matches;
    const onPointer = (e) => {
      tmx = (e.clientX / vw - 0.5) * 2;
      tmy = (e.clientY / vh - 0.5) * 2;
    };

    let lastW = window.innerWidth, lastH = window.innerHeight;
    const onResize = () => {
      /* ignore the small height change from a mobile URL bar hiding */
      if (window.innerWidth !== lastW || Math.abs(window.innerHeight - lastH) > 120) {
        lastW = window.innerWidth; lastH = window.innerHeight;
        measure();
      }
    };
    const onOrient = () => setTimeout(measure, 260);

    window.addEventListener('keydown', onKey);
    if (!reduced && fine) window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onOrient);

    /* ------------------------------- start ----------------------------- */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    measure();
    if (!window.location.hash) window.scrollTo(0, 0);
    request(0);                              /* first frame first */
    pump();
    /* never sit on black forever if the frames cannot be fetched at all */
    const bail = setTimeout(() => { if (!filmReadyAt) filmReadyAt = performance.now(); }, 4000);
    render();
    rafId = requestAnimationFrame(frame);

    return () => {
      unsubscribe();
      cancelAnimationFrame(rafId);
      clearTimeout(bail);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrient);
    };
  }, [goTo]);

  return goTo;
}
