/**
 * A name split into characters so the timeline can bring it in letter by
 * letter. `base` staggers one name against the other.
 */
export default function SplitName({ text, base, className = 'nm' }) {
  return (
    <span className={className} data-chars={base} aria-label={text}>
      {[...text].map((c, i) => (
        <span className="ch" aria-hidden="true" key={i}>
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </span>
  );
}
