# Wedding Invitation — React

A cinematic South Indian wedding invitation. One continuous temple shot runs behind
the whole page, scrubbed frame by frame as you scroll; four scenes of copy float on
top of it.

Built with **React 19 + Vite**. No backend, no database, no API keys.

---

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:5173`).

| command | what it does |
| --- | --- |
| `npm run dev` | dev server with hot reload |
| `npm run build` | production build into `dist/` |
| `npm run preview` | serve `dist/` exactly as Netlify will |
| `npm run frames -- /path/to/frames` | re-encode the background film |

---

## What to edit

**Everything personal lives in `src/config.js`.** It is the only file with wedding
details in it; the rest is machinery.

```js
export const weddingConfig = {
  couple1: 'Ganesh',
  couple2: 'Vaishnavi',
  date:    'Sunday, 14 February 2027',
  time:    '6:30 AM onwards',
  venue:   'Sri Kapaleeshwarar Temple',
  city:    'Chennai, Tamil Nadu',
  rsvpUrl: '#',          // '#' leaves the button inert
  venueUrl:'#',          // put your Google Maps link here
  familyText: 'Together with their families',
};
```

The Tamil lines and all the English sentences are in the `copy` object in the same
file, so the full script of the invitation reads top to bottom in one place.

| you want to change | where |
| --- | --- |
| names, date, time, venue, links | `src/config.js` → `weddingConfig` |
| any wording, English or Tamil | `src/config.js` → `copy` |
| colours, type, spacing | `src/styles.css` (`:root` at the top) |
| how dark each scene sits over the film | the `.g1`–`.g4` grade rules in `src/styles.css` |
| the background film | re-run `npm run frames` (below) |
| background music | drop `public/music/wedding-music.mp3` |

---

## The background film

`scrollY` maps straight onto the frame number: the top of the page is frame 1 and
the very bottom is the last frame, landing exactly on it.

Frames are painted to a `<canvas>` rather than swapped as `<img>` sources, which
avoids the flash you get when a browser drops a decoded image. They load in order,
six connections at a time, and any frame that has not arrived falls back to the
nearest one that has — so the page is usable long before the sequence finishes.

To replace the film, point the encoder at a folder of stills:

```bash
npm run frames -- /path/to/your/frames
```

Three constants at the top of `tools/build-frames.py` trade quality against weight:

```python
FRAMES  = 145   # more = smoother scrub, bigger download
WIDTH   = 560   # more = sharper on large screens, bigger download
QUALITY = 60    # WebP dial; 50-75 is the useful range
```

It re-encodes into `public/frames/` and updates `count` in `src/config.js` for you.
At the current settings the film is **~7.3 MB**, which is by far the heaviest thing
on the page — worth tuning if your guests are mostly on mobile data.

---

## Deploying to Netlify

`netlify.toml` already has the build settings, so Netlify needs no manual
configuration:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

It also pins Node 22 and sets a one-year immutable cache on `/frames/*`, so repeat
visitors never re-download the film.

See the step-by-step instructions in the chat, or:

1. Push this folder to a GitHub repo.
2. Netlify → **Add new site → Import an existing project** → pick the repo.
3. The build command and publish directory are read from `netlify.toml`. Deploy.

---

## How the motion works

`scrollY / viewportHeight` gives a position `p` from 0 to 3 across the four scenes.
`p` is eased toward the real scroll each frame, so one flick of the wheel plays out
as a slow camera move rather than a jump. Every visual is a pure function of `p`:
the film frame, the parallax on each layer, the staggered copy reveals, the
letter-by-letter names, the card tilting up with a gold sheen crossing the paper.

`src/hooks/useFilmTimeline.js` runs one `requestAnimationFrame` loop and writes
styles straight onto DOM nodes. That is deliberate: driving it through React state
would re-render the tree sixty times a second for no benefit. React owns the markup;
the hook owns the pixels.

Scroll-snap is `mandatory`, so one gesture carries you a whole scene and the film
scrubs ~48 frames on the way. To scrub freely instead, change `scroll-snap-type:
y mandatory` to `y proximity` at the top of `src/styles.css`.

**If you edit the CSS:** elements carrying `data-depth`, `data-reveal` or the `.ch`
class have their `transform` written every frame. Never give those a CSS `transform`
— use the separate `rotate:` / `scale:` properties, or `margin: auto` centring, as
the existing rules do.

Navigation: scroll · swipe · the `01 — 02 — 03 — 04` rail · arrow keys · PageUp /
PageDown / Home / End · `Esc` returns to the opening. `prefers-reduced-motion` is
respected throughout.
