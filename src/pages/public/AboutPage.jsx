import { Link } from 'react-router-dom';
import { bannerCar } from '../../utils/images';

const team = [
  ['RS', 'Rahul Sharma', 'Founder & CEO'],
  ['AP', 'Ananya Patel', 'Head of Operations'],
  ['VS', 'Vikram Singh', 'Fleet Manager'],
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-white border-bottom py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <span className="sec-label">About DriveEasy</span>
              <h1 className="fw-bold mt-2">Driven by making travel effortless</h1>
              <p className="lead text-muted">
                DriveEasy is a modern self-drive car rental platform built to give you the freedom
                to go anywhere, anytime — without the hassle of owning a car.
              </p>
              <p className="text-muted">
                Founded in 2020, we've grown from a single car to a network of 250+ well-maintained
                vehicles across six Indian cities. Every car is serviced, sanitized and inspected
                before each trip, and every booking is backed by transparent pricing and 24×7 support.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/cars" className="btn btn-de px-4">Explore Our Fleet</Link>
                <Link to="/contact" className="btn btn-outline-de px-4">Contact Us</Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <img src={bannerCar('#e8efff', '#c9dcff')} alt="About DriveEasy" className="img-fluid rounded-4 shadow" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4 text-center">
            {[
              ['250+', 'Cars in our fleet'],
              ['1.2L+', 'Trips completed'],
              ['6', 'Cities served'],
              ['24/7', 'Support available'],
            ].map(([n, l]) => (
              <div className="col-6 col-lg-3" key={l}>
                <div className="card de-card h-100">
                  <div className="card-body">
                    <h2 className="fw-bold text-de mb-1">{n}</h2>
                    <p className="text-muted mb-0">{l}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-4">
            <span className="sec-label">Our Values</span>
            <h2 className="fw-bold mt-1">What drives us</h2>
          </div>
          <div className="row g-4">
            {[
              ['bi-shield-check', 'Safety First', 'Every vehicle passes a 50-point inspection before each trip.'],
              ['bi-hand-thumbs-up', 'Transparency', 'No hidden charges, no fine print — the price you see is the price you pay.'],
              ['bi-lightning', 'Convenience', 'Book in minutes, pickup quickly, and get support whenever you need.'],
              ['bi-globe2', 'Sustainability', 'Growing our fleet of fuel-efficient and electric vehicles.'],
            ].map(([icon, title, sub]) => (
              <div className="col-md-6 col-lg-3" key={title}>
                <div className="card de-card de-card-hover h-100">
                  <div className="card-body text-center">
                    <span className="feature-icon mb-3"><i className={`bi ${icon}`} /></span>
                    <h5 className="fw-bold">{title}</h5>
                    <p className="text-muted small mb-0">{sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <span className="sec-label">Leadership</span>
            <h2 className="fw-bold mt-1">Meet the team</h2>
          </div>
          <div className="row justify-content-center g-4">
            {team.map(([ini, name, role]) => (
              <div className="col-6 col-lg-3" key={name}>
                <div className="card de-card text-center h-100">
                  <div className="card-body">
                    <span className="avatar lg mb-3">{ini}</span>
                    <h6 className="fw-bold mb-0">{name}</h6>
                    <span className="text-muted small">{role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}