import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
    city: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match';
    if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit phone number';
    if (!form.city.trim()) errs.city = 'City is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const res = registerUser({ ...form, address: '', dob: '', state: '', pincode: '' });
    if (res.error) {
      setApiError(res.error);
      return;
    }
    login(res.user);
    navigate('/customer/dashboard', { replace: true });
  };

  return (
    <div className="auth-wrap">
      <div className="card de-card auth-card">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="logo-mark mb-3"><i className="bi bi-person-plus-fill" /></span>
            <h3 className="fw-bold">Create Account</h3>
            <p className="text-muted small">Join DriveEasy in less than a minute</p>
          </div>

          {apiError && <div className="alert alert-danger py-2 small"><i className="bi bi-exclamation-circle me-1" />{apiError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input className="form-control" name="name" value={form.name} onChange={update} />
              {errors.name && <small className="text-danger">{errors.name}</small>}
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input type="email" className="form-control" name="email" value={form.email} onChange={update} />
              {errors.email && <small className="text-danger">{errors.email}</small>}
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label fw-semibold">Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={update} maxLength={10} />
                {errors.phone && <small className="text-danger">{errors.phone}</small>}
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold">City</label>
                <input className="form-control" name="city" value={form.city} onChange={update} />
                {errors.city && <small className="text-danger">{errors.city}</small>}
              </div>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label fw-semibold">Password</label>
                <input type="password" className="form-control" name="password" value={form.password} onChange={update} />
                {errors.password && <small className="text-danger">{errors.password}</small>}
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold">Confirm Password</label>
                <input type="password" className="form-control" name="confirm" value={form.confirm} onChange={update} />
                {errors.confirm && <small className="text-danger">{errors.confirm}</small>}
              </div>
            </div>
            <button className="btn btn-de w-100 py-2">Create Account</button>
          </form>

          <p className="text-center small mt-3 mb-0">
            Already have an account? <Link to="/login" className="text-de fw-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}