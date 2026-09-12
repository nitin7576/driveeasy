import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.subject.trim()) errs.subject = 'Subject is required';
    if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 4000);
    }
  };

  return (
    <div>
      <section className="bg-white border-bottom py-4">
        <div className="container">
          <h1 className="page-title fs-2 mb-0">Contact Us</h1>
          <p className="text-muted mb-0">We'd love to hear from you — reach out any time.</p>
        </div>
      </section>
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              {[
                ['bi-telephone', 'Call us', '1800-123-4567', 'Mon–Sun, 24×7'],
                ['bi-envelope', 'Email us', 'support@driveeasy.com', 'We reply within 24 hours'],
                ['bi-geo-alt', 'Visit us', 'Bandra Kurla Complex', 'Mumbai, Maharashtra 400051'],
              ].map(([icon, title, value, sub]) => (
                <div className="d-flex gap-3 mb-4" key={title}>
                  <span className="feature-icon"><i className={`bi ${icon}`} /></span>
                  <div>
                    <h6 className="fw-bold mb-1">{title}</h6>
                    <p className="mb-0">{value}</p>
                    <small className="text-muted">{sub}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-lg-8">
              <div className="card de-card">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Send a message</h5>
                  {sent && (
                    <div className="alert alert-success py-2"><i className="bi bi-check-circle me-1" />Message sent successfully. We'll get back to you soon!</div>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Name</label>
                        <input className="form-control" name="name" value={form.name} onChange={update} />
                        {errors.name && <small className="text-danger">{errors.name}</small>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Email</label>
                        <input type="email" className="form-control" name="email" value={form.email} onChange={update} />
                        {errors.email && <small className="text-danger">{errors.email}</small>}
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Subject</label>
                        <input className="form-control" name="subject" value={form.subject} onChange={update} />
                        {errors.subject && <small className="text-danger">{errors.subject}</small>}
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Message</label>
                        <textarea className="form-control" rows={5} name="message" value={form.message} onChange={update} />
                        {errors.message && <small className="text-danger">{errors.message}</small>}
                      </div>
                      <div className="col-12">
                        <button className="btn btn-de px-5"><i className="bi bi-send me-2" />Send Message</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}