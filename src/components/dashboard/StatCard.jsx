export default function StatCard({ label, value, icon, tone = 'primary', prefix = '' }) {
  const toneBg = {
    primary: 'bg-primary-subtle text-primary',
    accent: 'bg-danger-subtle text-danger',
    success: 'bg-success-subtle text-success',
    danger: 'bg-danger-subtle text-danger',
    info: 'bg-info-subtle text-info',
    warning: 'bg-warning-subtle text-warning',
  };
  return (
    <div className="card de-card h-100">
      <div className="card-body d-flex align-items-center gap-3 p-3">
        <span className={`icon-wrap ${toneBg[tone] || toneBg.primary}`}><i className={`bi ${icon}`} /></span>
        <div className="min-w-0 overflow-hidden">
          <h3 className="fw-bold fs-4 text-truncate">{prefix}{value}</h3>
          <span className="text-muted small">{label}</span>
        </div>
      </div>
    </div>
  );
}