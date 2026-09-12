import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getUserById, updateUser } from '../../services/authService';
import { KEYS, setLS } from '../../utils/storage';
import { initials } from '../../utils/helpers';

export default function CustomerProfile() {
  const { user, refresh } = useAuth();
  const full = getUserById(user.id);
  const [form, setForm] = useState({
    name: full?.name || '',
    email: full?.email || '',
    phone: full?.phone || '',
    dob: full?.dob || '',
    address: full?.address || '',
    city: full?.city || '',
    state: full?.state || '',
    pincode: full?.pincode || '',
  });
  const [license, setLicense] = useState({
    number: full?.license?.number || '',
    issueDate: full?.license?.issueDate || '',
    expiryDate: full?.license?.expiryDate || '',
  });
  const [licenseModal, setLicenseModal] = useState(false);
  const [licenseEdit, setLicenseEdit] = useState({ ...license });
  const [photo, setPhoto] = useState(() => getLSValue(KEYS.PROFILE, full?.id));
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  function getLSValue(key, fallback) {
    const raw = getProfile();
    return raw?.photo || null;
  }

  function getProfile() {
    const raw = localStorage.getItem('de_profile');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required';
    if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Valid 10-digit phone required';
    if (!form.pincode || form.pincode.length !== 6) errs.pincode = 'Valid 6-digit pincode required';
    return errs;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    updateUser(user.id, { ...form });
    if (user.email !== form.email) {
      const cur = { ...user, name: form.name, email: form.email };
      setLS('de_current_user', cur);
      refresh();
    }
    savePhoto();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const saveLicense = () => {
    if (!licenseEdit.number.trim()) { setErrors({ license: 'License number required' }); return; }
    setLicense(licenseEdit);
    updateUser(user.id, { license: licenseEdit });
    setLicenseModal(false);
  };

  const savePhoto = (dataUrl) => {
    const raw = getProfile();
    const next = { ...(raw || {}), [user.id]: dataUrl || photo };
    localStorage.setItem('de_profile', JSON.stringify(next));
  };

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result);
      savePhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    savePhoto(null);
  };

  return (
    <DashboardLayout role="customer" title="My Profile" subtitle="Manage your personal information and driving license">
      {saved && <div className="alert alert-success py-2"><i className="bi bi-check-circle me-1" />Profile updated successfully.</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card de-card">
            <div className="card-body text-center">
              <div className="avatar-upload-wrap mx-auto">
                {photo ? (
                  <img src={photo} alt="profile" className="rounded-circle object-fit-cover" style={{ width: 96, height: 96 }} />
                ) : (
                  <span className="avatar lg">{initials(form.name || 'User')}</span>
                )}
                <button className="btn btn-sm btn-light position-absolute bottom-0 end-0 border" onClick={() => document.getElementById('photoInput').click()}>
                  <i className="bi bi-camera"></i>
                </button>
                <input id="photoInput" type="file" accept="image/*" onChange={onPhoto} />
              </div>
              <h5 className="fw-bold mt-3 mb-0">{form.name}</h5>
              <span className="text-muted small">{form.email}</span>
              <div className="mt-2"><StatusBadge status="customer" /></div>
              {photo && (
                <button className="btn btn-sm btn-link text-danger mt-2" onClick={removePhoto}>Remove photo</button>
              )}
            </div>
          </div>

          <div className="card de-card mt-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-bold mb-0"><i className="bi bi-person-vcard me-2 text-de" />Driving License</h6>
                <button className="btn btn-sm btn-ghost-de" onClick={() => { setLicenseEdit({ ...license }); setLicenseModal(true); }}>
                  <i className="bi bi-pencil" />
                </button>
              </div>
              <div className="small d-grid gap-1 mb-2">
                <div className="d-flex justify-content-between"><span className="text-muted">Number</span><strong>{license.number || '—'}</strong></div>
                <div className="d-flex justify-content-between"><span className="text-muted">Issue date</span><span>{license.issueDate || '—'}</span></div>
                <div className="d-flex justify-content-between"><span className="text-muted">Expiry</span><span>{license.expiryDate || '—'}</span></div>
              </div>
              <StatusBadge status={license.number ? (license.verified === false ? 'unverified' : 'verified') : 'unverified'} />
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card de-card">
            <div className="card-header bg-transparent"><h6 className="fw-bold mb-0">Personal Information</h6></div>
            <form className="card-body p-4" onSubmit={handleSave}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold required">Full Name</label>
                  <input className="form-control" name="name" value={form.name} onChange={update} />
                  {errors.name && <small className="text-danger">{errors.name}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold required">Email</label>
                  <input type="email" className="form-control" name="email" value={form.email} onChange={update} />
                  {errors.email && <small className="text-danger">{errors.email}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold required">Phone</label>
                  <input className="form-control" name="phone" value={form.phone} onChange={update} maxLength={10} />
                  {errors.phone && <small className="text-danger">{errors.phone}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Date of Birth</label>
                  <input type="date" className="form-control" name="dob" value={form.dob} onChange={update} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Address</label>
                  <input className="form-control" name="address" value={form.address} onChange={update} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">City</label>
                  <input className="form-control" name="city" value={form.city} onChange={update} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">State</label>
                  <input className="form-control" name="state" value={form.state} onChange={update} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold required">Pincode</label>
                  <input className="form-control" name="pincode" value={form.pincode} onChange={update} maxLength={6} />
                  {errors.pincode && <small className="text-danger">{errors.pincode}</small>}
                </div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-de px-5"><i className="bi bi-check-lg me-2" />Save Changes</button>
                  <button type="button" className="btn btn-light" onClick={() => setForm({
                    name: full?.name || '', email: full?.email || '', phone: full?.phone || '', dob: full?.dob || '',
                    address: full?.address || '', city: full?.city || '', state: full?.state || '', pincode: full?.pincode || '',
                  })}>Reset</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Modal open={licenseModal} title="Edit Driving License" onClose={() => setLicenseModal(false)} onConfirm={saveLicense} confirmText="Save License">
        <div className="d-grid gap-3">
          <div>
            <label className="form-label fw-semibold required">License number</label>
            <input className="form-control" value={licenseEdit.number} onChange={(e) => setLicenseEdit({ ...licenseEdit, number: e.target.value })} />
            {errors.license && <small className="text-danger">{errors.license}</small>}
          </div>
          <div className="row g-3">
            <div className="col-6">
              <label className="form-label fw-semibold">Issue date</label>
              <input type="date" className="form-control" value={licenseEdit.issueDate} onChange={(e) => setLicenseEdit({ ...licenseEdit, issueDate: e.target.value })} />
            </div>
            <div className="col-6">
              <label className="form-label fw-semibold">Expiry date</label>
              <input type="date" className="form-control" value={licenseEdit.expiryDate} onChange={(e) => setLicenseEdit({ ...licenseEdit, expiryDate: e.target.value })} />
            </div>
          </div>
          <p className="small text-muted mb-0">License verification will be performed by staff at the time of pickup.</p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}