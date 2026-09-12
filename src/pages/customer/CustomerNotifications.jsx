import DashboardLayout from '../../components/dashboard/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';

const typeIcon = { info: 'bi-info-circle', promo: 'bi-gift', warning: 'bi-exclamation-triangle', staff: 'bi-bell' };

export default function CustomerNotifications() {
  const { notifications, refresh, markRead, markAll, remove } = useNotifications();
  const user = JSON.parse(localStorage.getItem('de_current_user')) || {};

  const reload = () => refresh();

  const userNotifs = notifications.filter((n) => n.userId === user.id);

  return (
    <DashboardLayout role="customer" title="Notifications" subtitle="Stay up to date with your bookings" action={
      <button className="btn btn-ghost-de" onClick={markAll}><i className="bi bi-check2-all me-1" />Mark all read</button>
    }>
      {userNotifs.length === 0 ? (
        <div className="card de-card p-4">
          <EmptyState icon="bi-bell-slash" title="No notifications" message="You'll be notified about bookings and offers." />
        </div>
      ) : (
        <div className="card de-card">
          {userNotifs.map((n) => (
            <div key={n.id} className={`d-flex gap-3 align-items-start p-3 border-bottom ${n.read ? '' : 'bg-primary-subtle'}`}>
              <span className={`feature-icon ${n.read ? '' : 'accent'}`}><i className={`bi ${typeIcon[n.type] || 'bi-bell'}`} /></span>
              <div className="flex-grow-1">
                <p className="mb-0 small">{n.message}</p>
                <span className="text-muted small">{formatDate(n.date)}</span>
              </div>
              {!n.read && (
                <button className="btn btn-sm btn-outline-primary" onClick={() => { markRead(n.id); reload(); }}>
                  <i className="bi bi-check2 me-1" />Mark read
                </button>
              )}
              <button className="btn btn-sm btn-outline-danger" onClick={() => { remove(n.id); reload(); }}>
                <i className="bi bi-trash" />
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}