import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const homeByRole = { admin: '/admin/dashboard', customer: '/customer/dashboard', staff: '/staff/dashboard' };

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const notif = useNotifications();

  const [form, setForm] = useState({ email: 'customer@driveeasy.com', password: 'customer123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const res = loginUser(form.email, form.password);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      login(res.user);
      if (notif?.refresh) notif.refresh();
      const from = location.state?.from;
      if (from) navigate(from, { replace: true });
      else navigate(homeByRole[res.user.role], { replace: true });
    }, 500);
  };

  const fill = (email, password) => setForm({ email, password });

  const demoAccounts = [
    { label: 'Customer', email: 'customer@driveeasy.com', password: 'customer123', icon: 'bi-person' },
    { label: 'Admin', email: 'admin@driveeasy.com', password: 'admin123', icon: 'bi-shield-lock' },
    { label: 'Staff', email: 'staff@driveeasy.com', password: 'staff123', icon: 'bi-person-badge' },
  ];

  return (
    <div className="auth-wrap">
      <div className="card de-card auth-card">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="logo-mark mb-3"><i className="bi bi-car-front-fill" /></span>
            <h3 className="fw-bold">Welcome back</h3>
            <p className="text-muted small">Sign in to your DriveEasy account</p>
          </div>

          {error && <div className="alert alert-danger py-2 small"><i className="bi bi-exclamation-circle me-1" />{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button className="btn btn-de w-100 py-2" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center small mt-3 mb-0">
            Don't have an account? <Link to="/register" className="text-de fw-semibold">Register</Link>
          </p>
        </div>

        <div className="card-footer bg-light p-4">
          <p className="small text-muted fw-semibold mb-2">Demo accounts — one-click login</p>
          <div className="d-grid gap-2">
            {demoAccounts.map((a) => (
              <button key={a.label} className="demo-account d-flex align-items-center gap-2" onClick={() => fill(a.email, a.password)}>
                <i className={`bi ${a.icon} text-primary`} />
                <span className="fw-semibold small">{a.label}</span>
                <span className="ms-auto text-muted small">{a.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}