import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import RatingStars from '../../components/common/RatingStars';
import { getWishlist, removeFromWishlist } from '../../services/wishlistService';
import { getCarById } from '../../services/carService';
import { formatMoney, formatDate } from '../../utils/helpers';

export default function CustomerWishlist() {
  const user = JSON.parse(localStorage.getItem('de_current_user')) || {};
  const [version, setVersion] = useState(0);

  const remove = (carId) => {
    removeFromWishlist(user.id, carId);
    setVersion((v) => v + 1);
  };

  const cars = getWishlist(user.id)
    .map((w) => ({ ...w, car: getCarById(w.carId) }))
    .filter((w) => w.car);
  void version;

  return (
    <DashboardLayout role="customer" title="My Wishlist" subtitle="Cars you've saved for later">
      {cars.length === 0 ? (
        <div className="card de-card p-4">
          <EmptyState icon="bi-heart" title="Your wishlist is empty" message="Tap the heart on any car to save it here." action={<Link to="/cars" className="btn btn-de mt-2">Browse Cars</Link>} />
        </div>
      ) : (
        <div className="row g-4">
          {cars.map(({ car, addedAt }) => (
            <div className="col-md-6 col-xl-4" key={car.id}>
              <div className="card de-card h-100">
                {car.images?.[0] && <img src={car.images[0]} alt={car.name} className="card-img-top" style={{ height: 160, objectFit: 'cover' }} />}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="fw-bold mb-0">{car.name}</h6>
                    <span className="fw-bold text-de">{formatMoney(car.pricePerDay)}<small className="text-muted">/day</small></span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small text-muted mt-1">
                    <RatingStars value={car.rating} />
                    <span>{car.rating > 0 ? car.rating : 'New'}</span>
                  </div>
                  <p className="small text-muted mt-1 mb-0">
                    {car.fuelType} · {car.transmission} · {(car.locations || [])[0] || ''}
                  </p>
                  <span className="small text-muted">Saved {formatDate(addedAt)}</span>
                </div>
                <div className="card-footer bg-transparent d-flex gap-2">
                  <Link to={`/cars/${car.id}`} className="btn btn-outline-de btn-sm flex-grow-1">View</Link>
                  {car.status === 'available' && <Link to={`/booking/${car.id}`} className="btn btn-accent btn-sm flex-grow-1">Book Now</Link>}
                  <button className="btn btn-outline-danger btn-sm" onClick={() => remove(car.id)} aria-label="Remove"><i className="bi bi-trash" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}