import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatMoney } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { isInWishlist, toggleWishlist } from '../../services/wishlistService';
import { useState } from 'react';

export default function CarCard({ car }) {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(() => (user ? isInWishlist(user.id, car.id) : false));
  const img = car.images?.[0];

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { window.location.href = '/login'; return; }
    if (user.role !== 'customer') return;
    setWishlisted(toggleWishlist(user.id, car.id));
  };

  return (
    <div className="card de-card car-card h-100">
      <div className="car-img-wrap">
        {img ? (
          <img src={img} className="car-img card-img-top" alt={`${car.brand || car.name}`} />
        ) : (
          <div className="car-img d-flex align-items-center justify-content-center text-muted">No Image</div>
        )}
        <span className="price-tag">{formatMoney(car.pricePerDay)}<small>/day</small></span>
        <button
          className={`btn btn-sm position-absolute ${wishlisted ? 'btn-danger' : 'btn-outline-white'}`}
          style={{ top: 10, left: 10, borderRadius: 100 }}
          onClick={handleWishlist}
        >
          <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`} />
        </button>
        {car.rating > 0 && (
          <span className="rating-pill">
            <i className="bi bi-star-fill" style={{ fontSize: '0.7rem' }} />
            {car.rating}
          </span>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <div>
            <h6 className="fw-bold mb-0">{car.brand || car.name}</h6>
            <small className="text-muted">{car.model || car.type} · {car.year || 2024}</small>
          </div>
          <StatusBadge status={car.status} />
        </div>
        <div className="car-specs mt-2">
          <span><i className="bi bi-fuel-pump" /> {car.fuelType}</span>
          <span><i className="bi bi-gear-wide-connected" /> {car.transmission}</span>
          <span><i className="bi bi-people" /> {car.seats} seats</span>
          <span><i className="bi bi-geo-alt" /> {(car.locations || [])[0] || '—'}</span>
        </div>
        <p className="small text-muted mb-2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {car.description}
        </p>
        <div className="mt-auto d-flex gap-2">
          <Link to={`/cars/${car.id}`} className="btn btn-outline-de btn-sm flex-grow-1">
            View Details
          </Link>
          {car.status === 'available' && (
            <Link to={`/booking/${car.id}`} className="btn btn-accent btn-sm flex-grow-1">
              Book Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}