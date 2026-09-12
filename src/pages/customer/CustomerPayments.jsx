import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/dashboard/StatCard';
import EmptyState from '../../components/common/EmptyState';
import { getPaymentsByUser } from '../../services/paymentService';
import { getBookingsByUser } from '../../services/bookingService';
import { getCarById } from '../../services/carService';
import { formatMoney, formatDateTime } from '../../utils/helpers';

export default function CustomerPayments() {
  const user = JSON.parse(localStorage.getItem('de_current_user')) || {};
  const recordPayments = getPaymentsByUser(user.id);
  const derivedPayments = getBookingsByUser(user.id)
    .filter((b) => b.transactionId && b.paymentStatus !== 'pending')
    .map((b) => ({
      id: `DP-${b.id}`,
      transactionId: b.transactionId,
      bookingId: b.id,
      amount: b.pricing?.finalAmount || 0,
      method: 'card',
      date: b.createdAt ? `${b.createdAt}T10:00:00` : `${b.pickupDate}T10:00:00`,
      status: b.paymentStatus,
    }));

  const unique = new Set(recordPayments.map((p) => p.bookingId));
  const merged = [...recordPayments, ...derivedPayments.filter((d) => !unique.has(d.bookingId))]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPaid = merged.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const refunded = merged.filter((p) => p.status === 'refunded').reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardLayout role="customer" title="Payments" subtitle="Your transaction history">
      <div className="row g-4 mb-4">
        <div className="col-6 col-xl-3"><StatCard label="Total Paid" value={formatMoney(totalPaid)} icon="bi-credit-card-fill" tone="success" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Refunded" value={formatMoney(refunded)} icon="bi-arrow-counterclockwise" tone="warning" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Transactions" value={merged.length} icon="bi-receipt" tone="info" /></div>
      </div>

      {merged.length === 0 ? (
        <div className="card de-card p-4">
          <EmptyState icon="bi-credit-card" title="No payments yet" message="Transactions will appear here after your first booking." />
        </div>
      ) : (
        <div className="card de-card">
          <div className="table-responsive">
            <table className="table table-de mb-0 align-middle">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Booking</th>
                  <th>Car</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-end">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {merged.map((p) => {
                  const booking = getBookingsByUser(user.id).find((b) => b.id === p.bookingId);
                  const car = booking ? getCarById(booking.carId) : null;
                  return (
                    <tr key={p.id}>
                      <td><span className="fw-semibold small">{p.transactionId}</span></td>
                      <td>{p.bookingId}</td>
                      <td>{car?.name || '—'}</td>
                      <td>{formatMoney(p.amount)}</td>
                      <td className="text-capitalize">{p.method}</td>
                      <td>{formatDateTime(p.date)}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td className="text-end">
                        {booking && <Link to={`/invoice/${booking.id}`} className="btn btn-sm btn-outline-de"><i className="bi bi-receipt" /></Link>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}