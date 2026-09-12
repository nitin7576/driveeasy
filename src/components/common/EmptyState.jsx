export default function EmptyState({ icon = 'bi-inbox', title = 'Nothing here yet', message, action }) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon} d-block mb-3`} />
      <h5 className="mb-2">{title}</h5>
      {message && <p className="text-muted mb-3">{message}</p>}
      {action}
    </div>
  );
}