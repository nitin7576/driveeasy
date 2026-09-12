import { formatMoney } from '../../utils/helpers';

export default function BookingSummary({ pricing }) {
  if (!pricing) return null;
  return (
    <div className="bg-light rounded-4 p-3">
      <h6 className="fw-bold mb-3">Price Summary</h6>
      <div className="d-flex justify-content-between small text-muted mb-2">
        <span>Base rental ({pricing.rentalDays} × {formatMoney(pricing.pricePerDay)})</span>
        <strong className="text-dark">{formatMoney(pricing.baseRental)}</strong>
      </div>
      <div className="d-flex justify-content-between small text-muted mb-2">
        <span>Insurance</span>
        <strong className="text-dark">{formatMoney(pricing.insurance)}</strong>
      </div>
      <div className="d-flex justify-content-between small text-muted mb-2">
        <span>Taxes</span>
        <strong className="text-dark">{formatMoney(pricing.taxes)}</strong>
      </div>
      {pricing.additionalCharges > 0 && (
        <div className="d-flex justify-content-between small text-muted mb-2">
          <span>Additional charges</span>
          <strong className="text-danger">{formatMoney(pricing.additionalCharges)}</strong>
        </div>
      )}
      {pricing.discount > 0 && (
        <div className="d-flex justify-content-between small text-success mb-2">
          <span>Coupon discount {pricing.couponCode ? `(${pricing.couponCode})` : ''}</span>
          <strong>− {formatMoney(pricing.discount)}</strong>
        </div>
      )}
      <hr className="my-2" />
      <div className="d-flex justify-content-between fw-bold fs-5">
        <span>Total</span>
        <span className="text-primary">{formatMoney(pricing.finalAmount)}</span>
      </div>
    </div>
  );
}