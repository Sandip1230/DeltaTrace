export default function MenuToggle({ open, onClick, className = "" }) {
  return (
    <button type="button" onClick={onClick} aria-label="Toggle menu" aria-expanded={open} className={`menu-toggle ${open ? "open" : ""} ${className}`}>
      <span />
      <span />
      <span />
    </button>
  );
}