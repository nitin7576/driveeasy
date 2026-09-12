const map = {
  pending: 'bg-warning-subtle text-warning-emphasis',
  confirmed: 'bg-info-subtle text-info-emphasis',
  upcoming: 'bg-info-subtle text-info-emphasis',
  active: 'bg-primary-subtle text-primary-emphasis',
  completed: 'bg-success-subtle text-success-emphasis',
  cancelled: 'bg-danger-subtle text-danger-emphasis',
  rejected: 'bg-danger-subtle text-danger-emphasis',
  unavailable: 'bg-secondary-subtle text-secondary-emphasis',
  maintenance: 'bg-dark-subtle text-dark-emphasis',
  paid: 'bg-success-subtle text-success-emphasis',
  pendingpay: 'bg-warning-subtle text-warning-emphasis',
  failed: 'bg-danger-subtle text-danger-emphasis',
  refunded: 'bg-warning-subtle text-warning-emphasis',
  rented: 'bg-primary-subtle text-primary-emphasis',
  available: 'bg-success-subtle text-success-emphasis',
  sold_out: 'bg-danger-subtle text-danger-emphasis',
  in_progress: 'bg-info-subtle text-info-emphasis',
  scheduled: 'bg-warning-subtle text-warning-emphasis',
  approved: 'bg-success-subtle text-success-emphasis',
  hidden: 'bg-secondary-subtle text-secondary-emphasis',
  active_coupon: 'bg-success-subtle text-success-emphasis',
  expired: 'bg-danger-subtle text-danger-emphasis',
  verified: 'bg-success-subtle text-success-emphasis',
  unverified: 'bg-warning-subtle text-warning-emphasis',
  blocked: 'bg-danger-subtle text-danger-emphasis',
  admin: 'bg-dark text-white',
  staff: 'bg-info text-white',
  customer: 'bg-primary text-white',
};

export default function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase().replace(/[_\s]/g, '_');
  const cls = map[key] || map.pending;
  const label = String(status || '')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
  return <span className={`badge ${cls}`}>{label}</span>;
}