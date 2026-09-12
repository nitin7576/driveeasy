import { Link, useParams } from 'react-router-dom';
import { getBookingById } from '../../services/bookingService';
import { getCarById } from '../../services/carService';
import { getUserById } from '../../services/authService';
import { formatMoney, formatDate, formatDateTime } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

export default function InvoicePage() {
  const { bookingId } = useParams();
  const booking = getBookingById(bookingId);
  const car = booking ? getCarById(booking.carId) : null;
  const customer = booking ? getUserById(booking.userId) : null;

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const rows = [
      ['DriveEasy Invoice', ''],
      ['Invoice', `INV-${booking.id}`],
      ['Booking ID', booking.id],
      ['', ''],
      ['Customer', customer ? `${customer.name} (${customer.email})` : booking.userId],
      ['Car', car ? car.name : booking.carId],
      ['Pickup', `${formatDate(booking.pickupDate)} ${booking.pickupTime} @ ${booking.pickupLocation}`],
      ['Return', `${formatDate(booking.returnDate)} ${booking.returnTime} @ ${booking.dropLocation}`],
      ['Base rental', formatMoney(booking.pricing.baseRental)],
      ['Insurance', formatMoney(booking.pricing.insurance)],
      ['Taxes', formatMoney(booking.pricing.taxes)],
      ['Discount', `-${formatMoney(booking.pricing.discount)}`],
      ['Total', formatMoney(booking.pricing.finalAmount)],
      ['Payment status', booking.paymentStatus],
      ['Transaction', booking.transactionId || 'N/A'],
    ];
    const text = rows.map((r) => r.join('\t')).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DriveEasy-Invoice-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!booking || !car) {
    return (
      <div className="container py-5">
        <EmptyState icon="bi-receipt" title="Invoice not found" />
      </div>
    );
  }

  const pricing = booking.pricing;

  return (
    <div className="container py-5 invoice-page">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 no-print">
        <Link to="/customer/bookings" className="btn btn-light"><i className="bi bi-arrow-left me-1" />Back to Bookings</Link>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-de" onClick={handlePrint}><i className="bi bi-printer me-1" />Print Invoice</button>
          <button className="btn btn-de" onClick={handleDownload}><i className="bi bi-download me-1" />Download Invoice</button>
        </div>
      </div>

      <div className="invoice-sheet p-4 p-md-5" id="invoice">
        <div className="in-hd mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h3 className="fw-bold mb-1"><i className="bi bi-car-front-fill me-2" />DriveEasy</h3>
              <span className="opacity-75 small">Car Rental Management System</span>
            </div>
            <div className="text-end">
              <div className="fw-bold fs-5">INVOICE</div>
              <div className="small">Inv No: INV-{booking.id}</div>
              <div className="small">Date: {formatDate(booking.createdAt || booking.pickupDate)}</div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <h6 className="text-uppercase small fw-bold text-muted mb-2">Billed To</h6>
            <div className="fw-bold">{customer?.name || 'Customer'}</div>
            <div className="small text-muted">{customer?.email}</div>
            <div className="small text-muted">{customer?.phone}</div>
            <div className="small text-muted">{customer?.address},{customer?.city}</div>
          </div>
          <div className="col-md-6">
            <h6 className="text-uppercase small fw-bold text-muted mb-2">Vehicle Details</h6>
            <div className="fw-bold">{car.name}</div>
            <div className="small text-muted">{car.type} · {car.fuelType} · {car.transmission} · {car.seats} seats</div>
            <div className="small text-muted">Price: {formatMoney(pricing.perDay)} per day × {pricing.rentalDays} days</div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <h6 className="text-uppercase small fw-bold text-muted mb-2">Pickup</h6>
            <div className="fw-bold">{booking.pickupLocation}</div>
            <div className="small text-muted">{formatDateTime(`${booking.pickupDate}T${booking.pickupTime}`)}</div>
          </div>
          <div className="col-md-6">
            <h6 className="text-uppercase small fw-bold text-muted mb-2">Return</h6>
            <div className="fw-bold">{booking.dropLocation}</div>
            <div className="small text-muted">{formatDateTime(`${booking.returnDate}T${booking.returnTime}`)}</div>
          </div>
        </div>

        <hr />
        <h6 className="mb-3">Amount Summary</h6>
        <table className="table table-sm invoice-table mb-4">
          <tbody>
            <tr><td>Base rental ({pricing.rentalDays} days)</td><td className="text-end">{formatMoney(pricing.baseRental)}</td></tr>
            <tr><td>Insurance</td><td className="text-end">{formatMoney(pricing.insurance)}</td></tr>
            <tr><td>Taxes</td><td className="text-end">{formatMoney(pricing.taxes)}</td></tr>
            {pricing.additionalCharges > 0 && (
              <tr><td>Additional charges</td><td className="text-end">{formatMoney(pricing.additionalCharges)}</td></tr>
            )}
            {pricing.discount > 0 && (
              <tr><td>Coupon discount {pricing.couponCode ? `(${pricing.couponCode})` : ''}</td><td className="text-end text-success">− {formatMoney(pricing.discount)}</td></tr>
            )}
            <tr className="fw-bold"><td>TOTAL</td><td className="text-end fs-5 text-de">{formatMoney(pricing.finalAmount)}</td></tr>
          </tbody>
        </table>

        <div className="d-flex flex-wrap justify-content-between gap-2 align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Payment:</span>
            <StatusBadge status={booking.paymentStatus} />
            {booking.transactionId && <span className="small text-muted">Txn: {booking.transactionId}</span>}
          </div>
          <span className="badge bg-primary-subtle text-primary-emphasis">Status: {booking.status}</span>
        </div>

        <hr className="my-4" />
        <p className="text-muted small text-center mb-0">
          Thank you for choosing DriveEasy! Drive safe and enjoy your journey.
        </p>
      </div>
    </div>
  );
}