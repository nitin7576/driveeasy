import { Link, useParams } from 'react-router-dom';
import { getBookingById } from '../../services/bookingService';
import { getCarById } from '../../services/carService';
import { formatMoney, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const booking = getBookingById(bookingId);
  const car = booking ? getCarById(booking.carId) : null;

  if (!booking || !car) {
    return (
      <div className="container py-5">
        <EmptyState icon="bi-calendar-x" title="Booking not found" message="We couldn't find this booking." />
      </div>
    );
  }

  const pricing = booking.pricing || {};

  const detailRows = [
    ['Car', car.name],
    ['Pickup', `${formatDate(booking.pickupDate)} · ${booking.pickupTime} · ${booking.pickupLocation}`],
    ['Return', `${formatDate(booking.returnDate)} · ${booking.returnTime} · ${booking.dropLocation}`],
    ['Booking status', <StatusBadge status={booking.status} key="s" />],
    ['Payment status', <StatusBadge status={booking.paymentStatus} key="p" />],
  ];

  return (
    <div className="auth-wrap">
      <div className="card de-card" style={{ maxWidth: 720, width: '100%' }}>
        <div className="card-body p-4 p-md-5 text-center">
          <span className="feature-icon green mb-3" style={{ width: 84, height: 84, fontSize: '2.4rem' }}>
            <i className="bi bi-check-lg" />
          </span>
          <h2 className="fw-bold">Booking Confirmed!</h2>
          <p className="text-muted mb-1">
            Your booking has been confirmed. A confirmation was sent to your email.
          </p>
          <div className="d-inline-block mt-2 px-4 py-2 rounded-3 bg-primary-subtle">
            <span className="text-muted small d-block">Booking ID</span>
            <strong className="fs-5 text-de">{booking.id}</strong>
          </div>

          <div className="row text-start mt-4 g-2">
            <div className="col-md-6">
              <div className="bg-light rounded-3 p-3 h-100">
                {detailRows.map(([label, value], i) => (
                  <div className="d-flex justify-content-between small py-1" key={i}>
                    <span className="text-muted">{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-md-6">
              <div className="bg-light rounded-3 p-3 h-100">
                <div className="d-flex justify-content-between small py-1"><span className="text-muted">Base rental</span><strong>{formatMoney(pricing.baseRental)}</strong></div>
                <div className="d-flex justify-content-between small py-1"><span className="text-muted">Insurance</span><strong>{formatMoney(pricing.insurance)}</strong></div>
                <div className="d-flex justify-content-between small py-1"><span className="text-muted">Taxes</span><strong>{formatMoney(pricing.taxes)}</strong></div>
                <div className="d-flex justify-content-between small py-1"><span className="text-muted">Discount</span><strong className="text-success">− {formatMoney(pricing.discount)}</strong></div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between fw-bold py-1">
                  <span>Total paid</span>
                  <span className="text-de fs-5">{formatMoney(pricing.finalAmount)}</span>
                </div>
                {booking.transactionId && (
                  <div className="small text-muted py-1 mt-1">Transaction: {booking.transactionId}</div>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 justify-content-center mt-4">
            <Link to={`/customer/bookings`} className="btn btn-de px-4"><i className="bi bi-calendar-check me-2" />View My Bookings</Link>
            <Link to={`/invoice/${booking.id}`} className="btn btn-outline-de px-4"><i className="bi bi-file-earmark-text me-2" />Download Invoice</Link>
            <Link to="/cars" className="btn btn-light px-4"><i className="bi bi-car-front me-2" />Book Another</Link>
          </div>
        </div>
      </div>
    </div>
  );
}