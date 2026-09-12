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
import { formatDate, formatMoney } from '../../utils/helpers';

const CHARGE_FIELDS = [
  ['damageCharge', 'Damage Charges'],
  ['lateCharge', 'Late Charges'],
  ['fuelCharge', 'Fuel Charges'],
  ['otherCharges', 'Other Charges'],
];

const emptyReturnForm = {
  exterior: 'Good',
  interior: 'Good',
  fuel: 100,
  damageCharge: 0,
  lateCharge: 0,
  fuelCharge: 0,
  otherCharges: 0,
  notes: '',
};

export default function StaffReturns() {
  const [bookings, setBookings] = useState(getBookings());
  const [processBooking, setProcessBooking] = useState(null);
  const [returnForm, setReturnForm] = useState(emptyReturnForm);
  const [confirmProcess, setConfirmProcess] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const refresh = () => setBookings(getBookings());

  const onReturn = bookings.filter((b) => b.status === 'active');

  function returnInspectionOf(bookingId) {
    try {
      return getInspection(bookingId, 'return');
    } catch {
      return null;
    }
  }

  function openProcess(b) {
    const existing = returnInspectionOf(b.id);
    setProcessBooking(b);
    setReturnForm(
      existing
        ? {
            exterior: existing.exterior || 'Good',
            interior: existing.interior || 'Good',
            fuel: Number(existing.fuel) || 100,
            damageCharge: 0,
            lateCharge: 0,
            fuelCharge: 0,
            otherCharges: 0,
            notes: existing.notes || '',
          }
        : emptyReturnForm
    );
    setSavedNotice(false);
  }

  function handleField(e) {
    const { name, value } = e.target;
    setReturnForm((f) => ({ ...f, [name]: value }));
  }

  const baseAmount = processBooking
    ? Number(
        processBooking.pricing?.finalAmount ??
          processBooking.pricing?.total ??
          processBooking.pricing?.subtotal ??
          0
      )
    : 0;

  const extras = CHARGE_FIELDS.reduce(
    (sum, [key]) => sum + (Number(returnForm[key]) || 0),
    0
  );
  const finalAmount = baseAmount + extras;

  function buildReturnInspection(complete = true) {
    return {
      bookingId: processBooking.id,
      type: 'return',
      exterior: returnForm.exterior,
      interior: returnForm.interior,
      fuel: Number(returnForm.fuel) || 0,
      mileage: Number(processBooking.mileageAtPickup) || null,
      damage: CHARGE_FIELDS.filter(([key]) => (Number(returnForm[key]) || 0) > 0)
        .map(
          ([key, label]) =>
            `${label}: ${formatMoney(Number(returnForm[key]) || 0)}`
        )
        .join(', '),
      notes: returnForm.notes || '',
      extraCharges: {
        damageCharge: Number(returnForm.damageCharge) || 0,
        lateCharge: Number(returnForm.lateCharge) || 0,
        fuelCharge: Number(returnForm.fuelCharge) || 0,
        otherCharges: Number(returnForm.otherCharges) || 0,
      },
      finalAmount,
      recordedAt: complete ? new Date().toISOString() : undefined,
    };
  }

  function handleRecordInspection() {
    if (!processBooking) return;
    saveInspection(buildReturnInspection(false));
    setSavedNotice(true);
  }

  function handleComplete() {
    const b = processBooking;
    if (!b) return;
    saveInspection(buildReturnInspection(true));
    updateBookingStatus(b.id, 'completed');
    setCarStatus(b.carId, 'available');
    addNotification({
      userId: b.userId,
      message: `Your rental (${b.id}) has been returned and completed successfully. Total charges: ${formatMoney(finalAmount)} — thank you for choosing DriveEasy!`,
      type: 'info',
    });
    setConfirmProcess(false);
    setProcessBooking(null);
    refresh();
  }

  return (
    <DashboardLayout
      role="staff"
      title="Returns"
      subtitle="Inspect returned vehicles, apply charges, and complete rentals"
    >
      <div className="card de-card">
        {onReturn.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="bi-arrow-down-circle"
              title="No returns to process"
              message="Active rentals due back will appear here so you can complete their return."
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
                  <th>Return date</th>
                  <th>Vehicle condition</th>
                  <th>Petrol level</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {onReturn.map((b) => {
                  const customer = getUserById(b.userId);
                  const car = getCarById(b.carId);
                  const inspection = returnInspectionOf(b.id);
                  return (
                    <tr key={b.id}>
                      <td><span className="fw-semibold small">{b.id}</span></td>
                      <td>{customer?.name || '—'}</td>
                      <td>
                        {car?.name || '—'}
                        <div className="text-muted small">{car?.type || ''}</div>
                      </td>
                      <td>
                        {formatDate(b.returnDate)}
                        <div className="text-muted small">{b.returnTime || '—'}</div>
                      </td>
                      <td>
                        {inspection ? `${inspection.exterior} / ${inspection.interior}` : '—'}
                      </td>
                      <td>{inspection && inspection.fuel != null ? `${inspection.fuel}%` : '—'}</td>
                      <td className="text-end">
                        <button className="btn btn-de btn-sm" onClick={() => openProcess(b)}>
                          <i className="bi bi-arrow-return-left me-1" />Process Return
                        </button>
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
        open={Boolean(processBooking)}
        title={`Process Return — ${processBooking?.id || ''}`}
        onClose={() => setProcessBooking(null)}
        onConfirm={() => setConfirmProcess(true)}
        confirmText="Complete Return"
        size="modal-lg"
      >
        {processBooking && (
          <div>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <div>
                <span className="fw-semibold">{processBooking.id}</span>
                <div className="text-muted small">
                  {getCarById(processBooking.carId)?.name || '—'} · {getUserById(processBooking.userId)?.name || '—'}
                </div>
              </div>
              <div className="text-end small">
                <div className="text-muted">{formatDate(processBooking.returnDate)}</div>
                <StatusBadge status={processBooking.status} />
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small text-muted">Exterior condition</label>
                <select className="form-select" name="exterior" value={returnForm.exterior} onChange={handleField}>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small text-muted">Interior condition</label>
                <select className="form-select" name="interior" value={returnForm.interior} onChange={handleField}>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small text-muted">
                  Return fuel level: <strong>{returnForm.fuel}%</strong>
                </label>
                <input
                  className="form-range"
                  type="range"
                  name="fuel"
                  min="1"
                  max="100"
                  value={returnForm.fuel}
                  onChange={handleField}
                />
              </div>
              {CHARGE_FIELDS.map(([key, label]) => (
                <div className="col-md-3" key={key}>
                  <label className="form-label small text-muted">{label} (₹)</label>
                  <input
                    className="form-control"
                    type="number"
                    name={key}
                    min="0"
                    value={returnForm[key]}
                    onChange={handleField}
                  />
                </div>
              ))}
              <div className="col-12">
                <label className="form-label small text-muted">Notes</label>
                <textarea
                  className="form-control"
                  rows={2}
                  name="notes"
                  value={returnForm.notes}
                  onChange={handleField}
                  placeholder="Return inspection notes…"
                />
              </div>
            </div>

            <div className="card de-card mt-3">
              <div className="card-body py-3">
                <h6 className="fw-bold mb-3">Charge Summary</h6>
                <div className="row g-2 small">
                  <div className="col-6"><span className="text-muted">Base rental</span></div>
                  <div className="col-6 text-end">{formatMoney(baseAmount)}</div>
                  {CHARGE_FIELDS.filter(([key]) => (Number(returnForm[key]) || 0) > 0).map(([key, label]) => (
                    <div className="row g-2 small" key={key}>
                      <div className="col-6"><span className="text-muted">{label}</span></div>
                      <div className="col-6 text-end">{formatMoney(returnForm[key])}</div>
                    </div>
                  ))}
                  <div className="col-12 border-top pt-2 mt-2" />
                  <div className="col-6"><strong>Final amount</strong></div>
                  <div className="col-6 text-end fw-bold">{formatMoney(finalAmount)}</div>
                </div>
              </div>
            </div>

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
              {savedNotice ? (
                <span className="small text-success"><i className="bi bi-check-circle-fill me-1" />Return inspection saved.</span>
              ) : (
                <span className="small text-muted">Final amount is calculated as base rental plus charges above.</span>
              )}
              <button className="btn btn-outline-secondary" onClick={handleRecordInspection}>
                <i className="bi bi-clipboard-check me-1" />Record Return Inspection
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmProcess}
        title="Complete Return"
        message={`Finish the return for booking ${processBooking?.id || ''}? The booking will be marked completed, the inspection saved, and the customer notified of the final amount (${formatMoney(finalAmount)}).`}
        confirmText="Complete Return"
        onConfirm={handleComplete}
        onClose={() => setConfirmProcess(false)}
      />
    </DashboardLayout>
  );
}