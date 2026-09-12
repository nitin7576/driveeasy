import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { getBookings } from '../../services/bookingService';
import { getCarById } from '../../services/carService';
import { getUserById } from '../../services/authService';
import { getMaintenance } from '../../services/maintenanceService';
import { formatDate, formatMoney, todayISO } from '../../utils/helpers';

export default function StaffDashboard() {
  const bookings = getBookings();
  const today = todayISO();

  const todayPickups = bookings
    .filter((b) => b.pickupDate === today && !['cancelled', 'rejected'].includes(b.status))
    .sort((a, b) => (a.pickupTime || '99:99').localeCompare(b.pickupTime || '99:99'));

  const todayReturns = bookings
    .filter((b) => b.returnDate === today && !['cancelled', 'rejected'].includes(b.status))
    .sort((a, b) => (a.returnTime || '99:99').localeCompare(b.returnTime || '99:99'));

  const pendingVerification = bookings.filter(
    (b) => b.status === 'confirmed' && b.pickupDate >= today
  );

  const activeBookings = bookings.filter((b) => b.status === 'active');

  const recentMaintenance = [...getMaintenance()]
    .sort(
      (a, b) =>
        new Date(b.startDate || b.endDate || 0).getTime() -
        new Date(a.startDate || a.endDate || 0).getTime()
    )
    .slice(0, 3);

  const customerName = (id) => getUserById(id)?.name || '—';
  const carName = (id) => getCarById(id)?.name || '—';

  return (
    <DashboardLayout
      role="staff"
      title="Staff Dashboard"
      subtitle="Pickups, returns, and fleet health at a glance"
      action={
        <Link to="/staff/pickups" className="btn btn-de">
          <i className="bi bi-arrow-up-circle me-2" />Manage Pickups
        </Link>
      }
    >
      <div className="row g-4 mb-4">
        <div className="col-6 col-xl-3"><StatCard label="Today's Pickups" value={todayPickups.length} icon="bi-truck" tone="primary" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Today's Returns" value={todayReturns.length} icon="bi-arrow-down-circle" tone="info" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Pending Verification" value={pendingVerification.length} icon="bi-shield-check" tone="warning" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Active Bookings" value={activeBookings.length} icon="bi-car-front" tone="success" /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Today's Pickups</h6>
              <Link to="/staff/pickups" className="small text-de text-decoration-none">View all</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-de mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Pickup date / time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayPickups.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState icon="bi-calendar-x" title="No pickups today" message="Confirmed pickups scheduled for today will show up here." />
                      </td>
                    </tr>
                  )}
                  {todayPickups.map((b) => (
                    <tr key={b.id}>
                      <td><span className="fw-semibold small">{b.id}</span></td>
                      <td>{customerName(b.userId)}</td>
                      <td>{carName(b.carId)}</td>
                      <td>
                        {formatDate(b.pickupDate)}
                        <div className="text-muted small">{b.pickupTime || '—'}</div>
                      </td>
                      <td><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Today's Returns</h6>
              <Link to="/staff/returns" className="small text-de text-decoration-none">View all</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-de mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Return date</th>
                  </tr>
                </thead>
                <tbody>
                  {todayReturns.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <EmptyState icon="bi-arrow-down-circle" title="No returns today" message="Rentals due back today will show up here." />
                      </td>
                    </tr>
                  )}
                  {todayReturns.map((b) => (
                    <tr key={b.id}>
                      <td><span className="fw-semibold small">{b.id}</span></td>
                      <td>{customerName(b.userId)}</td>
                      <td>{carName(b.carId)}</td>
                      <td>
                        {formatDate(b.returnDate)}
                        <div className="text-muted small">{b.returnTime || '—'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Active Rentals</h6>
              <span className="badge bg-primary-subtle text-primary">{activeBookings.length} active</span>
            </div>
            <div className="table-responsive">
              <table className="table table-de mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Return date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBookings.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState icon="bi-car-front" title="No active rentals" message="Currently rented vehicles will show up here." />
                      </td>
                    </tr>
                  )}
                  {activeBookings.map((b) => (
                    <tr key={b.id}>
                      <td><span className="fw-semibold small">{b.id}</span></td>
                      <td>{customerName(b.userId)}</td>
                      <td>{carName(b.carId)}</td>
                      <td>{formatDate(b.returnDate)}</td>
                      <td><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card de-card mb-4">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Recent Maintenance</h6>
              <Link to="/staff/maintenance" className="small text-de text-decoration-none">View all</Link>
            </div>
            {recentMaintenance.length === 0 ? (
              <div className="p-4">
                <EmptyState icon="bi-tools" title="No maintenance records" message="Maintenance activity will show up here." />
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {recentMaintenance.map((m) => (
                  <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center px-3">
                    <div className="min-w-0">
                      <div className="fw-semibold small text-truncate">{getCarById(m.carId)?.name || 'Deleted car'}</div>
                      <div className="text-muted small">{m.type} · {formatDate(m.startDate)}</div>
                    </div>
                    <div className="text-end ms-2">
                      <div className="small fw-semibold">{formatMoney(m.cost)}</div>
                      <StatusBadge status={m.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card de-card h-100">
            <div className="card-header bg-transparent"><h6 className="fw-bold mb-0">Quick Actions</h6></div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/staff/pickups" className="btn btn-de"><i className="bi bi-arrow-up-circle me-2" />Process Pickups</Link>
                <Link to="/staff/returns" className="btn btn-outline-de"><i className="bi bi-arrow-down-circle me-2" />Process Returns</Link>
                <Link to="/staff/inspection" className="btn btn-outline-de"><i className="bi bi-clipboard-check me-2" />Record Inspections</Link>
                <Link to="/staff/maintenance" className="btn btn-outline-de"><i className="bi bi-tools me-2" />Fleet Maintenance</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}