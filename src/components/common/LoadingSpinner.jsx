export default function LoadingSpinner({ text = 'Loading…' }) {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="text-muted mt-2 mb-0">{text}</p>
    </div>
  );
}