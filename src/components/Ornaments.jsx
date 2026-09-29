import { useMemo } from 'react';

const round = (n) => Math.round(n * 100) / 100;

export function Divider() {
  return (
    <svg viewBox="0 0 300 40" className="dv" aria-hidden="true" focusable="false">
      <path className="o-s" d="M8,20 L108,20 M192,20 L292,20" />
      <path className="o-s" d="M108,20 C118,10 128,10 134,20 C128,30 118,30 108,20 Z" />
      <path className="o-s" d="M192,20 C182,10 172,10 166,20 C172,30 182,30 192,20 Z" />
      <path className="o-f" d="M150,6 C158,13 162,17 162,20 C162,23 158,27 150,34 C142,27 138,23 138,20 C138,17 142,13 150,6 Z" />
      <circle className="o-f" cx="26" cy="20" r="2" />
      <circle className="o-f" cx="274" cy="20" r="2" />
    </svg>
  );
}

export function Heart() {
  return (
    <svg viewBox="0 0 48 44" className="ht" aria-hidden="true" focusable="false">
      <path d="M24,42 C10,31 2,24 2,15 C2,8 7,3 13.5,3 C18,3 21.6,5.4 24,9.4 C26.4,5.4 30,3 34.5,3 C41,3 46,8 46,15 C46,24 38,31 24,42 Z" />
    </svg>
  );
}

/* small gopuram line-art for the foot of the invitation card */
export function TempleLine() {
  const { strokes, fills } = useMemo(() => {
    const W = 300, H = 150, cx = 150;
    const strokes = [];
    const fills = [];
    let y = H - 8, half = 46;

    for (let i = 0; i < 5; i++) {
      const th = 17 - i * 1.3;
      const ht = half * 0.86;
      strokes.push(`M${round(cx - half)},${round(y)} L${round(cx + half)},${round(y)} L${round(cx + ht)},${round(y - th)} L${round(cx - ht)},${round(y - th)} Z`);
      strokes.push(`M${round(cx - ht - 4)},${round(y - th)} L${round(cx + ht + 4)},${round(y - th)}`);
      y -= th + 4;
      half = ht * 0.94;
    }

    strokes.push(`M${round(cx - half - 4)},${round(y)} L${round(cx - half - 4)},${round(y - 12)} Q${round(cx - half - 4)},${round(y - 22)} ${cx},${round(y - 22)} Q${round(cx + half + 4)},${round(y - 22)} ${round(cx + half + 4)},${round(y - 12)} L${round(cx + half + 4)},${round(y)} Z`);

    [-0.7, 0, 0.7].forEach((f) => {
      fills.push(`M${round(cx + f * half - 3)},${round(y - 22)} l6,0 l-1,-5 l-4,0 Z M${cx + f * half},${round(y - 34)} l2,7 l-4,0 Z`);
    });

    strokes.push(`M${cx - 12},${H - 8} L${cx - 12},${H - 30} Q${cx - 12},${H - 40} ${cx},${H - 40} Q${cx + 12},${H - 40} ${cx + 12},${H - 30} L${cx + 12},${H - 8}`);

    const palm = (px, dir) => {
      strokes.push(`M${px},${H - 8} C${px + dir * 3},${H - 40} ${px + dir * 2},${H - 60} ${px + dir * 6},${H - 82}`);
      for (let i = 0; i < 6; i++) {
        const a = -1.9 + i * 0.62;
        strokes.push(`M${px + dir * 6},${H - 82} q${round(Math.cos(a) * 14)},${round(Math.sin(a) * 14)} ${round(Math.cos(a) * 26)},${round(Math.sin(a) * 26 + 6)}`);
      }
    };
    palm(44, -1);
    palm(256, 1);
    strokes.push(`M6,${H - 8} L294,${H - 8}`);

    return { strokes, fills };
  }, []);

  return (
    <svg viewBox="0 0 300 150" className="tl" aria-hidden="true" focusable="false">
      {strokes.map((d, i) => <path className="t" d={d} key={`s${i}`} />)}
      {fills.map((d, i) => <path className="tf" d={d} key={`f${i}`} />)}
    </svg>
  );
}
