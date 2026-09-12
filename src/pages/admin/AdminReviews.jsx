import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import RatingStars from '../../components/common/RatingStars';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { getReviews, setReviewStatus, deleteReview } from '../../services/reviewService';
import { getCarById } from '../../services/carService';
import { formatDate } from '../../utils/helpers';

const PAGE_SIZE = 8;

export default function AdminReviews() {
  const [reviews, setReviews] = useState(getReviews());
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const refresh = () => setReviews(getReviews());
  const pageCount = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const paged = reviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleStatusChange(id, status) {
    setReviewStatus(id, status);
    refresh();
  }

  function handleDelete() {
    deleteReview(deleteId);
    setDeleteId(null);
    refresh();
  }

  return (
    <DashboardLayout
      role="admin"
      title="Reviews"
      subtitle="Moderate customer reviews across your fleet"
    >
      <div className="card de-card">
        {paged.length === 0 ? (
          <div className="p-4">
            <EmptyState icon="bi-chat-square-text" title="No reviews yet" message="Customer reviews will appear here for moderation." />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-de mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Car</th>
                    <th>Customer</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r) => {
                    const car = getCarById(r.carId);
                    return (
                      <tr key={r.id}>
                        <td>{car?.name || '—'}</td>
                        <td><span className="fw-semibold">{r.userName || '—'}</span></td>
                        <td><RatingStars value={r.rating} /></td>
                        <td style={{ maxWidth: 320 }} className="text-muted small">{r.comment || '—'}</td>
                        <td>{formatDate(r.date)}</td>
                        <td><StatusBadge status={r.status} /></td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            {r.status !== 'approved' && (
                              <button className="btn btn-outline-success" title="Approve" onClick={() => handleStatusChange(r.id, 'approved')}>
                                <i className="bi bi-check-lg" />
                              </button>
                            )}
                            {r.status === 'approved' && (
                              <button className="btn btn-outline-secondary" title="Hide" onClick={() => handleStatusChange(r.id, 'hidden')}>
                                <i className="bi bi-eye-slash" />
                              </button>
                            )}
                            <button className="btn btn-outline-danger" title="Delete" onClick={() => setDeleteId(r.id)}>
                              <i className="bi bi-trash" />
                            </button>
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

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Review"
        message="Are you sure you want to permanently delete this review? This cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </DashboardLayout>
  );
}