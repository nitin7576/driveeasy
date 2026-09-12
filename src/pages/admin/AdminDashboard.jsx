import { Link } from 'react-router-dom';
import 'chart.js/auto';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { getCars } from '../../services/carService';
import { getBookings } from '../../services/bookingService';
import { getPayments } from '../../services/paymentService';
import { getCustomers } from '../../services/customerService';
import { formatMoney, formatDate, monthKey, todayISO } from '../../utils/helpers';

const COLORS = ['#1f4ed8', '#ff7a1a', '#16a34a', '#dc2626', '#d97706', '#0ea5e9', '#8b5cf6'];
const CATEGORY_ORDER = ['Hatchback', 'Sedan', 'SUV', 'Compact SUV', 'MUV'];

export default function AdminDashboard() {
  const cars = getCars();
  const bookings = getBookings();
  const customers = getCustomers();
  const payments = getPayments();

  const totalCars = cars.length;
  const availableCars = cars.filter((c) => c.status === 'available').length;
  const maintenanceCars = cars.filter((c) => c.status === 'maintenance').length;

  const activeCarIds = new Set(
    bookings.filter((b) => b.status === 'active').map((b) => b.carId)
  );
  const rentedCars = cars.filter((c) => activeCarIds.has(c.id)).length;

  const totalRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  const today = todayISO();
  const todayBookings = bookings.filter((b) => b.pickupDate === today).length;

  function lastNMonths(n) {
    const out = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('en-IN', { month: 'short' }),
      });
    }
    return out;
  }

  const months = lastNMonths(6);
  const revenueByMonth = months.map((m) =>
    payments
      .filter((p) => p.status === 'paid' && monthKey(p.date) === m.key)
      .reduce((s, p) => s + Number(p.amount || 0), 0)
  );
  const bookingsByMonth = months.map((m) =>
    bookings.filter((b) => monthKey(b.pickupDate) === m.key).length
  );

  const categoryCounts = CATEGORY_ORDER.map(
    (t) => cars.filter((c) => c.type === t).length
  );
  const bookingStatusLabels = [...new Set(bookings.map((b) => b.status))];
  const bookingStatusCounts = bookingStatusLabels.map(
    (s) => bookings.filter((b) => b.status === s).length
  );

  const revenueChart = {
    labels: months.map((m) => m.label),
    datasets: [
      {
        label: 'Revenue',
        data: revenueByMonth,
        borderColor: '#1f4ed8',
        backgroundColor: 'rgba(31, 78, 216, 0.15)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const bookingsChart = {
    labels: months.map((m) => m.label),
    datasets: [
      {
        label: 'Bookings',
        data: bookingsByMonth,
        backgroundColor: '#ff7a1a',
        borderRadius: 6,
      },
    ],
  };

  const categoryChart = {
    labels: CATEGORY_ORDER,
    datasets: [
      {
        data: categoryCounts,
        backgroundColor: COLORS.slice(0, CATEGORY_ORDER.length),
        borderWidth: 0,
      },
    ],
  };

  const statusChart = {
    labels: bookingStatusLabels,
    datasets: [
      {
        data: bookingStatusCounts,
        backgroundColor: COLORS,
        borderWidth: 0,
      },
    ],
  };

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || b.pickupDate) - new Date(a.createdAt || a.pickupDate))
    .slice(0, 5);

  return (
    <DashboardLayout
      role="admin"
      title="Dashboard"
      subtitle="Overview of your DriveEasy fleet and operations"
      action={
        <Link to="/admin/cars" className="btn btn-de">
          <i className="bi bi-plus-lg me-2" />Add Car
        </Link>
      }
    >
      <div className="row g-4 mb-4">
        <div className="col-6 col-xl-3"><StatCard label="Total Cars" value={totalCars} icon="bi-car-front" tone="primary" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Available Cars" value={availableCars} icon="bi-check-circle" tone="success" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Rented Cars" value={rentedCars} icon="bi-key-fill" tone="accent" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Maintenance Cars" value={maintenanceCars} icon="bi-wrench-adjustable" tone="warning" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Total Customers" value={customers.length} icon="bi-people-fill" tone="info" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Total Bookings" value={bookings.length} icon="bi-calendar-check" tone="primary" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Today's Bookings" value={todayBookings} icon="bi-calendar-event" tone="accent" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Total Revenue" value={formatMoney(totalRevenue)} icon="bi-currency-rupee" tone="success" /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent">
              <h6 className="fw-bold mb-0">Monthly Revenue</h6>
            </div>
            <div className="card-body">
              <Line data={revenueChart} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} height={280} />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent">
              <h6 className="fw-bold mb-0">Monthly Bookings</h6>
            </div>
            <div className="card-body">
              <Bar data={bookingsChart} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} height={280} />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent">
              <h6 className="fw-bold mb-0">Car Category Distribution</h6>
            </div>
            <div className="card-body d-flex justify-content-center">
              <div style={{ width: '100%', maxWidth: 320 }}>
                <Doughnut data={categoryChart} options={{ maintainAspectRatio: true }} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent">
              <h6 className="fw-bold mb-0">Booking Status</h6>
            </div>
            <div className="card-body d-flex justify-content-center">
              <div style={{ width: '100%', maxWidth: 320 }}>
                <Pie data={statusChart} options={{ maintainAspectRatio: true }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card de-card">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0">Recent Bookings</h6>
          <Link to="/admin/bookings" className="small text-de text-decoration-none">View all</Link>
        </div>
        <div className="table-responsive">
          <table className="table table-de mb-0 align-middle">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Pickup</th>
                <th>Return</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 && (
                <tr><td colSpan={6}><EmptyState title="No bookings yet" message="Bookings will show up here once customers start renting." /></td></tr>
              )}
              {recentBookings.map((b) => (
                <tr key={b.id}>
                  <td><span className="fw-semibold small">{b.id}</span></td>
                  <td>{formatDate(b.pickupDate)}</td>
                  <td>{formatDate(b.returnDate)}</td>
                  <td>{formatMoney(b.pricing?.finalAmount || b.pricing?.total)}</td>
                  <td><StatusBadge status={b.paymentStatus} /></td>
                  <td><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}