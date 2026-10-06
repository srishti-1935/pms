export default function Spinner({ full = false, label = 'Loading' }) {
  return (
    <div className={full ? 'spinner-wrap full' : 'spinner-wrap'} role="status" aria-live="polite">
      <div className="spinner" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
