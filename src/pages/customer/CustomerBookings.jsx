import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { useNotifications } from '../../context/NotificationContext';
import { getBookingsByUser, updateBookingStatus } from '../../services/bookingService';
import { getCarById } from '../../services/carService';
import { addReview } from '../../services/reviewService';
import { addNotification } from '../../services/notificationService';
import { formatMoney, formatDate } from '../../utils/helpers';

const TABS = ['All', 'Upcoming', 'Active', 'Completed', 'Cancelled'];

export default function CustomerBookings() {
  const notif = useNotifications();
  const bookings = getBookingsByUser(localStorage.getItem('de_current_user') ? JSON.parse(localStorage.getItem('de_current_user')).id : null);

  const [tab, setTab] = useState('All');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const today = new Date().toISOString().split('T')[0];

  const classify = useCallback((b) => {
    if (b.status === 'cancelled' || b.status === 'rejected') return 'Cancelled';
    if (b.status === 'completed') return 'Completed';
    if (b.status === 'active' || (b.status === 'confirmed' && b.pickupDate <= today && b.returnDate >= today)) return 'Active';
    if (b.status === 'confirmed') return 'Upcoming';
    return 'All';
  }, [today]);

  const filtered = useMemo(() => {
    let list = bookings;
    if (tab !== 'All') list = list.filter((b) => classify(b) === tab);
    return list.sort((a, b) => new Date(b.pickupDate) - new Date(a.pickupDate));
  }, [bookings, tab, classify]);

  const handleCancel = () => {
    updateBookingStatus(cancelTarget.id, 'cancelled');
    addNotification({ userId: cancelTarget.userId, message: `Your booking (${cancelTarget.id}) has been cancelled.`, type: 'warning' });
    if (notif.refresh) notif.refresh();
    setCancelTarget(null);
  };

  const handleReview = () => {
    const user = JSON.parse(localStorage.getItem('de_current_user'));
    addReview({
      carId: reviewTarget.carId,
      userId: user.id,
      userName: user.name,
      rating: review.rating,
      comment: review.comment || 'Great experience with DriveEasy!',
    });
    setReviewTarget(null);
    setReview({ rating: 5, comment: '' });
  };

  return (
    <DashboardLayout role="customer" title="My Bookings" subtitle="View, manage and review your rentals">
      <div className="d-flex flex-wrap gap-2 mb-3">
        {TABS.map((t) => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-light border'}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card de-card p-4">
          <EmptyState icon="bi-calendar-x" title={`No ${tab.toLowerCase()} bookings`} message="Bookings will appear here." action={<Link to="/cars" className="btn btn-de mt-2">Browse Cars</Link>} />
        </div>
      ) : (
        <div className="card de-card">
          <div className="table-responsive">
            <table className="table table-de mb-0 align-middle">
              <thead>
                <tr>
                  <th>Booking ID</th>
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
                {filtered.map((b) => {
                  const car = getCarById(b.carId);
                  return (
                    <tr key={b.id}>
                      <td><span className="fw-semibold">{b.id}</span></td>
                      <td>{car?.name || '—'}</td>
                      <td>{formatDate(b.pickupDate)}</td>
                      <td>{formatDate(b.returnDate)}</td>
                      <td>{formatMoney(b.pricing?.finalAmount)}</td>
                      <td><StatusBadge status={b.paymentStatus} /></td>
                      <td><StatusBadge status={b.status} /></td>
                      <td className="text-end table-actions">
                        <Link to={`/invoice/${b.id}`} className="btn btn-sm btn-outline-de" title="View"><i className="bi bi-eye" /></Link>
                        {b.status === 'confirmed' && (
                          <button className="btn btn-sm btn-outline-danger" title="Cancel" onClick={() => setCancelTarget(b)}><i className="bi bi-x-lg" /></button>
                        )}
                        <button className="btn btn-sm btn-outline-de" title="Invoice" onClick={() => window.open(`/invoice/${b.id}`, '_self')}><i className="bi bi-receipt" /></button>
                        {classify(b) === 'Completed' && (
                          <button className="btn btn-sm btn-outline-warning" title="Review" onClick={() => setReviewTarget(b)}><i className="bi bi-star" /></button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel Booking"
        message={`Are you sure you want to cancel booking ${cancelTarget?.id}? Your payment will be refunded.`}
        confirmText="Yes, Cancel"
        onConfirm={handleCancel}
        onClose={() => setCancelTarget(null)}
      />

      <Modal open={!!reviewTarget} title={`Review ${reviewTarget ? getCarById(reviewTarget.carId)?.name : ''}`} onClose={() => setReviewTarget(null)} onConfirm={handleReview} confirmText="Submit Review">
        <div className="d-grid gap-3">
          <div>
            <label className="form-label fw-semibold">Your rating</label>
            <div className="d-flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} type="button" className="btn p-0 fs-3" onClick={() => setReview({ ...review, rating: i })}>
                  <i className={`bi ${i <= review.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label fw-semibold">Comment</label>
            <textarea className="form-control" rows={3} placeholder="How was your experience?" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}