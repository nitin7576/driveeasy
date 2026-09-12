import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { getBookings } from '../../services/bookingService';
import { getCarById } from '../../services/carService';
import { getInspections, saveInspection } from '../../services/inspectionService';
import { formatDateTime } from '../../utils/helpers';

const emptyForm = {
  bookingId: '',
  type: 'pickup',
  exterior: 'Good',
  interior: 'Good',
  fuel: 100,
  mileage: 0,
  damage: '',
  notes: '',
};

export default function StaffInspection() {
  const [records, setRecords] = useState(() => getInspections() || []);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const bookings = getBookings();

  const inspectionBookings = bookings.filter((b) =>
    ['confirmed', 'active'].includes(b.status)
  );

  const refresh = () => setRecords(getInspections() || []);

  const sorted = [...records].sort(
    (a, b) => new Date(b.recordedAt || 0).getTime() - new Date(a.recordedAt || 0).getTime()
  );

  function openAdd() {
    setForm({ ...emptyForm, bookingId: inspectionBookings[0]?.id || '' });
    setShowModal(true);
  }

  function handleField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSave() {
    saveInspection({
      bookingId: form.bookingId,
      type: form.type,
      exterior: form.exterior,
      interior: form.interior,
      fuel: Number(form.fuel) || 0,
      mileage: Number(form.mileage) || 0,
      damage: form.damage || '',
      notes: form.notes || '',
    });
    setShowModal(false);
    refresh();
  }

  return (
    <DashboardLayout
      role="staff"
      title="Inspections"
      subtitle="All recorded pickup and return condition reports"
      action={
        <button className="btn btn-de" onClick={openAdd}>
          <i className="bi bi-plus-lg me-2" />Record Inspection
        </button>
      }
    >
      <div className="card de-card">
        {sorted.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="bi-clipboard-check"
              title="No inspections recorded"
              message="Record your first pickup or return condition check to build an inspection history."
              action={
                <button className="btn btn-de btn-sm mt-2" onClick={openAdd}>
                  <i className="bi bi-plus-lg me-1" />Record Inspection
                </button>
              }
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-de mb-0 align-middle">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Type</th>
                  <th>Exterior</th>
                  <th>Interior</th>
                  <th>Fuel</th>
                  <th>Mileage</th>
                  <th>Notes</th>
                  <th>Recorded</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => {
                  const booking = bookings.find((b) => b.id === r.bookingId);
                  const car = getCarById(booking?.carId || r.carId);
                  return (
                    <tr key={`${r.bookingId}-${r.type}`}>
                      <td>
                        <span className="fw-semibold small">{r.bookingId}</span>
                        <div className="text-muted small">{car?.name || '—'}</div>
                      </td>
                      <td><StatusBadge status={r.type} /></td>
                      <td>{r.exterior || '—'}</td>
                      <td>{r.interior || '—'}</td>
                      <td>{r.fuel != null ? `${r.fuel}%` : '—'}</td>
                      <td>{r.mileage != null ? `${r.mileage} km` : '—'}</td>
                      <td>
                        {r.notes
                          ? r.notes.length > 60
                            ? `${r.notes.slice(0, 60)}…`
                            : r.notes
                          : '—'}
                      </td>
                      <td>{formatDateTime(r.recordedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        title="Record Inspection"
        onClose={() => setShowModal(false)}
        onConfirm={handleSave}
        confirmText="Save Inspection"
        size="modal-lg"
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small text-muted">Booking</label>
            <select className="form-select" name="bookingId" value={form.bookingId} onChange={handleField}>
              <option value="">Select booking</option>
              {inspectionBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id} — {getCarById(b.carId)?.name || 'car'} ({formatDateShort(b.pickupDate)})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Type</label>
            <select className="form-select" name="type" value={form.type} onChange={handleField}>
              <option value="pickup">pickup</option>
              <option value="return">return</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Exterior condition</label>
            <select className="form-select" name="exterior" value={form.exterior} onChange={handleField}>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Interior condition</label>
            <select className="form-select" name="interior" value={form.interior} onChange={handleField}>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Fuel level (%)</label>
            <input className="form-control" type="number" name="fuel" min="1" max="100" value={form.fuel} onChange={handleField} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Mileage (km)</label>
            <input className="form-control" type="number" name="mileage" min="0" value={form.mileage} onChange={handleField} />
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Damage</label>
            <textarea className="form-control" rows={2} name="damage" value={form.damage} onChange={handleField} placeholder="Any scratches, dents, or damage found…" />
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Notes</label>
            <textarea className="form-control" rows={2} name="notes" value={form.notes} onChange={handleField} placeholder="Additional notes…" />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

function formatDateShort(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}