import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/helpers';

const typeIcon = { info: 'bi-info-circle', promo: 'bi-gift', warning: 'bi-exclamation-triangle', staff: 'bi-bell' };

export default function NotificationDropdown() {
  const { user } = useAuth();
  const { notifications, unread, refresh, markRead, markAll, remove } = useNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  const toggle = () => setOpen((v) => !v);

  return (
    <div className="position-relative">
      <button className="btn btn-light position-relative py-1 px-3" onClick={toggle} aria-label="Notifications">
        <i className="bi bi-bell fs-5" />
        {unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1040 }} onClick={toggle} />
          <div className="dropdown-menu show shadow notif-dropdown position-absolute end-0" style={{ zIndex: 1050, top: '110%', borderRadius: 14 }}>
            <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
              <strong>Notifications</strong>
              <button className="btn btn-sm btn-link text-primary p-0" onClick={markAll}>Mark all read</button>
            </div>
            {notifications.length === 0 && (
              <div className="text-center text-muted small py-4">No notifications</div>
            )}
            {notifications.slice(0, 12).map((n) => (
              <div key={n.id} className={`notif-item d-flex gap-2 align-items-start border-bottom ${n.read ? '' : 'unread'}`}>
                <i className={`bi ${typeIcon[n.type] || 'bi-bell'} mt-1 text-primary`} />
                <div className="flex-grow-1">
                  <p className="small mb-0">{n.message}</p>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>{formatDate(n.date)}</span>
                </div>
                <div className="d-flex flex-column gap-1">
                  {!n.read && (
                    <button className="btn btn-xs text-primary p-0" style={{ fontSize: '0.75rem' }} onClick={() => markRead(n.id)}>
                      <i className="bi bi-check2-square" />
                    </button>
                  )}
                  <button className="btn p-0 text-danger" style={{ fontSize: '0.75rem' }} onClick={() => remove(n.id)}>
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}