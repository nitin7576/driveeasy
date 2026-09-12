import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) {
    const fallback = { admin: '/admin/dashboard', customer: '/customer/dashboard', staff: '/staff/dashboard' }[user.role];
    return <Navigate to={fallback} replace />;
  }
  return children;
}