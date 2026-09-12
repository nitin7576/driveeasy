import DashboardLayout from '../../components/dashboard/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import RatingStars from '../../components/common/RatingStars';
import StatusBadge from '../../components/common/StatusBadge';
import { getReviewsByUser } from '../../services/reviewService';
import { getCarById } from '../../services/carService';
import { formatDate } from '../../utils/helpers';

export default function CustomerReviews() {
  const user = JSON.parse(localStorage.getItem('de_current_user')) || {};
  const reviews = getReviewsByUser(user.id).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <DashboardLayout role="customer" title="My Reviews" subtitle="Reviews you've shared with the community">
      {reviews.length === 0 ? (
        <div className="card de-card p-4">
          <EmptyState icon="bi-star" title="No reviews yet" message="After completing a booking, you can rate and review the car." />
        </div>
      ) : (
        <div className="card de-card">
          <div className="table-responsive">
            <table className="table table-de mb-0 align-middle">
              <thead>
                <tr>
                  <th>Car</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => {
                  const car = getCarById(r.carId);
                  return (
                    <tr key={r.id}>
                      <td>{car?.name || '—'}</td>
                      <td><RatingStars value={r.rating} /></td>
                      <td>{r.comment}</td>
                      <td>{formatDate(r.date)}</td>
                      <td><StatusBadge status={r.status} /></td>
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