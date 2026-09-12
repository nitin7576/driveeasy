import { useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCarById } from '../../services/carService';
import { isCarBooked, createBooking } from '../../services/bookingService';
import { isCarInMaintenance } from '../../services/maintenanceService';
import { createPayment } from '../../services/paymentService';
import { validateCoupon, consumeCoupon } from '../../services/couponService';
import { getUserById } from '../../services/authService';
import { addNotification } from '../../services/notificationService';
import BookingSummary from '../../components/booking/BookingSummary';
import PaymentForm from '../../components/booking/PaymentForm';
import { computeBookingPricing } from '../../utils/pricing';
import { formatMoney, todayISO, addDaysISO, daysBetween } from '../../utils/helpers';
import EmptyState from '../../components/common/EmptyState';

const STEPS = ['Trip Details', 'Summary', 'Coupon', 'Your Details', 'Payment'];

export default function BookingPage() {
  const { carId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const car = getCarById(carId);

  const [step, setStep] = useState(0);
  const [dates, setDates] = useState({
    pickup: searchParams.get('pickup') || todayISO(),
    pickupLocation: searchParams.get('location') || car?.locations?.[0] || '',
    dropLocation: car?.locations?.[0] || '',
    pickupTime: '10:00',
    returnTime: '10:00',
    return: searchParams.get('return') || addDaysISO(2),
  });
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponMsg, setCouponMsg] = useState(null);
  const [couponOk, setCouponOk] = useState(false);
  const [customer, setCustomer] = useState({});
  const [customErr, setCustomErr] = useState({});
  const [processing, setProcessing] = useState(false);

  const rentalDays = daysBetween(dates.pickup, dates.return);
  const pricing = useMemo(
    () => computeBookingPricing(car, rentalDays, coupon),
    [car, rentalDays, coupon]
  );

  if (!car) {
    return (
      <div className="container py-5">
        <EmptyState icon="bi-car-front" title="Car not found" message="Please choose a car from our fleet." action={<Link to="/cars" className="btn btn-de">Browse Cars</Link>} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: `/booking/${carId}` }} replace />;
  if (user.role !== 'customer') return <Navigate to="/" replace />;

  const inMaintenance = isCarInMaintenance(car.id);
  const conflict = isCarBooked(car.id, dates.pickup, dates.return);
  const unbookable = car.status !== 'available' || inMaintenance || conflict || rentalDays < 1;

  const validateDates = () => {
    if (!dates.pickup || !dates.return) return 'Please select pickup and return dates';
    if (new Date(dates.return) <= new Date(dates.pickup)) return 'Return date must be after pickup date';
    if (new Date(dates.pickup) < new Date(todayISO())) return 'Pickup date cannot be in the past';
    if (conflict) return 'This car is already booked for the selected dates';
    return null;
  };

  const step1Valid = !validateDates() && dates.pickupLocation && dates.dropLocation && !unbookable;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const res = validateCoupon(couponCode, pricing.baseRental);
    if (res.valid) {
      const preview = computeBookingPricing(car, rentalDays, res.coupon);
      setCoupon(res.coupon);
      setCouponOk(true);
      setCouponMsg({ type: 'success', text: `Coupon ${res.coupon.code} applied — you save ${formatMoney(preview.discount)}` });
    } else {
      setCoupon(null);
      setCouponOk(false);
      setCouponMsg({ type: 'danger', text: res.message });
    }
  };

  const validateCustomer = () => {
    const errs = {};
    const loaded = customerFromUser();
    if (!customer.name && !loaded.name) errs.name = 'Full name is required';
    if (!customer.email && !loaded.email) errs.email = 'Email is required';
    if (!/^[6-9]\d{9}$/.test(customer.phone || loaded.phone || '')) errs.phone = 'Valid 10-digit phone required';
    if (!(customer.license || loaded.license)) errs.license = 'Driving license number is required';
    return errs;
  };

  const customerFromUser = () => {
    const full = getUserById(user.id);
    return full ? { name: full.name, email: full.email, phone: full.phone, license: full.license?.number || '', address: full.address, city: full.city } : {};
  };
  const base = customerFromUser();

  const nextFromInfo = () => {
    const errs = validateCustomer();
    setCustomErr(errs);
    if (Object.keys(errs).length === 0) setStep(4);
  };

  const handlePay = (method) => {
    setProcessing(true);
    setTimeout(() => {
      const booking = createBooking({
        carId: car.id,
        userId: user.id,
        carPricePerDay: car.pricePerDay,
        pickupLocation: dates.pickupLocation,
        dropLocation: dates.dropLocation,
        pickupDate: dates.pickup,
        pickupTime: dates.pickupTime,
        returnDate: dates.return,
        returnTime: dates.returnTime,
        couponCode: couponOk ? couponCode : null,
        coupon: couponOk ? coupon : null,
      });
      createPayment({ bookingId: booking.id, customerId: user.id, amount: booking.pricing.finalAmount, method });
      if (couponOk && coupon) consumeCoupon(coupon.code);
      addNotification({ userId: user.id, message: `Your booking (${booking.id}) has been confirmed for ${car.name}.`, type: 'info' });
      setProcessing(false);
      navigate(`/booking/confirmation/${booking.id}`);
    }, 1200);
  };

  const img = car.images?.[0];
  const allSteps = STEPS.map((label, i) => ({ label, done: i < step, active: i === step }));

  return (
    <div>
      <section className="bg-white border-bottom py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h1 className="page-title fs-3 mb-1">Book your car</h1>
              <p className="text-muted small mb-0">Complete your booking in a few simple steps.</p>
            </div>
            <span className="badge bg-primary-subtle text-primary-emphasis fs-6">{car.name} · {formatMoney(car.pricePerDay)}/day</span>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="container">
          <div className="d-flex justify-content-center mb-4">
            <div className="steps">
              {allSteps.map((s, i) => (
                <span key={s.label} className={`step-chip ${s.active ? 'active' : ''} ${s.done ? 'done' : ''}`}>
                  <span className="num">{s.done ? '✓' : i + 1}</span>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <div className="row g-4 justify-content-center">
            <div className="col-lg-7">
              <div className="card de-card">
                <div className="card-body p-4">
                  {/* Step 1 */}
                  {step === 0 && (
                    <>
                      <h5 className="fw-bold mb-3"><i className="bi bi-geo-alt me-2 text-de" />Trip Details</h5>
                      {validateDates() && <div className="alert alert-danger py-2 small">{validateDates()}</div>}
                      {unbookable && !validateDates() && (
                        <div className="alert alert-warning py-2 small"><i className="bi bi-exclamation-circle me-1" />
                          {inMaintenance ? 'This car is under maintenance' : conflict ? 'Car is booked for these dates' : 'Car is currently unavailable'}.
                        </div>
                      )}
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Pickup location</label>
                          <select className="form-select" value={dates.pickupLocation} onChange={(e) => setDates({ ...dates, pickupLocation: e.target.value })}>
                            <option value="">Select…</option>
                            {(car.locations || []).map((l) => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Drop location</label>
                          <select className="form-select" value={dates.dropLocation} onChange={(e) => setDates({ ...dates, dropLocation: e.target.value })}>
                            <option value="">Select…</option>
                            {(car.locations || []).map((l) => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Pickup date</label>
                          <input type="date" className="form-control" min={todayISO()} value={dates.pickup} onChange={(e) => setDates({ ...dates, pickup: e.target.value })} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Pickup time</label>
                          <input type="time" className="form-control" value={dates.pickupTime} onChange={(e) => setDates({ ...dates, pickupTime: e.target.value })} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Return date</label>
                          <input type="date" className="form-control" min={dates.pickup} value={dates.return} onChange={(e) => setDates({ ...dates, return: e.target.value })} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Return time</label>
                          <input type="time" className="form-control" value={dates.returnTime} onChange={(e) => setDates({ ...dates, returnTime: e.target.value })} />
                        </div>
                      </div>
                      <div className="text-end mt-3">
                        <button className="btn btn-de px-5" disabled={!step1Valid} onClick={() => setStep(1)}>Continue</button>
                      </div>
                    </>
                  )}

                  {/* Step 2 */}
                  {step === 1 && (
                    <>
                      <h5 className="fw-bold mb-3"><i className="bi bi-receipt me-2 text-de" />Booking Summary</h5>
                      <div className="d-flex gap-3 mb-3">
                        {img && <img src={img} alt={car.name} className="rounded-3" style={{ width: 130, height: 90, objectFit: 'cover' }} />}
                        <div>
                          <h6 className="fw-bold mb-1">{car.name}</h6>
                          <span className="text-muted small d-block">{rentalDays} day{rentalDays > 1 ? 's' : ''} · {dates.pickup} → {dates.return}</span>
                          <span className="text-muted small d-block"><i className="bi bi-geo-alt me-1" />{dates.pickupLocation} → {dates.dropLocation}</span>
                          <span className="text-muted small d-block">{dates.pickupTime} pickup · {dates.returnTime} return</span>
                        </div>
                      </div>
                      <BookingSummary pricing={pricing} />
                      <div className="text-end mt-3">
                        <button className="btn btn-outline-de me-2" onClick={() => setStep(0)}>Back</button>
                        <button className="btn btn-de px-5" onClick={() => setStep(2)}>Continue</button>
                      </div>
                    </>
                  )}

                  {/* Step 3 */}
                  {step === 2 && (
                    <>
                      <h5 className="fw-bold mb-3"><i className="bi bi-ticket-perforated me-2 text-de" />Apply Coupon</h5>
                      <p className="text-muted small">Have a promo code? Enter it below to save on this booking.</p>
                      <div className="input-group">
                        <input
                          className="form-control"
                          placeholder="e.g. WELCOME10"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        />
                        <button className="btn btn-de" onClick={handleApplyCoupon} disabled={!couponCode.trim()}>Apply</button>
                      </div>
                      {couponMsg && (
                        <div className={`alert ${couponMsg.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 small mt-2`}>
                          <i className={`bi ${couponOk ? 'bi-check-circle' : 'bi-exclamation-circle'} me-1`} />{couponMsg.text}
                        </div>
                      )}
                      {coupon && (
                        <div className="small text-muted d-flex justify-content-between mt-2">
                          <span>{coupon.code} · {coupon.discountPercent}% off (max {formatMoney(coupon.maxDiscount)})</span>
                          <button className="btn btn-sm btn-link text-danger p-0" onClick={() => { setCoupon(null); setCouponOk(false); setCouponCode(''); setCouponMsg(null); }}>Remove</button>
                        </div>
                      )}
                      <div className="mt-4">
                        <BookingSummary pricing={pricing} />
                      </div>
                      <div className="text-end mt-3">
                        <button className="btn btn-outline-de me-2" onClick={() => setStep(1)}>Back</button>
                        <button className="btn btn-de px-5" onClick={() => setStep(3)}>Continue</button>
                      </div>
                    </>
                  )}

                  {/* Step 4 */}
                  {step === 3 && (
                    <>
                      <h5 className="fw-bold mb-3"><i className="bi bi-person-vcard me-2 text-de" />Your Details</h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold required">Full name</label>
                          <input className="form-control" defaultValue={base.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                          {customErr.name && <small className="text-danger">{customErr.name}</small>}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold required">Email</label>
                          <input type="email" className="form-control" defaultValue={base.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
                          {customErr.email && <small className="text-danger">{customErr.email}</small>}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold required">Phone</label>
                          <input className="form-control" defaultValue={base.phone} maxLength={10} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                          {customErr.phone && <small className="text-danger">{customErr.phone}</small>}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold required">Driving license number</label>
                          <input className="form-control" defaultValue={base.license} onChange={(e) => setCustomer({ ...customer, license: e.target.value })} />
                          {customErr.license && <small className="text-danger">{customErr.license}</small>}
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold">Address</label>
                          <input className="form-control" defaultValue={base.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
                        </div>
                      </div>
                      <div className="text-end mt-3">
                        <button className="btn btn-outline-de me-2" onClick={() => setStep(2)}>Back</button>
                        <button className="btn btn-de px-5" onClick={nextFromInfo}>Continue</button>
                      </div>
                    </>
                  )}

                  {/* Step 5 */}
                  {step === 4 && (
                    <>
                      <h5 className="fw-bold mb-3"><i className="bi bi-credit-card me-2 text-de" />Payment</h5>
                      <PaymentForm amount={pricing.finalAmount} onPay={handlePay} processing={processing} />
                      <div className="mt-3">
                        <button className="btn btn-outline-de" onClick={() => setStep(3)} disabled={processing}>Back</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="position-sticky" style={{ top: 90 }}>
                <div className="card de-card mb-3">
                  <div className="card-body p-3">
                    <h6 className="fw-bold d-flex align-items-center gap-2 mb-3"><i className="bi bi-car-front text-de" />Your Selection</h6>
                    <div className="text-center mb-3">
                      {img && <img src={img} alt={car.name} className="w-100 rounded-3" style={{ height: 110, objectFit: 'cover' }} />}
                    </div>
                    <h6 className="fw-bold mb-1">{car.name}</h6>
                    <div className="small text-muted mb-2">{formatMoney(car.pricePerDay)} / day</div>
                    <hr className="my-2" />
                    <div className="small d-flex justify-content-between mb-1"><span className="text-muted">Days</span><span>{rentalDays}</span></div>
                    <div className="small d-flex justify-content-between mb-1"><span className="text-muted">From</span><span>{dates.pickup}</span></div>
                    <div className="small d-flex justify-content-between"><span className="text-muted">To</span><span>{dates.return}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}