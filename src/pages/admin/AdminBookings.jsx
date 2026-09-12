import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { getBookings, updateBookingStatus, cancelBooking } from '../../services/bookingService';
import { getUserById } from '../../services/authService';
import { getCarById } from '../../services/carService';
import { formatDate, formatMoney, daysBetween } from '../../utils/helpers';

const PAGE_SIZE = 10;

export default function AdminBookings() {
  const [bookings, setBookings] = useState(getBookings());
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [viewBooking, setViewBooking] = useState(null);
  const [cancelId, setCancelId] = useState(null);

  const refresh = () => setBookings(getBookings());

  const all = [...bookings].sort((a, b) => new Date(b.pickupDate) - new Date(a.pickupDate));

  const filtered = all.filter((b) => {
    const q = search.trim().toLowerCase();
    const customer = getUserById(b.userId);
    const matchSearch = !q ||
      (b.id || '').toLowerCase().includes(q) ||
      (customer?.name || '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || b.status === statusFilter;
    const matchPayment = !paymentFilter || b.paymentStatus === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleStatusChange(id, status) {
    if (status === 'cancelled') {
      setCancelId(id);
      return;
    }
    updateBookingStatus(id, status);
    refresh();
  }

  function handleCancel() {
    cancelBooking(cancelId);
    setCancelId(null);
    refresh();
  }

  function buildPricingRows(b) {
    const p = b.pricing || {};
    return [
      ['Rental Days', p.rentalDays ?? daysBetween(b.pickupDate, b.returnDate)],
      ['Base Rental', p.baseRental ?? p.subtotal ?? p.total],
      ['Insurance', p.insurance],
      ['Taxes', p.taxes],
      ['Additional Charges', p.additionalCharges],
      ['Discount', p.discount],
      ['Final Amount', p.finalAmount ?? p.total],
    ].filter(([, v]) => v !== undefined && v !== null);
  }

  const viewCustomer = viewBooking ? getUserById(viewBooking.userId) : null;
  const viewCar = viewBooking ? getCarById(viewBooking.carId) : null;

  return (
    <DashboardLayout
      role="admin"
      title="Bookings"
      subtitle="View and manage all customer bookings"
    >
      <div className="card de-card mb-4">
        <div className="card-body py-3">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent"><i className="bi bi-search" /></span>
                <input
                  className="form-control"
                  placeholder="Search booking ID or customer…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Booking Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={paymentFilter}
                onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Payment Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card de-card">
        {paged.length === 0 ? (
          <div className="p-4">
            <EmptyState icon="bi-calendar-x" title="No bookings match" message="Adjust your filters or wait for new bookings to arrive." />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-de mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Car</th>
                    <th>Pickup</th>
                    <th>Return</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((b) => {
                    const customer = getUserById(b.userId);
                    const car = getCarById(b.carId);
                    return (
                      <tr key={b.id}>
                        <td><span className="fw-semibold small">{b.id}</span></td>
                        <td>{customer?.name || '—'}</td>
                        <td>{car?.name || '—'}</td>
                        <td>{formatDate(b.pickupDate)}</td>
                        <td>{formatDate(b.returnDate)}</td>
                        <td>{formatMoney(b.pricing?.finalAmount || b.pricing?.total)}</td>
                        <td><StatusBadge status={b.paymentStatus} /></td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            style={{ minWidth: 120 }}
                            value={b.status}
                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          >
                            <option value="pending">pending</option>
                            <option value="confirmed">confirmed</option>
                            <option value="active">active</option>
                            <option value="upcoming">upcoming</option>
                            <option value="completed">completed</option>
                            <option value="cancelled">cancelled</option>
                            <option value="rejected">rejected</option>
                          </select>
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-de" title="View" onClick={() => setViewBooking(b)}><i className="bi bi-eye" /></button>
                            {b.status === 'pending' && (
                              <button className="btn btn-outline-success" title="Approve" onClick={() => handleStatusChange(b.id, 'confirmed')}><i className="bi bi-check-lg" /></button>
                            )}
                            {b.status === 'pending' && (
                              <button className="btn btn-outline-danger" title="Reject" onClick={() => handleStatusChange(b.id, 'rejected')}><i className="bi bi-x-lg" /></button>
                            )}
                            {b.status === 'active' && (
                              <button className="btn btn-outline-success" title="Complete" onClick={() => handleStatusChange(b.id, 'completed')}><i className="bi bi-check2-circle" /></button>
                            )}
                            {!['completed', 'cancelled'].includes(b.status) && (
                              <button className="btn btn-outline-danger" title="Cancel" onClick={() => setCancelId(b.id)}><i className="bi bi-slash-circle" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="card-footer bg-transparent d-flex justify-content-center">
              <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal open={Boolean(viewBooking)} title="Booking Details" onClose={() => setViewBooking(null)} size="modal-lg">
        {viewBooking && (
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card de-card h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Booking Info</h6>
                  <p className="mb-1"><span className="text-muted small">Booking ID:</span> <strong>{viewBooking.id}</strong></p>
                  <p className="mb-1"><span className="text-muted small">Pickup:</span> {formatDate(viewBooking.pickupDate)}{viewBooking.pickupTime ? ` · ${viewBooking.pickupTime}` : ''}</p>
                  <p className="mb-1"><span className="text-muted small">Return:</span> {formatDate(viewBooking.returnDate)}{viewBooking.returnTime ? ` · ${viewBooking.returnTime}` : ''}</p>
                  <p className="mb-1"><span className="text-muted small">Pickup Loc:</span> {viewBooking.pickupLocation || '—'}</p>
                  <p className="mb-1"><span className="text-muted small">Drop Loc:</span> {viewBooking.dropLocation || '—'}</p>
                  <p className="mb-1"><span className="text-muted small">Transaction:</span> {viewBooking.transactionId || '—'}</p>
                  <p className="mb-1"><span className="text-muted small">Created:</span> {formatDate(viewBooking.createdAt)}</p>
                  <p className="mb-1"><span className="text-muted small">Booking Status:</span> <StatusBadge status={viewBooking.status} /></p>
                  <p className="mb-0"><span className="text-muted small">Payment Status:</span> <StatusBadge status={viewBooking.paymentStatus} /></p>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex flex-column gap-3">
              <div className="card de-card">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Customer</h6>
                  <p className="mb-1"><span className="text-muted small">Name:</span> {viewCustomer?.name || '—'}</p>
                  <p className="mb-1"><span className="text-muted small">Email:</span> {viewCustomer?.email || '—'}</p>
                  <p className="mb-0"><span className="text-muted small">Phone:</span> {viewCustomer?.phone || '—'}</p>
                </div>
              </div>
              <div className="card de-card">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Car</h6>
                  <div className="d-flex align-items-center gap-3">
                    {viewCar?.images?.[0] && (
                      <img src={viewCar.images[0]} alt={viewCar.name} style={{ width: 70, height: 46, objectFit: 'cover' }} className="rounded" />
                    )}
                    <div>
                      <p className="mb-1 fw-semibold">{viewCar?.name || '—'}</p>
                      <p className="mb-0 text-muted small">{viewCar?.type} · {viewCar?.year || '—'} · {formatMoney(viewCar?.pricePerDay)}/day</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card de-card">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Pricing Breakdown</h6>
                  <div className="row g-2">
                    {buildPricingRows(viewBooking).map(([label, val]) => (
                      <div className="col-sm-6 col-md-4" key={label}>
                        <div className="d-flex justify-content-between border-bottom pb-1 small">
                          <span className="text-muted">{label}</span>
                          <strong>{typeof val === 'number' ? formatMoney(val) : val}</strong>
                        </div>
                      </div>
                    ))}
                    {viewBooking.couponCode && <p className="small text-muted mt-2 mb-0">Coupon applied: <strong>{viewBooking.couponCode}</strong></p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelId)}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? The customer may be due for a refund."
        confirmText="Cancel Booking"
        onConfirm={handleCancel}
        onClose={() => setCancelId(null)}
      />
    </DashboardLayout>
  );
}