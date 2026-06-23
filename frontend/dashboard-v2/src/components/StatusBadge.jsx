export function StatusBadge({ tone = "muted", children }) {
  return (
    <span className={`cgn-chip cgn-chip--${tone}`}>
      {children}
    </span>
  );
}
