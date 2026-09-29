import { Fragment } from 'react';

const LABELS = [
  'Scene 1, temple doors',
  'Scene 2, the couple',
  'Scene 3, wedding details',
  'Scene 4, blessings and RSVP',
];

export default function Chapters({ onGo }) {
  return (
    <nav className="chapters" aria-label="Scenes">
      {LABELS.map((label, i) => (
        <Fragment key={label}>
          {i > 0 && <i aria-hidden="true"><b /></i>}
          <button
            type="button"
            data-go={i}
            aria-label={label}
            aria-current={i === 0 ? 'true' : 'false'}
            onClick={() => onGo(i)}
          >
            <span>{String(i + 1).padStart(2, '0')}</span>
          </button>
        </Fragment>
      ))}
    </nav>
  );
}
