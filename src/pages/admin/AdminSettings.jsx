import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const SETTINGS_KEY = 'de_settings';

const defaults = {
  siteName: 'DriveEasy',
  currency: 'INR',
  insurancePercent: 10,
  taxPercent: 8,
  maxCouponDiscount: 5000,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {
    // ignore malformed settings
  }
  return defaults;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);

  function handleField(e) {
    const { name, value } = e.target;
    setSettings((s) => ({ ...s, [name]: value }));
    setSaved(false);
  }

  function handleSave(e) {
    e.preventDefault();
    const next = {
      ...settings,
      insurancePercent: Math.min(25, Math.max(0, Number(settings.insurancePercent) || 0)),
      taxPercent: Math.min(30, Math.max(0, Number(settings.taxPercent) || 0)),
      maxCouponDiscount: Number(settings.maxCouponDiscount) || 0,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    setSettings(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setSettings(defaults);
    setSaved(false);
  }

  return (
    <DashboardLayout
      role="admin"
      title="Settings"
      subtitle="Configure site-wide preferences"
    >
      <div className="row g-4">
        <div className="col-lg-8">
          <form onSubmit={handleSave}>
            <div className="card de-card">
              <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0"><i className="bi bi-gear me-2" />Site Settings</h6>
                {saved && (
                  <span className="badge bg-success-subtle text-success-emphasis">
                    <i className="bi bi-check-circle me-1" />Saved!
                  </span>
                )}
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label small text-muted" htmlFor="siteName">Site Name</label>
                    <input
                      id="siteName"
                      className="form-control"
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleField}
                      placeholder="DriveEasy"
                    />
                    <div className="form-text">This name is used across the admin UI.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-muted" htmlFor="currency">Currency</label>
                    <input
                      id="currency"
                      className="form-control"
                      name="currency"
                      value={settings.currency}
                      readOnly
                      disabled
                    />
                    <div className="form-text">Currency is fixed to Indian Rupees for now.</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted" htmlFor="insurancePercent">Insurance %</label>
                    <input
                      id="insurancePercent"
                      className="form-control"
                      type="number"
                      name="insurancePercent"
                      value={settings.insurancePercent}
                      onChange={handleField}
                      min="0"
                      max="25"
                    />
                    <div className="form-text">Between 0 and 25.</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted" htmlFor="taxPercent">Tax %</label>
                    <input
                      id="taxPercent"
                      className="form-control"
                      type="number"
                      name="taxPercent"
                      value={settings.taxPercent}
                      onChange={handleField}
                      min="0"
                      max="30"
                    />
                    <div className="form-text">Between 0 and 30.</div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small text-muted" htmlFor="maxCouponDiscount">Max Coupon Discount (₹)</label>
                    <input
                      id="maxCouponDiscount"
                      className="form-control"
                      type="number"
                      name="maxCouponDiscount"
                      value={settings.maxCouponDiscount}
                      onChange={handleField}
                      min="0"
                    />
                    <div className="form-text">Maximum discount a single coupon can offer.</div>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-transparent d-flex justify-content-between align-items-center">
                <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                  Restore Defaults
                </button>
                <button type="submit" className="btn btn-de">
                  <i className="bi bi-check2-circle me-2" />Save Settings
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="col-lg-4">
          <div className="card de-card">
            <div className="card-header bg-transparent"><h6 className="fw-bold mb-0"><i className="bi bi-info-circle me-2" />About this demo</h6></div>
            <div className="card-body">
              <p className="small text-muted mb-3">
                This settings page is a demo. Values are saved to your browser's localStorage under <code>de_settings</code> and restored on your next visit.
              </p>
              <p className="small text-muted mb-0">
                Pricing shown elsewhere in the app is baked into the demo data, so changing these numbers here won't change live prices — but the UI is production-ready.
              </p>
            </div>
          </div>
          <div className="card de-card mt-4">
            <div className="card-header bg-transparent"><h6 className="fw-bold mb-0"><i className="bi bi-sliders me-2" />Current Values</h6></div>
            <div className="card-body">
              <div className="d-flex justify-content-between small py-1 border-bottom"><span className="text-muted">Site Name</span><strong>{settings.siteName}</strong></div>
              <div className="d-flex justify-content-between small py-1 border-bottom"><span className="text-muted">Currency</span><strong>{settings.currency}</strong></div>
              <div className="d-flex justify-content-between small py-1 border-bottom"><span className="text-muted">Insurance</span><strong>{settings.insurancePercent}%</strong></div>
              <div className="d-flex justify-content-between small py-1 border-bottom"><span className="text-muted">Tax</span><strong>{settings.taxPercent}%</strong></div>
              <div className="d-flex justify-content-between small py-1"><span className="text-muted">Max Coupon Discount</span><strong>₹{settings.maxCouponDiscount}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}