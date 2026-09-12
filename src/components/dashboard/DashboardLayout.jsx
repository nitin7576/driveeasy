import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ role, title, subtitle, children, action }) {
  const [sideOpen, setSideOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-start">
        <Sidebar
          role={role}
          isMobile={false}
          isOpen={sideOpen}
          onClose={() => setSideOpen(false)}
        />
        <Sidebar
          role={role}
          isMobile
          isOpen={sideOpen}
          onClose={() => setSideOpen(false)}
        />
        <main className="flex-grow-1 px-lg-4 py-4" style={{ minWidth: 0 }}>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-light d-lg-none" onClick={() => setSideOpen(true)} aria-label="Open sidebar">
                <i className="bi bi-list fs-5" />
              </button>
              <div>
                <h4 className="page-title mb-0">{title}</h4>
                {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
              </div>
            </div>
            <div className="d-flex gap-2">
              {action}
            </div>
          </div>
          {children}
        </main>
      </div>
      <div className="d-none d-lg-block py-4 text-center text-muted small">
        Logged in as <strong>{user?.name}</strong> · <Link to="/cars" className="text-de">Browse cars</Link>
      </div>
    </div>
  );
}