import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { getBookingsByUser } from '../../services/bookingService';
import { getCarById } from '../../services/carService';
import { formatMoney, formatDate } from '../../utils/helpers';

export default function CustomerInvoices() {
  const user = JSON.parse(localStorage.getItem('de_current_user')) || {};
  const bookings = getBookingsByUser(user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <DashboardLayout role="customer" title="Invoices" subtitle="Download and print your invoices">
      {bookings.length === 0 ? (
        <div className="card de-card p-4">
          <EmptyState icon="bi-file-earmark-text" title="No invoices yet" message="Invoices will be available once you book a car." />
        </div>
      ) : (
        <div className="card de-card">
          <div className="table-responsive">
            <table className="table table-de mb-0 align-middle">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Car</th>
                  <th>Pickup</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const car = getCarById(b.carId);
                  return (
                    <tr key={b.id}>
                      <td><span className="fw-semibold small">INV-{b.id}</span></td>
                      <td>{car?.name || '—'}</td>
                      <td>{formatDate(b.pickupDate)}</td>
                      <td>{formatMoney(b.pricing?.finalAmount)}</td>
                      <td><StatusBadge status={b.paymentStatus} /></td>
                      <td className="text-end">
                        <Link to={`/invoice/${b.id}`} className="btn btn-sm btn-outline-de"><i className="bi bi-eye me-1" />View</Link>
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