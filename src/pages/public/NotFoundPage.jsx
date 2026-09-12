import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="auth-wrap">
      <div className="text-center px-4">
        <div style={{ fontSize: '7rem', fontWeight: 800, color: 'var(--de-primary)', lineHeight: 1 }}>
          404
        </div>
        <h3 className="fw-bold mt-2">Page not found</h3>
        <p className="text-muted">The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-de px-4 mt-2"><i className="bi bi-house me-2" />Back to Home</Link>
      </div>
    </div>
  );
}