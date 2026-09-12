import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { getBookingsByUser } from '../../services/bookingService';
import { getCarById } from '../../services/carService';
import { getCustomerStats } from '../../services/customerService';
import { formatMoney, formatDate } from '../../utils/helpers';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const bookings = getBookingsByUser(user.id);
  const stats = getCustomerStats(user.id);
  const recent = bookings.slice(0, 5);
  const upcoming = bookings
    .filter((b) => b.status === 'confirmed' && b.pickupDate >= new Date().toISOString().split('T')[0])
    .sort((a, b) => new Date(a.pickupDate) - new Date(b.pickupDate))[0];

  const statDefs = [
    ['Total Bookings', stats.totalBookings, 'bi-calendar-check', 'primary'],
    ['Active Rentals', stats.activeBookings, 'bi-car-front', 'accent'],
    ['Completed Rentals', stats.completedBookings, 'bi-check2-circle', 'success'],
    ['Cancelled', stats.cancelledBookings, 'bi-x-circle', 'danger'],
    ['Total Spent', formatMoney(stats.totalSpent), 'bi-currency-rupee', 'info'],
  ];

  return (
    <DashboardLayout role="customer" title={`Hi, ${user.name.split(' ')[0]} 👋`} subtitle="Welcome back to DriveEasy" action={
      <Link to="/cars" className="btn btn-de"><i className="bi bi-car-front me-2" />Book a Car</Link>
    }>
      <div className="row g-4 mb-4">
        {statDefs.map(([label, value, icon, tone]) => (
          <div className="col-6 col-xl" key={label}>
            <StatCard label={label} value={value} icon={icon} tone={tone} />
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card de-card">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Recent Bookings</h6>
              <Link to="/customer/bookings" className="small text-de text-decoration-none">View all</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-de mb-0">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Car</th>
                    <th>Pickup</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 && (
                    <tr><td colSpan={5}><EmptyState title="No bookings yet" message="Book your first car now!" /></td></tr>
                  )}
                  {recent.map((b) => {
                    const car = getCarById(b.carId);
                    return (
                      <tr key={b.id}>
                        <td><Link to={`/invoice/${b.id}`} className="text-de text-decoration-none fw-semibold">{b.id}</Link></td>
                        <td>{car?.name || '—'}</td>
                        <td>{formatDate(b.pickupDate)}</td>
                        <td>{formatMoney(b.pricing?.finalAmount)}</td>
                        <td><StatusBadge status={b.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent"><h6 className="fw-bold mb-0">Upcoming Rental</h6></div>
            <div className="card-body">
              {upcoming ? (
                (() => {
                  const car = getCarById(upcoming.carId);
                  return (
                    <div>
                      {car?.images?.[0] && <img src={car.images[0]} alt={car.name} className="w-100 rounded-3 mb-3" style={{ height: 150, objectFit: 'cover' }} />}
                      <h5 className="fw-bold mb-1">{car?.name || 'Car'}</h5>
                      <p className="text-muted small mb-2">{formatDate(upcoming.pickupDate)} · {upcoming.pickupTime} @ {upcoming.pickupLocation}</p>
                      <div className="d-flex justify-content-between small mb-1"><span className="text-muted">Days</span><span>{upcoming.pricing?.rentalDays}</span></div>
                      <div className="d-flex justify-content-between small mb-3"><span className="text-muted">Total</span><strong>{formatMoney(upcoming.pricing?.finalAmount)}</strong></div>
                      <div className="d-grid gap-2">
                        <Link className="btn btn-outline-de btn-sm" to={`/invoice/${upcoming.id}`}><i className="bi bi-receipt me-1" />View Invoice</Link>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <EmptyState icon="bi-calendar-plus" title="No upcoming trips" message="Plan your next journey with DriveEasy." action={
                  <Link to="/cars" className="btn btn-de btn-sm mt-2">Browse Cars</Link>
                } />
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}