import { useState } from 'react';
import 'chart.js/auto';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import EmptyState from '../../components/common/EmptyState';
import { getBookings } from '../../services/bookingService';
import { getPayments } from '../../services/paymentService';
import { getCars, getCarById } from '../../services/carService';
import { formatMoney, monthKey, todayISO } from '../../utils/helpers';

const COLORS = ['#1f4ed8', '#ff7a1a', '#16a34a', '#dc2626', '#d97706', '#0ea5e9', '#8b5cf6'];
const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
  { key: 'all', label: 'All Time' },
];

function startOfWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default function AdminReports() {
  const [range, setRange] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const bookings = getBookings();
  const payments = getPayments();
  const cars = getCars();

  function inCustom(date) {
    if (!from && !to) return true;
    const d = new Date(date).getTime();
    if (from && d < new Date(from).getTime()) return false;
    if (to && d > new Date(to).getTime()) return false;
    return true;
  }

  function inRange(date, rng) {
    const today = todayISO();
    switch (rng) {
      case 'today': return date.slice(0, 10) === today;
      case 'week': return date.slice(0, 10) >= startOfWeek() && date.slice(0, 10) <= today;
      case 'month': return date.slice(0, 10).startsWith(today.slice(0, 7));
      case 'year': return date.slice(0, 10).startsWith(today.slice(0, 4));
      default: return true;
    }
  }

  const useCustom = Boolean(from || to);
  const applyFilter = (date) => (useCustom ? inCustom(date) : inRange(date, range));

  const filteredBookings = bookings.filter((b) => {
    const key = b.createdAt || b.pickupDate;
    return key && applyFilter(key);
  });

  const filteredPayments = payments.filter((p) => {
    const key = p.date;
    return key && applyFilter(key);
  });

  const revenueSource = filteredPayments.length > 0 ? filteredPayments : filteredBookings
    .filter((b) => b.paymentStatus === 'paid')
    .map((b) => ({ amount: b.pricing?.finalAmount || b.pricing?.total || 0, date: b.createdAt || b.pickupDate }));

  const totalRevenue = revenueSource.reduce((s, p) => s + Number(p.amount || 0), 0);
  const activeBookings = filteredBookings.filter((b) => b.status === 'active').length;
  const completed = filteredBookings.filter((b) => b.status === 'completed').length;
  const cancelled = filteredBookings.filter((b) => b.status === 'cancelled').length;
  const avgValue = filteredBookings.length
    ? Math.round(totalRevenue / filteredBookings.length)
    : 0;

  const bookingCountsByCar = {};
  filteredBookings.forEach((b) => {
    bookingCountsByCar[b.carId] = (bookingCountsByCar[b.carId] || 0) + 1;
  });
  let mostRented = null;
  let mostRentedCount = 0;
  Object.entries(bookingCountsByCar).forEach(([carId, count]) => {
    if (count > mostRentedCount) {
      mostRentedCount = count;
      mostRented = getCarById(carId);
    }
  });

  const categoryCounts = {};
  filteredBookings.forEach((b) => {
    const car = getCarById(b.carId);
    if (car) categoryCounts[car.type] = (categoryCounts[car.type] || 0) + 1;
  });
  const mostPopularCategory = Object.entries(categoryCounts).sort((a, b2) => b2[1] - a[1])[0]?.[0] || '—';

  const statusLabels = [...new Set(bookings.map((b) => b.status))];
  const statusCounts = statusLabels.map((s) => filteredBookings.filter((b) => b.status === s).length);

  function last12Months() {
    const out = [];
    const now = new Date();
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('en-IN', { month: 'short' }),
      });
    }
    return out;
  }

  const months = last12Months();
  const monthRevenue = months.map((m) =>
    revenueSource
      .filter((p) => monthKey(p.date) === m.key)
      .reduce((s, p) => s + Number(p.amount || 0), 0)
  );

  const statusChart = {
    labels: statusLabels,
    datasets: [{ label: 'Bookings', data: statusCounts, backgroundColor: COLORS, borderRadius: 6 }],
  };

  const revenueChart = {
    labels: months.map((m) => m.label),
    datasets: [
      {
        label: 'Revenue',
        data: monthRevenue,
        borderColor: '#1f4ed8',
        backgroundColor: 'rgba(31, 78, 216, 0.15)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const categoryChart = {
    labels: Object.keys(categoryCounts),
    datasets: [{ data: Object.values(categoryCounts), backgroundColor: COLORS, borderWidth: 0 }],
  };

  return (
    <DashboardLayout
      role="admin"
      title="Reports"
      subtitle="Analyze bookings, revenue, and fleet performance"
    >
      <div className="card de-card mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            {RANGES.map((r) => (
              <button
                key={r.key}
                className={`btn btn-sm ${range === r.key && !useCustom ? 'btn-de' : 'btn-outline-de'}`}
                onClick={() => { setRange(r.key); setFrom(''); setTo(''); }}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="row g-3 align-items-end">
            <div className="col-auto">
              <label className="form-label small text-muted mb-1">From</label>
              <input className="form-control form-control-sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="col-auto">
              <label className="form-label small text-muted mb-1">To</label>
              <input className="form-control form-control-sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            {(useCustom) && (
              <div className="col-auto">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => { setFrom(''); setTo(''); }}>
                  <i className="bi bi-x-lg me-1" />Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-6 col-xl"><StatCard label="Total Revenue" value={formatMoney(totalRevenue)} icon="bi-currency-rupee" tone="success" /></div>
        <div className="col-6 col-xl"><StatCard label="Total Bookings" value={filteredBookings.length} icon="bi-calendar-check" tone="primary" /></div>
        <div className="col-6 col-xl"><StatCard label="Active" value={activeBookings} icon="bi-key-fill" tone="accent" /></div>
        <div className="col-6 col-xl"><StatCard label="Completed" value={completed} icon="bi-check2-circle" tone="success" /></div>
        <div className="col-6 col-xl"><StatCard label="Cancelled" value={cancelled} icon="bi-x-circle" tone="danger" /></div>
        <div className="col-6 col-xl"><StatCard label="Avg Booking Value" value={formatMoney(avgValue)} icon="bi-bar-chart" tone="info" /></div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent"><h6 className="fw-bold mb-0">Most Rented Vehicle</h6></div>
            <div className="card-body">
              {mostRented ? (
                <div className="d-flex align-items-center gap-3">
                  {mostRented.images?.[0] && <img src={mostRented.images[0]} alt={mostRented.name} className="rounded" style={{ width: 80, height: 52, objectFit: 'cover' }} />}
                  <div>
                    <h5 className="fw-bold mb-1">{mostRented.name}</h5>
                    <p className="text-muted small mb-0">
                      {mostRented.type} · {mostRented.year || '—'} · {mostRentedCount} booking{mostRentedCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              ) : (
                <EmptyState icon="bi-car-front" title="No data" message="No rentals in this period." />
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent"><h6 className="fw-bold mb-0">Most Popular Category</h6></div>
            <div className="card-body">
              <h2 className="fw-bold mb-1">{mostPopularCategory}</h2>
              <p className="text-muted small mb-0">
                {Object.values(categoryCounts).reduce((a, b) => a + b, 0)} bookings across {Object.keys(categoryCounts).length} categories
              </p>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent"><h6 className="fw-bold mb-0">Fleet Size</h6></div>
            <div className="card-body">
              <h2 className="fw-bold mb-1">{cars.length}</h2>
              <p className="text-muted small mb-0">
                {cars.filter((c) => c.status === 'available').length} available · {cars.filter((c) => c.status === 'maintenance').length} in maintenance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent"><h6 className="fw-bold mb-0">Bookings by Status</h6></div>
            <div className="card-body">
              <Bar data={statusChart} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} height={280} />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent"><h6 className="fw-bold mb-0">Revenue by Month (12 months)</h6></div>
            <div className="card-body">
              <Line data={revenueChart} options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} height={280} />
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card de-card h-100">
            <div className="card-header bg-transparent"><h6 className="fw-bold mb-0">Bookings by Category</h6></div>
            <div className="card-body d-flex justify-content-center">
              {categoryChart.labels.length === 0 ? (
                <EmptyState icon="bi-pie-chart" title="No data" message="No bookings in this period." />
              ) : (
                <div style={{ width: '100%', maxWidth: 320 }}>
                  <Doughnut data={categoryChart} options={{ maintainAspectRatio: true }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}