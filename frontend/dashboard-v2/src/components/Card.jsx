export function Card({ title, eyebrow, children, footer }) {
  return (
    <article className="glass-card">
      {eyebrow ? <span className="card-kicker">{eyebrow}</span> : null}
      {title ? <h2>{title}</h2> : null}
      <div className="card-copy">
        {children}
      </div>
      {footer ? <div className="card-footer">{footer}</div> : null}
    </article>
  );
}
