import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { getMaintenance, addMaintenance, updateMaintenance, markMaintenanceCompleted, deleteMaintenance } from '../../services/maintenanceService';
import { getCars } from '../../services/carService';
import { formatDate, formatMoney, todayISO } from '../../utils/helpers';

const PAGE_SIZE = 8;
const MAINTENANCE_TYPES = ['Regular Service', 'Engine Repair', 'Body Work', 'General Check', 'Tire Replacement', 'Other'];
const emptyForm = {
  carId: '',
  type: 'Regular Service',
  description: '',
  startDate: todayISO(),
  endDate: '',
  cost: 0,
  serviceCenter: '',
  status: 'in-progress',
};

export default function AdminMaintenance() {
  const [records, setRecords] = useState(getMaintenance());
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const cars = getCars();
  const refresh = () => setRecords(getMaintenance());
  const pageCount = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const paged = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, carId: cars[0]?.id || '' });
    setShowModal(true);
  }

  function openEdit(rec) {
    setEditingId(rec.id);
    setForm({
      carId: rec.carId || '',
      type: rec.type || 'Regular Service',
      description: rec.description || '',
      startDate: rec.startDate || todayISO(),
      endDate: rec.endDate || '',
      cost: Number(rec.cost) || 0,
      serviceCenter: rec.serviceCenter || '',
      status: rec.status || 'in-progress',
    });
    setShowModal(true);
  }

  function handleField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSave() {
    const payload = {
      ...form,
      cost: Number(form.cost) || 0,
      endDate: form.endDate || null,
    };
    if (editingId) {
      updateMaintenance(editingId, payload);
    } else {
      addMaintenance(payload);
    }
    setShowModal(false);
    refresh();
  }

  function handleComplete(id) {
    markMaintenanceCompleted(id);
    refresh();
  }

  function handleDelete() {
    deleteMaintenance(deleteId);
    setDeleteId(null);
    refresh();
  }

  return (
    <DashboardLayout
      role="admin"
      title="Maintenance"
      subtitle="Track vehicle service and repairs"
      action={
        <button className="btn btn-de" onClick={openAdd}>
          <i className="bi bi-plus-lg me-2" />Add Maintenance
        </button>
      }
    >
      <div className="card de-card">
        {paged.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="bi-wrench-adjustable"
              title="No maintenance records"
              message="Add a maintenance record to keep your fleet healthy."
              action={
                <button className="btn btn-de btn-sm mt-2" onClick={openAdd}>
                  <i className="bi bi-plus-lg me-1" />Add Maintenance
                </button>
              }
            />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-de mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Cost</th>
                    <th>Service Center</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((rec) => {
                    const car = getCars().find((c) => c.id === rec.carId);
                    const isPending = ['in-progress', 'scheduled'].includes(rec.status);
                    return (
                      <tr key={rec.id}>
                        <td>
                          <span className="fw-semibold">{car?.name || (car ? car.name : 'Deleted')}</span>
                          <div className="text-muted small">{rec.id}</div>
                        </td>
                        <td>{rec.type}</td>
                        <td>
                          {rec.description && rec.description.length > 50
                            ? `${rec.description.slice(0, 50)}…`
                            : (rec.description || '—')}
                        </td>
                        <td>{formatDate(rec.startDate)}</td>
                        <td>{formatDate(rec.endDate)}</td>
                        <td>{formatMoney(rec.cost)}</td>
                        <td>{rec.serviceCenter || '—'}</td>
                        <td><StatusBadge status={rec.status} /></td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            {isPending && (
                              <button className="btn btn-outline-success" title="Mark Completed" onClick={() => handleComplete(rec.id)}>
                                <i className="bi bi-check2-circle" />
                              </button>
                            )}
                            <button className="btn btn-outline-de" title="Edit" onClick={() => openEdit(rec)}>
                              <i className="bi bi-pencil" />
                            </button>
                            <button className="btn btn-outline-danger" title="Delete" onClick={() => setDeleteId(rec.id)}>
                              <i className="bi bi-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="card-footer bg-transparent d-flex justify-content-center">
              <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal
        open={showModal}
        title={editingId ? 'Edit Maintenance' : 'Add Maintenance'}
        onClose={() => setShowModal(false)}
        onConfirm={handleSave}
        confirmText={editingId ? 'Save Changes' : 'Add Record'}
        size="modal-lg"
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small text-muted">Vehicle</label>
            <select className="form-select" name="carId" value={form.carId} onChange={handleField}>
              <option value="">Select vehicle</option>
              {cars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Maintenance Type</label>
            <select className="form-select" name="type" value={form.type} onChange={handleField}>
              {MAINTENANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Description</label>
            <textarea className="form-control" name="description" rows={3} value={form.description} onChange={handleField} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Start Date</label>
            <input className="form-control" type="date" name="startDate" value={form.startDate} onChange={handleField} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">End Date</label>
            <input className="form-control" type="date" name="endDate" value={form.endDate} onChange={handleField} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Cost (₹)</label>
            <input className="form-control" type="number" name="cost" value={form.cost} onChange={handleField} min="0" />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Service Center</label>
            <input className="form-control" name="serviceCenter" value={form.serviceCenter} onChange={handleField} placeholder="e.g. Maruti Service Center, Delhi" />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Status</label>
            <select className="form-select" name="status" value={form.status} onChange={handleField}>
              <option value="scheduled">scheduled</option>
              <option value="in-progress">in-progress</option>
              <option value="completed">completed</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Maintenance"
        message="Are you sure you want to delete this maintenance record? This cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </DashboardLayout>
  );
}