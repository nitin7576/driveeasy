import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { initials } from '../../utils/helpers';

const navStyle = ({ isActive }) =>
  `nav-link px-3 ${isActive ? 'active' : ''}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const homeRoute = user
    ? `/${user.role}/dashboard`
    : '/';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashLink =
    user && { admin: '/admin/dashboard', customer: '/customer/dashboard', staff: '/staff/dashboard' }[user.role];

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top shadow-sm" style={{ zIndex: 1030 }}>
      <div className="container">
        <Link className="navbar-brand" to={homeRoute}>
          <span className="logo-text">
            <span className="logo-mark"><i className="bi bi-car-front-fill" /></span>
            DriveEasy
            <span className="badge">RENTALS</span>
          </span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1 mt-3 mt-lg-0">
            <li className="nav-item"><NavLink to="/" end className={navStyle}>Home</NavLink></li>
            <li className="nav-item"><NavLink to="/cars" className={navStyle}>Cars</NavLink></li>
            <li className="nav-item"><NavLink to="/about" className={navStyle}>About</NavLink></li>
            <li className="nav-item"><NavLink to="/contact" className={navStyle}>Contact</NavLink></li>
            {dashLink && (
              <li className="nav-item"><NavLink to={dashLink} className={navStyle}><i className="bi bi-speedometer2" /> Dashboard</NavLink></li>
            )}
            {!user ? (
              <>
                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-outline-de btn-sm px-4 d-block d-lg-inline-block" to="/login">Login</Link>
                </li>
                <li className="nav-item ms-lg-1">
                  <Link className="btn btn-de btn-sm px-4 d-block d-lg-inline-block" to="/register">Register</Link>
                </li>
              </>
            ) : (
              <>
                {user.role === 'customer' && (
                  <li className="nav-item ms-lg-1"><NotificationDropdown /></li>
                )}
                <li className="nav-item dropdown ms-lg-1">
                  <button className="btn btn-light dropdown-toggle d-flex align-items-center gap-2 py-1 px-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <span className="avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>{initials(user.name)}</span>
                    <span className="d-none d-md-inline">{user.name}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><span className="dropdown-item-text small text-muted text-capitalize">{user.role}</span></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link className="dropdown-item" to={dashLink}><i className="bi bi-speedometer2 me-2" />Dashboard</Link></li>
                    {user.role === 'customer' && (
                      <>
                        <li><Link className="dropdown-item" to="/customer/profile"><i className="bi bi-person me-2" />Profile</Link></li>
                        <li><Link className="dropdown-item" to="/customer/bookings"><i className="bi bi-calendar-check me-2" />My Bookings</Link></li>
                      </>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2" />Logout</button></li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}