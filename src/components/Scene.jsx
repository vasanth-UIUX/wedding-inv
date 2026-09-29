/**
 * A scene is a transparent overlay on the film: a colour grade, then content.
 * The timeline finds these by class name and drives them every frame.
 */
export default function Scene({ index, id, label, grade, children }) {
  return (
    <section className={`scene scene-${index + 1}`} id={id} aria-label={label}>
      <div className={`layer grade ${grade}`} data-depth="0.03" aria-hidden="true" />
      {children}
    </section>
  );
}
