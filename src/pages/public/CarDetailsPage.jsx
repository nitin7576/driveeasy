import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import RatingStars from '../../components/common/RatingStars';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { getCarById } from '../../services/carService';
import { getReviewsByCar } from '../../services/reviewService';
import { isCarBooked } from '../../services/bookingService';
import { isCarInMaintenance } from '../../services/maintenanceService';
import { useAuth } from '../../context/AuthContext';
import { toggleWishlist, isInWishlist } from '../../services/wishlistService';
import { formatMoney, todayISO, addDaysISO } from '../../utils/helpers';

export default function CarDetailsPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const car = getCarById(carId);
  const reviews = getReviewsByCar(carId);

  const [wishlisted, setWishlisted] = useState(() => (user ? isInWishlist(user.id, carId) : false));
  const [dates, setDates] = useState({ pickup: todayISO(), return: addDaysISO(2) });

  if (!car) {
    return (
      <div className="container py-5">
        <EmptyState icon="bi-car-front" title="Car not found" message="The car you are looking for does not exist." />
      </div>
    );
  }

  const inMaintenance = isCarInMaintenance(car.id);
  const unbookable = car.status !== 'available' || inMaintenance;
  const conflict =
    dates.pickup && dates.return && new Date(dates.return) <= new Date(dates.pickup)
      ? 'Return date must be after pickup date.'
      : isCarBooked(car.id, dates.pickup, dates.return)
        ? 'This car is already booked for the selected dates.'
        : null;

  const handleWishlist = () => {
    if (!user) { navigate('/login', { state: { from: `/cars/${car.id}` } }); return; }
    if (user.role !== 'customer') return;
    setWishlisted(toggleWishlist(user.id, car.id));
  };

  const handleBook = () => {
    navigate(`/booking/${car.id}?pickup=${dates.pickup}&return=${dates.return}`);
  };

  const img = car.images?.[0];
  const allLocations = car.locations || [];

  return (
    <div>
      <section className="bg-white border-bottom py-3">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 small">
              <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
              <li className="breadcrumb-item"><Link to="/cars" className="text-decoration-none">Cars</Link></li>
              <li className="breadcrumb-item active">{car.brand || car.name} {car.model || car.type}</li>
            </ol>
          </nav>
        </div>
      </section>

      <section className="py-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card de-card overflow-hidden">
                {img ? (
                  <img src={img} className="w-100" alt={car.name} style={{ height: 'min(420px, 60vw)', objectFit: 'cover' }} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center text-muted" style={{ height: 420 }}>No Image</div>
                )}
              </div>
              <div className="d-flex gap-2 mt-3 flex-wrap">
                {car.images?.slice(0, 4).map((im, i) => (
                  im !== img && (
                    <img key={i} src={im} className="rounded-3 border" alt={`${car.name} ${i}`} style={{ width: 90, height: 60, objectFit: 'cover' }} />
                  )
                ))}
              </div>

              <div className="card de-card mt-4">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Features &amp; Amenities</h5>
                  <div className="row g-2">
                    {(car.features || []).map((f) => (
                      <div className="col-6 col-md-4" key={f}>
                        <span className="small"><i className="bi bi-check-circle-fill text-success me-1" />{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card de-card mt-4">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Customer Reviews ({reviews.length})</h5>
                  {reviews.length === 0 ? (
                    <p className="text-muted small mb-0">No reviews yet for this car.</p>
                  ) : (
                    reviews.map((r) => (
                      <div className="border-bottom pb-3 mb-3" key={r.id}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong className="small">{r.userName}</strong>
                            <RatingStars value={r.rating} />
                          </div>
                          <small className="text-muted">{r.date}</small>
                        </div>
                        <p className="small mb-0 mt-1">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="position-sticky" style={{ top: 90 }}>
                <div className="card de-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h2 className="fw-bold fs-3 mb-1">{car.brand || car.name} {car.model || car.type}</h2>
                        <span className="text-muted small">{car.year} · {car.type}</span>
                      </div>
                      <StatusBadge status={inMaintenance ? 'maintenance' : car.status} />
                    </div>
                    <div className="car-specs mt-3">
                      <span><i className="bi bi-fuel-pump" /> {car.fuelType}</span>
                      <span><i className="bi bi-gear-wide-connected" /> {car.transmission}</span>
                      <span><i className="bi bi-people" /> {car.seats} seats</span>
                      <span><i className="bi bi-speedometer2" /> {car.mileage} km/l</span>
                    </div>
                    {allLocations.length > 0 && (
                      <p className="small text-muted mb-0"><i className="bi bi-geo-alt me-1" />Available in: {allLocations.join(', ')}</p>
                    )}
                    {car.rating > 0 && (
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <RatingStars value={car.rating} />
                        <span className="small fw-bold">{car.rating}</span>
                        <span className="text-muted small">({car.reviewCount || reviews.length} reviews)</span>
                      </div>
                    )}

                    <hr />

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted">Price per day</span>
                      <span className="fs-3 fw-bold text-de">{formatMoney(car.pricePerDay)}</span>
                    </div>

                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-muted">Pickup date</label>
                        <input
                          type="date"
                          className="form-control"
                          min={todayISO()}
                          value={dates.pickup}
                          onChange={(e) => setDates({ ...dates, pickup: e.target.value })}
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-muted">Return date</label>
                        <input
                          type="date"
                          className="form-control"
                          min={dates.pickup || todayISO()}
                          value={dates.return}
                          onChange={(e) => setDates({ ...dates, return: e.target.value })}
                        />
                      </div>
                    </div>

                    {inMaintenance && (
                      <div className="alert alert-warning small mb-2"><i className="bi bi-tools me-1" /> This car is under maintenance and cannot be booked right now.</div>
                    )}
                    {car.status !== 'available' && !inMaintenance && (
                      <div className="alert alert-warning small mb-2"><i className="bi bi-exclamation-circle me-1" /> This car is currently unavailable.</div>
                    )}
                    {conflict && <div className="text-danger small mb-2"><i className="bi bi-exclamation-circle me-1" />{conflict}</div>}

                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-accent btn-lg"
                        disabled={unbookable || !!conflict}
                        onClick={handleBook}
                      >
                        <i className="bi bi-calendar-check me-2" />Book Now
                      </button>
                      <button className={`btn btn-outline-de btn-lg ${wishlisted ? 'btn-danger text-white' : ''}`} onClick={handleWishlist}>
                        <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'} me-2`} />
                        {wishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card de-card mt-3">
                  <div className="card-body">
                    <h6 className="fw-bold mb-2"><i className="bi bi-shield-check me-2 text-success" />Why rent with DriveEasy?</h6>
                    <ul className="text-muted small mb-0 d-grid gap-1 ps-3">
                      <li>Free cancellation up to 24h before pickup</li>
                      <li>24×7 roadside assistance</li>
                      <li>Transparent pricing with no hidden fees</li>
                    </ul>
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