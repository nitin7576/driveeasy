import { Link, useNavigate } from 'react-router-dom';
import CarCard from '../../components/cars/CarCard';
import SearchBar from '../../components/cars/SearchBar';
import RatingStars from '../../components/common/RatingStars';
import { getCars } from '../../services/carService';
import { getApprovedReviews } from '../../services/reviewService';
import { bannerCar } from '../../utils/images';

const faqs = [
  { q: 'How do I book a car?', a: 'Select your car, choose pickup and return dates, review the summary, apply a coupon, and complete the demo payment. Your booking is confirmed instantly.' },
  { q: 'What do I need at pickup?', a: 'A valid driving license, an ID proof, and the payment confirmation. Staff will verify your documents and record the vehicle condition.' },
  { q: 'Can I cancel my booking?', a: 'Yes. Cancellations are free up to 24 hours before pickup. Refunds are processed back to your original payment method.' },
  { q: 'Are my personal details safe?', a: 'Yes. DriveEasy follows strict data privacy practices and never shares your details with third parties.' },
  { q: 'Can I extend my rental?', a: 'You can request an extension through the DriveEasy app up to 24 hours before the return time, subject to availability.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const cars = getCars();
  const reviews = getApprovedReviews().slice(0, 5);
  const featured = cars.filter((c) => c.status === 'available').slice(0, 8);
  const popular = cars.filter((c) => c.status === 'available').slice(0, 4);
  const heroCar = bannerCar();

  const handleSearch = (filters) => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.pickup) params.set('location', filters.pickup);
    if (filters.pickupDate) params.set('pickupDate', filters.pickupDate);
    if (filters.returnDate) params.set('returnDate', filters.returnDate);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <span className="hero-badge">
                <i className="bi bi-award" /> India's Trusted Self-Drive Platform
              </span>
              <h1 className="mt-3">
                Rent Your Perfect Car,<br />
                <span style={{ color: '#ffb469' }}>Anytime, Anywhere</span>
              </h1>
              <p className="lead text-white-50 mt-3">
                Affordable, reliable and hassle-free car rentals for every journey.
              </p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link to="/cars" className="btn btn-accent btn-lg px-4">
                  <i className="bi bi-car-front-fill me-2" />Explore Cars
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg px-4">
                  Create Free Account
                </Link>
              </div>
              <div className="d-flex gap-4 mt-4 pt-2 flex-wrap">
                <div>
                  <h3 className="fw-bold mb-0">250+</h3>
                  <span className="text-white-50 small">Cars in fleet</span>
                </div>
                <div>
                  <h3 className="fw-bold mb-0">1.2L+</h3>
                  <span className="text-white-50 small">Happy customers</span>
                </div>
                <div>
                  <h3 className="fw-bold mb-0">6</h3>
                  <span className="text-white-50 small">Major cities</span>
                </div>
                <div>
                  <h3 className="fw-bold mb-0">4.6</h3>
                  <span className="text-white-50 small">Avg. rating</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block text-center">
              <img src={heroCar} alt="DriveEasy car" className="img-fluid" style={{ maxWidth: 520, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="container">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Stats strip */}
      <section className="stat-strip text-white py-4 mt-5">
        <div className="container">
          <div className="row text-center g-3">
            {[
              ['bi-shield-check', 'Verified Cars', 'Every car inspected before every trip'],
              ['bi-currency-rupee', 'No Hidden Fees', 'Transparent pricing, always'],
              ['bi-clock-history', '24/7 Support', 'Help whenever you need it'],
              ['bi-arrow-repeat', 'Free Cancellation', 'Up to 24 hours before pickup'],
            ].map(([icon, title, sub]) => (
              <div className="col-6 col-lg-3 stat" key={title}>
                <i className={`bi ${icon} fs-3`} />
                <h6 className="mt-2 mb-0 fw-bold">{title}</h6>
                <span className="small">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured cars */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <span className="sec-label">Featured Cars</span>
            <h2 className="fw-bold mt-1">Popular This Week</h2>
            <p className="text-muted">Most booked cars by our customers</p>
          </div>
          <div className="row g-4">
            {featured.map((car) => (
              <div className="col-12 col-sm-6 col-lg-3" key={car.id}>
                <CarCard car={car} />
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/cars" className="btn btn-de px-5">View All Cars</Link>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <span className="sec-label">Why DriveEasy</span>
              <h2 className="fw-bold mt-1 mb-3">Why Choose Us?</h2>
              <p className="text-muted">
                We make renting a car refreshingly simple — transparent pricing, well-maintained
                vehicles, and a booking flow you can finish in under two minutes.
              </p>
              <ul className="list-unstyled d-grid gap-3 mt-4">
                {[
                  ['bi-tag-fill', 'Best Price Guarantee', 'Competitive daily rates with no hidden charges'],
                  ['bi-car-front-fill', 'Well-Maintained Fleet', 'Every car serviced, sanitized and inspected'],
                  ['bi-headset', 'Dedicated Support', 'Reach us any time — in-app, phone, or chat'],
                  ['bi-geo-alt-fill', 'Pickup & Drop Anywhere', 'Doorstep delivery and drop available'],
                ].map(([icon, title, sub]) => (
                  <li className="d-flex gap-3" key={title}>
                    <span className="feature-icon"><i className={`bi ${icon}`} /></span>
                    <div>
                      <h6 className="fw-bold mb-1">{title}</h6>
                      <p className="text-muted small mb-0">{sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-lg-7">
              <div className="row g-3">
                <div className="col-6">
                  <div className="card de-card de-card-hover h-100">
                    <div className="card-body">
                      <span className="feature-icon accent mb-2"><i className="bi bi-lightning-charge-fill" /></span>
                      <h5 className="fw-bold">Instant Confirmation</h5>
                      <p className="text-muted small mb-0">Bookings confirmed in seconds after payment.</p>
                    </div>
                  </div>
                </div>
                <div className="col-6 mt-4">
                  <div className="card de-card de-card-hover h-100">
                    <div className="card-body">
                      <span className="feature-icon green mb-2"><i className="bi bi-recycle" /></span>
                      <h5 className="fw-bold">Eco-Friendly Options</h5>
                      <p className="text-muted small mb-0">CNG and fuel-efficient cars in our fleet.</p>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card de-card de-card-hover h-100">
                    <div className="card-body">
                      <span className="feature-icon mb-2"><i className="bi bi-map-fill" /></span>
                      <h5 className="fw-bold">Never Get Lost</h5>
                      <p className="text-muted small mb-0">Cars fitted with GPS and modern infotainment.</p>
                    </div>
                  </div>
                </div>
                <div className="col-6 mt-4">
                  <div className="card de-card de-card-hover h-100">
                    <div className="card-body">
                      <span className="feature-icon accent mb-2"><i className="bi bi-stopwatch-fill" /></span>
                      <h5 className="fw-bold">Fast Check-in</h5>
                      <p className="text-muted small mb-0">Quick document verification at pickup.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <span className="sec-label">How It Works</span>
            <h2 className="fw-bold mt-1">Three Simple Steps</h2>
          </div>
          <div className="row g-4 justify-content-center">
            {[
              ['1', 'bi-search', 'Choose Your Car', 'Browse our fleet and pick the car that fits your trip.'],
              ['2', 'bi-calendar-check', 'Book & Pay', 'Pick dates, apply a coupon and complete demo checkout.'],
              ['3', 'bi-flag', 'Drive & Enjoy', 'Pick up the keys, hit the road, and return when done.'],
            ].map(([num, icon, title, sub]) => (
              <div className="col-md-4" key={num}>
                <div className="text-center px-3">
                  <div className="position-relative d-inline-block">
                    <span className="feature-icon mb-0" style={{ width: 72, height: 72, fontSize: '1.8rem' }}><i className={`bi ${icon}`} /></span>
                    <span className="position-absolute badge bg-danger rounded-circle" style={{ top: -4, right: -12 }}>{num}</span>
                  </div>
                  <h5 className="fw-bold mt-3">{title}</h5>
                  <p className="text-muted small">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular categories */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-4">
            <span className="sec-label">Browse By Category</span>
            <h2 className="fw-bold mt-1">Popular Categories</h2>
          </div>
          <div className="row g-4">
            {[
              ['Hatchback', 'bi-car-front', '850+'],
              ['Sedan', 'bi-car-front', '1,200+'],
              ['SUV', 'bi-car-front-fill', '1,400+'],
              ['MUV', 'bi-truck-front', '1,100+'],
            ].map(([name, icon, price]) => (
              <div className="col-6 col-lg-3" key={name}>
                <Link to={`/cars?type=${encodeURIComponent(name)}`} className="text-decoration-none">
                  <div className="card de-card de-card-hover text-center h-100">
                    <div className="card-body">
                      <span className="feature-icon mb-3"><i className={`bi ${icon}`} /></span>
                      <h6 className="fw-bold mb-1">{name}</h6>
                      <span className="text-muted small">{price}/day onwards</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional banner */}
      <section className="py-5">
        <div className="container">
          <div className="promo-banner p-4 p-md-5">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-2">Save up to 20% with DriveEasy</h2>
                <p className="mb-0">
                  Use code <strong>FESTIVE15</strong> at checkout and enjoy flat 15% off on trips
                  above ₹7,000. Limited time only!
                </p>
              </div>
              <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                <Link to="/cars" className="btn btn-dark btn-lg px-4">Book a Car</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer reviews */}
      {reviews.length > 0 && (
        <section className="py-5 bg-white">
          <div className="container">
            <div className="text-center mb-4">
              <span className="sec-label">Testimonials</span>
              <h2 className="fw-bold mt-1">What Our Customers Say</h2>
            </div>
            <div className="row g-4">
              {reviews.map((r) => (
                <div className="col-md-6 col-lg-4" key={r.id}>
                  <div className="card de-card h-100">
                    <div className="card-body">
                      <RatingStars value={r.rating} />
                      <p className="mt-3 mb-3 small">"{r.comment}"</p>
                      <div className="d-flex align-items-center gap-2">
                        <span className="avatar">{r.userName.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
                        <div>
                          <strong className="d-block small">{r.userName}</strong>
                          <span className="text-muted small">Verified renter</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular cars */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <span className="sec-label">Most Booked</span>
            <h2 className="fw-bold mt-1">Best Price Guarantee</h2>
          </div>
          <div className="row g-4">
            {popular.map((car) => (
              <div className="col-12 col-sm-6 col-lg-3" key={car.id}>
                <CarCard car={car} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center mb-4">
                <span className="sec-label">FAQ</span>
                <h2 className="fw-bold mt-1">Frequently Asked Questions</h2>
              </div>
              <div className="accordion faq-item" id="faqAccordion">
                {faqs.map((f, i) => (
                  <div className="accordion-item" key={f.q}>
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${i > 0 ? 'collapsed' : ''}`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#faq${i}`}
                        aria-expanded={i === 0}
                      >
                        {f.q}
                      </button>
                    </h2>
                    <div id={`faq${i}`} className={`accordion-collapse collapse ${i === 0 ? 'show' : ''}`} data-bs-parent="#faqAccordion">
                      <div className="accordion-body text-muted">{f.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5">
        <div className="container">
          <div className="p-4 p-md-5 rounded-4 text-center text-white" style={{ background: 'linear-gradient(135deg, var(--de-primary-dark), var(--de-primary))' }}>
            <h2 className="fw-bold mb-2">Ready to hit the road?</h2>
            <p className="mb-4">Join thousands of happy renters across India.</p>
            <Link to="/register" className="btn btn-accent btn-lg px-5">Get Started Free</Link>
          </div>
        </div>
      </section>
    </div>
  );
}