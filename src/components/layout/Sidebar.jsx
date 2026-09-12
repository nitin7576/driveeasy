import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const sidebarLinks = {
  admin: [
    { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/admin/cars', icon: 'bi-car-front', label: 'Cars' },
    { to: '/admin/customers', icon: 'bi-people', label: 'Customers' },
    { to: '/admin/bookings', icon: 'bi-calendar-check', label: 'Bookings' },
    { to: '/admin/payments', icon: 'bi-credit-card', label: 'Payments' },
    { to: '/admin/maintenance', icon: 'bi-tools', label: 'Maintenance' },
    { to: '/admin/reviews', icon: 'bi-star', label: 'Reviews' },
    { to: '/admin/coupons', icon: 'bi-ticket-perforated', label: 'Coupons' },
    { to: '/admin/reports', icon: 'bi-bar-chart-line', label: 'Reports' },
    { to: '/admin/settings', icon: 'bi-gear', label: 'Settings' },
  ],
  customer: [
    { to: '/customer/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/customer/profile', icon: 'bi-person', label: 'My Profile' },
    { to: '/customer/bookings', icon: 'bi-calendar-check', label: 'My Bookings' },
    { to: '/customer/payments', icon: 'bi-credit-card', label: 'Payments' },
    { to: '/customer/invoices', icon: 'bi-receipt', label: 'Invoices' },
    { to: '/customer/wishlist', icon: 'bi-heart', label: 'Wishlist' },
    { to: '/customer/reviews', icon: 'bi-star', label: 'Reviews' },
    { to: '/customer/notifications', icon: 'bi-bell', label: 'Notifications' },
  ],
  staff: [
    { to: '/staff/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/staff/pickups', icon: 'bi-arrow-up-circle', label: 'Pickups' },
    { to: '/staff/returns', icon: 'bi-arrow-down-circle', label: 'Returns' },
    { to: '/staff/inspection', icon: 'bi-clipboard-check', label: 'Inspection' },
    { to: '/staff/maintenance', icon: 'bi-tools', label: 'Maintenance' },
  ],
};

const linkClass = 'side-link';

export default function Sidebar({ role: roleProp, onLinkClick, isMobile, isOpen, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = roleProp || user?.role;
  const links = sidebarLinks[role] || [];

  const handleClick = (e) => {
    if (onLinkClick) onLinkClick();
    if (isMobile && onClose) onClose();
  };

  const content = (
    <div className="d-flex flex-column h-100">
      <div className="px-3 py-3">
        <h6 className="text-uppercase fw-bold mb-0 opacity-50" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
          {role} Panel
        </h6>
      </div>
      <nav className="flex-grow-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `${linkClass} ${isActive ? 'active' : ''}`}
            onClick={handleClick}
            end={l.to.endsWith('/dashboard')}
          >
            <i className={`bi ${l.icon}`} />
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-3">
        <button
          className="side-link w-100 text-start text-danger"
          style={{ borderRadius: 10 }}
          onClick={() => { handleClick(); navigate('/login'); }}
        >
          <i className="bi bi-box-arrow-right" />
          Logout
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
        <div
          className="position-fixed top-0 start-0 h-100 d-flex flex-column"
          style={{
            width: 280,
            background: '#0b1832',
            color: '#c9d4f0',
            zIndex: 1050,
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.28s ease',
            borderRadius: '0 16px 16px 0',
          }}
        >
          {content}
        </div>
      </>
    );
  }

  return (
    <div className="de-sidebar d-none d-lg-block">
      {content}
    </div>
  );
}