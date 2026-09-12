import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-de pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h5 className="fw-bold text-white mb-3">
              <i className="bi bi-car-front-fill me-2" />
              DriveEasy
            </h5>
            <p className="small mb-2">
              Affordable, reliable and hassle-free car rentals for every journey.
              Self-drive cars across India at unbeatable prices.
            </p>
            <div className="d-flex gap-3 fs-5">
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><i className="bi bi-facebook" /></a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="bi bi-instagram" /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><i className="bi bi-twitter-x" /></a>
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><i className="bi bi-youtube" /></a>
            </div>
          </div>
          <div className="col-6 col-lg-2">
            <h6 className="fw-bold text-white mb-3">Company</h6>
            <ul className="list-unstyled small d-grid gap-2">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/cars">Our Fleet</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><button type="button" className="footer-link">Careers</button></li>
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h6 className="fw-bold text-white mb-3">Top Brands</h6>
            <ul className="list-unstyled small d-grid gap-2">
              <li><Link to="/cars">Maruti Swift &amp; Baleno</Link></li>
              <li><Link to="/cars">Hyundai Creta &amp; i20</Link></li>
              <li><Link to="/cars">Tata Nexon &amp; Harrier</Link></li>
              <li><Link to="/cars">Toyota Innova &amp; Fortuner</Link></li>
            </ul>
          </div>
          <div className="col-lg-3">
            <h6 className="fw-bold text-white mb-3">Support</h6>
            <ul className="list-unstyled small d-grid gap-2">
              <li><i className="bi bi-telephone me-2" />1800-123-4567</li>
              <li><i className="bi bi-envelope me-2" />support@driveeasy.com</li>
              <li><i className="bi bi-geo-alt me-2" />Bandra Kurla Complex, Mumbai</li>
            </ul>
          </div>
        </div>
        <hr className="border-secondary opacity-25 my-4" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small">
          <span>© {new Date().getFullYear()} DriveEasy. All rights reserved.</span>
          <span className="d-flex gap-3">
            <button type="button" className="footer-link">Privacy Policy</button>
            <button type="button" className="footer-link">Terms of Service</button>
          </span>
        </div>
      </div>
    </footer>
  );
}