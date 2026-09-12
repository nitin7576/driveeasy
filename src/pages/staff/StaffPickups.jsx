import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { getBookings, updateBookingStatus } from '../../services/bookingService';
import { getCarById, setCarStatus } from '../../services/carService';
import { getUserById } from '../../services/authService';
import { getInspection, saveInspection } from '../../services/inspectionService';
import { addNotification } from '../../services/notificationService';
import { formatDate, todayISO } from '../../utils/helpers';

const emptyVerifyForm = { status: 'verified', notes: '' };
const emptyInspectionForm = {
  exterior: 'Good',
  interior: 'Good',
  fuel: 100,
  mileage: 0,
  damage: '',
  notes: '',
};

export default function StaffPickups() {
  const [bookings, setBookings] = useState(getBookings());
  const [verifications, setVerifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('de_verifications')) || {};
    } catch {
      return {};
    }
  });
  const [verifyBooking, setVerifyBooking] = useState(null);
  const [verifyForm, setVerifyForm] = useState(emptyVerifyForm);
  const [confirmBooking, setConfirmBooking] = useState(null);
  const [inspectionBooking, setInspectionBooking] = useState(null);
  const [inspectionForm, setInspectionForm] = useState(emptyInspectionForm);

  const today = todayISO();
  const refresh = () => setBookings(getBookings());

  const pickups = bookings
    .filter((b) => b.status === 'confirmed' && b.pickupDate >= today)
    .sort(
      (a, b) =>
        new Date(a.pickupDate) - new Date(b.pickupDate) ||
        (a.pickupTime || '99:99').localeCompare(b.pickupTime || '99:99')
    );

  function openVerify(b) {
    const existing = verifications[b.id];
    setVerifyBooking(b);
    setVerifyForm(
      existing ? { status: existing.status || 'verified', notes: existing.notes || '' } : emptyVerifyForm
    );
  }

  function saveVerify() {
    if (!verifyBooking) return;
    const next = {
      ...verifications,
      [verifyBooking.id]: {
        status: verifyForm.status,
        notes: verifyForm.notes || '',
        date: new Date().toISOString().split('T')[0],
      },
    };
    localStorage.setItem('de_verifications', JSON.stringify(next));
    setVerifications(next);
    setVerifyBooking(null);
  }

  function handleConfirmPickup() {
    const b = confirmBooking;
    if (!b) return;
    updateBookingStatus(b.id, 'active');
    setCarStatus(b.carId, 'rented');
    addNotification({
      userId: b.userId,
      message: `Your pickup for booking ${b.id} (${getCarById(b.carId)?.name || 'car'}) has been confirmed. Drive safe!`,
      type: 'info',
    });
    setConfirmBooking(null);
    refresh();
  }

  function openInspection(b) {
    let existing = null;
    try {
      existing = getInspection(b.id, 'pickup');
    } catch {
      existing = null;
    }
    setInspectionBooking(b);
    setInspectionForm(
      existing
        ? {
            exterior: existing.exterior || 'Good',
            interior: existing.interior || 'Good',
            fuel: Number(existing.fuel) || 100,
            mileage: Number(existing.mileage) || 0,
            damage: existing.damage || '',
            notes: existing.notes || '',
          }
        : emptyInspectionForm
    );
  }

  function handleInspectionField(e) {
    const { name, value } = e.target;
    setInspectionForm((f) => ({ ...f, [name]: value }));
  }

  function saveInspectionRecord() {
    if (!inspectionBooking) return;
    saveInspection({
      bookingId: inspectionBooking.id,
      type: 'pickup',
      exterior: inspectionForm.exterior,
      interior: inspectionForm.interior,
      fuel: Number(inspectionForm.fuel) || 0,
      mileage: Number(inspectionForm.mileage) || 0,
      damage: inspectionForm.damage || '',
      notes: inspectionForm.notes || '',
    });
    setInspectionBooking(null);
  }

  return (
    <DashboardLayout
      role="staff"
      title="Pickups"
      subtitle="Verify documents and hand over vehicles for upcoming rentals"
    >
      <div className="card de-card">
        {pickups.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="bi-arrow-up-circle"
              title="No pickups to process"
              message="Confirmed bookings with a pickup date today or later will appear here."
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-de mb-0 align-middle">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Pickup date / time</th>
                  <th>Verification</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pickups.map((b) => {
                  const car = getCarById(b.carId);
                  const customer = getUserById(b.userId);
                  return (
                    <tr key={b.id}>
                      <td>
                        <span className="fw-semibold small">{b.id}</span>
                        <div className="text-muted small">{formatDate(b.pickupDate)}</div>
                      </td>
                      <td>{customer?.name || '—'}</td>
                      <td>
                        {car?.name || '—'}
                        <div className="text-muted small">{car?.type || ''}</div>
                      </td>
                      <td>
                        {formatDate(b.pickupDate)}
                        <div className="text-muted small">{b.pickupTime || '—'}</div>
                      </td>
                      <td>
                        <StatusBadge status={verifications[b.id]?.status || 'pending'} />
                      </td>
                      <td className="text-end">
                        <div className="d-flex flex-wrap gap-1 justify-content-end">
                          <button className="btn btn-outline-de btn-sm" title="Verify Documents" onClick={() => openVerify(b)}>
                            <i className="bi bi-shield-check me-1" />Verify
                          </button>
                          <button className="btn btn-outline-success btn-sm" title="Confirm Pickup" onClick={() => setConfirmBooking(b)}>
                            <i className="bi bi-check2-circle me-1" />Pickup
                          </button>
                          <button className="btn btn-outline-info btn-sm" title="Record Condition" onClick={() => openInspection(b)}>
                            <i className="bi bi-clipboard-check me-1" />Condition
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={Boolean(verifyBooking)}
        title={`Verify Documents — ${verifyBooking?.id || ''}`}
        onClose={() => setVerifyBooking(null)}
        onConfirm={saveVerify}
        confirmText="Save Verification"
      >
        <div className="row g-3">
          <div className="col-12">
            <p className="small text-muted mb-3">
              Verify the customer's license and booking documents for{' '}
              <strong>{verifyBooking ? getUserById(verifyBooking.userId)?.name : ''}</strong>. This is stored as a demo
              verification record per booking.
            </p>
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Verification status</label>
            <select
              className="form-select"
              name="status"
              value={verifyForm.status}
              onChange={(e) => setVerifyForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="verified">verified</option>
              <option value="failed">failed</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Notes</label>
            <textarea
              className="form-control"
              rows={3}
              name="notes"
              value={verifyForm.notes}
              onChange={(e) => setVerifyForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="License and documents verified…"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(inspectionBooking)}
        title={`Record Pickup Condition — ${inspectionBooking?.id || ''}`}
        onClose={() => setInspectionBooking(null)}
        onConfirm={saveInspectionRecord}
        confirmText="Save Inspection"
        size="modal-lg"
      >
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small text-muted">Exterior condition</label>
            <select className="form-select" name="exterior" value={inspectionForm.exterior} onChange={handleInspectionField}>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Interior condition</label>
            <select className="form-select" name="interior" value={inspectionForm.interior} onChange={handleInspectionField}>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Fuel level (%)</label>
            <input className="form-control" type="number" name="fuel" min="1" max="100" value={inspectionForm.fuel} onChange={handleInspectionField} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Mileage (km)</label>
            <input className="form-control" type="number" name="mileage" min="0" value={inspectionForm.mileage} onChange={handleInspectionField} />
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Damage</label>
            <textarea className="form-control" rows={2} name="damage" value={inspectionForm.damage} onChange={handleInspectionField} placeholder="Any scratches, dents, or issues found…" />
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Notes</label>
            <textarea className="form-control" rows={2} name="notes" value={inspectionForm.notes} onChange={handleInspectionField} placeholder="Additional notes about the vehicles handing over…" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmBooking)}
        title="Confirm Pickup"
        message={`Hand over the keys and start the rental for booking ${confirmBooking?.id || ''}? The booking will move to active status and the customer will be notified.`}
        confirmText="Confirm Pickup"
        onConfirm={handleConfirmPickup}
        onClose={() => setConfirmBooking(null)}
      />
    </DashboardLayout>
  );
}