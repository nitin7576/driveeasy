import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/dashboard/StatCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { getPayments, updatePaymentStatus, deletePayment } from '../../services/paymentService';
import { getBookings } from '../../services/bookingService';
import { getUserById } from '../../services/authService';
import { formatMoney, formatDateTime } from '../../utils/helpers';

const PAGE_SIZE = 10;

export default function AdminPayments() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [, forceRefresh] = useState(0);

  const bookings = getBookings();
  const recordPayments = getPayments();

  const totalRevenue = recordPayments
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const pending = recordPayments
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const refunded = recordPayments
    .filter((p) => p.status === 'refunded')
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  const derived = bookings
    .filter((b) => b.transactionId && b.paymentStatus !== 'pending')
    .map((b) => ({
      id: `DP-${b.id}`,
      transactionId: b.transactionId,
      bookingId: b.id,
      customerId: b.userId,
      amount: b.pricing?.finalAmount || b.pricing?.total || 0,
      method: 'card',
      date: b.createdAt ? `${b.createdAt}T10:00:00` : `${b.pickupDate}T10:00:00`,
      status: b.paymentStatus,
    }));

  const unique = new Set(recordPayments.map((p) => p.bookingId));
  const merged = [...recordPayments, ...derived.filter((d) => !unique.has(d.bookingId))]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = merged.filter((p) => !statusFilter || p.status === statusFilter);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleStatusChange(id, status) {
    if (String(id).startsWith('DP-')) {
      const bookingId = id.replace('DP-', '');
      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) {
        const updated = [...bookings];
        const idx = updated.findIndex((b) => b.id === bookingId);
        updated[idx] = { ...updated[idx], paymentStatus: status };
        localStorage.setItem('de_bookings', JSON.stringify(updated));
      }
      forceRefresh((v) => v + 1);
      return;
    }
    updatePaymentStatus(id, status);
    forceRefresh((v) => v + 1);
  }

  function handleDelete() {
    if (String(deleteId).startsWith('DP-')) {
      setDeleteId(null);
      return;
    }
    deletePayment(deleteId);
    setDeleteId(null);
  }

  const customerName = (id) => getUserById(id)?.name || '—';
  const customerOf = (p) => p.customerId || (bookings.find((b) => b.id === p.bookingId)?.userId) || null;

  return (
    <DashboardLayout
      role="admin"
      title="Payments"
      subtitle="Track all transactions across bookings"
    >
      <div className="row g-4 mb-4">
        <div className="col-6 col-xl-3"><StatCard label="Total Revenue" value={formatMoney(totalRevenue)} icon="bi-currency-rupee" tone="success" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Pending" value={formatMoney(pending)} icon="bi-hourglass-split" tone="warning" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Refunded" value={formatMoney(refunded)} icon="bi-arrow-counterclockwise" tone="danger" /></div>
        <div className="col-6 col-xl-3"><StatCard label="Total Transactions" value={merged.length} icon="bi-receipt" tone="info" /></div>
      </div>

      <div className="card de-card mb-4">
        <div className="card-body py-3">
          <select
            className="form-select"
            style={{ maxWidth: 280 }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="card de-card">
        {paged.length === 0 ? (
          <div className="p-4">
            <EmptyState icon="bi-credit-card" title="No payments found" message="Transactions will appear here as bookings are made." />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-de mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p) => (
                    <tr key={p.id}>
                      <td><span className="fw-semibold small">{p.transactionId || p.id}</span></td>
                      <td>{p.bookingId}</td>
                      <td>{customerName(customerOf(p))}</td>
                      <td>{formatMoney(p.amount)}</td>
                      <td className="text-capitalize">{p.method || '—'}</td>
                      <td>{formatDateTime(p.date)}</td>
                      <td>
                        <div className="d-flex flex-column gap-1 align-items-start">
                          <StatusBadge status={p.status} />
                          <select
                            className="form-select form-select-sm"
                            style={{ minWidth: 110 }}
                            value={p.status}
                            onChange={(e) => { handleStatusChange(p.id, e.target.value); }}
                          >
                            <option value="paid">paid</option>
                            <option value="pending">pending</option>
                            <option value="failed">failed</option>
                            <option value="refunded">refunded</option>
                          </select>
                        </div>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-outline-danger btn-sm" title="Delete" onClick={() => setDeleteId(p.id)}>
                          <i className="bi bi-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer bg-transparent d-flex justify-content-center">
              <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Payment"
        message="Are you sure you want to delete this payment record? This cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </DashboardLayout>
  );
}