import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { getCoupons, addCoupon, updateCoupon, deleteCoupon } from '../../services/couponService';
import { formatMoney, formatDate, todayISO } from '../../utils/helpers';

const PAGE_SIZE = 8;
const emptyForm = {
  code: '',
  discountPercent: 10,
  maxDiscount: 2000,
  minBookingAmount: 5000,
  startDate: todayISO(),
  expiryDate: todayISO(),
  usageLimit: 100,
  status: 'active',
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState(getCoupons());
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const refresh = () => setCoupons(getCoupons());
  const pageCount = Math.max(1, Math.ceil(coupons.length / PAGE_SIZE));
  const paged = coupons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(coupon) {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code || '',
      discountPercent: Number(coupon.discountPercent) || 0,
      maxDiscount: Number(coupon.maxDiscount) || 0,
      minBookingAmount: Number(coupon.minBookingAmount) || 0,
      startDate: coupon.startDate || todayISO(),
      expiryDate: coupon.expiryDate || todayISO(),
      usageLimit: Number(coupon.usageLimit) || 0,
      status: coupon.status || 'active',
    });
    setShowModal(true);
  }

  function handleField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function autoStatus() {
    const now = new Date();
    if (form.startDate && new Date(form.startDate) > now) return 'inactive';
    if (form.expiryDate && new Date(form.expiryDate) < now) return 'expired';
    return 'active';
  }

  function handleSave() {
    const payload = {
      code: String(form.code || '').toUpperCase().replace(/\s+/g, ''),
      discountPercent: Number(form.discountPercent) || 0,
      maxDiscount: Number(form.maxDiscount) || 0,
      minBookingAmount: Number(form.minBookingAmount) || 0,
      startDate: form.startDate,
      expiryDate: form.expiryDate,
      usageLimit: Number(form.usageLimit) || 0,
      status: form.status,
    };
    if (editingId) {
      updateCoupon(editingId, payload);
    } else {
      addCoupon(payload);
    }
    setShowModal(false);
    refresh();
  }

  function handleDelete() {
    deleteCoupon(deleteId);
    setDeleteId(null);
    refresh();
  }

  return (
    <DashboardLayout
      role="admin"
      title="Coupons"
      subtitle="Manage promotional discount codes"
      action={
        <button className="btn btn-de" onClick={openAdd}>
          <i className="bi bi-plus-lg me-2" />Add Coupon
        </button>
      }
    >
      <div className="card de-card">
        {paged.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="bi-ticket-perforated"
              title="No coupons yet"
              message="Create a coupon to start running promotions."
              action={
                <button className="btn btn-de btn-sm mt-2" onClick={openAdd}>
                  <i className="bi bi-plus-lg me-1" />Add Coupon
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
                    <th>Code</th>
                    <th>Discount %</th>
                    <th>Max Discount</th>
                    <th>Min Amount</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Used/Limit</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c) => {
                    const limit = Number(c.usageLimit) || 0;
                    const percent = limit > 0 ? Math.min(100, Math.round(((Number(c.usedCount) || 0) / limit) * 100)) : 0;
                    return (
                      <tr key={c.id}>
                        <td><span className="fw-bold text-uppercase">{c.code}</span></td>
                        <td>{c.discountPercent}%</td>
                        <td>{formatMoney(c.maxDiscount)}</td>
                        <td>{formatMoney(c.minBookingAmount)}</td>
                        <td>{formatDate(c.startDate)}</td>
                        <td>{formatDate(c.expiryDate)}</td>
                        <td style={{ minWidth: 130 }}>
                          <div className="d-flex justify-content-between small mb-1">
                            <span>{c.usedCount || 0} / {limit || '∞'}</span>
                            <span className="text-muted">{percent}%</span>
                          </div>
                          <div className="progress" style={{ height: 5 }}>
                            <div className="progress-bar" role="progressbar" style={{ width: `${percent}%` }} />
                          </div>
                        </td>
                        <td><StatusBadge status={c.status} /></td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-de" title="Edit" onClick={() => openEdit(c)}>
                              <i className="bi bi-pencil" />
                            </button>
                            <button className="btn btn-outline-danger" title="Delete" onClick={() => setDeleteId(c.id)}>
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
        title={editingId ? 'Edit Coupon' : 'Add Coupon'}
        onClose={() => setShowModal(false)}
        onConfirm={handleSave}
        confirmText={editingId ? 'Save Changes' : 'Add Coupon'}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small text-muted">Code</label>
            <input className="form-control text-uppercase" name="code" value={form.code} onChange={handleField} placeholder="e.g. SAVE10" />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Discount % (1-100)</label>
            <input className="form-control" type="number" name="discountPercent" value={form.discountPercent} onChange={handleField} min="1" max="100" />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Max Discount (₹)</label>
            <input className="form-control" type="number" name="maxDiscount" value={form.maxDiscount} onChange={handleField} min="0" />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Min Booking Amount (₹)</label>
            <input className="form-control" type="number" name="minBookingAmount" value={form.minBookingAmount} onChange={handleField} min="0" />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Start Date</label>
            <input className="form-control" type="date" name="startDate" value={form.startDate} onChange={handleField} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Expiry Date</label>
            <input className="form-control" type="date" name="expiryDate" value={form.expiryDate} onChange={handleField} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Usage Limit</label>
            <input className="form-control" type="number" name="usageLimit" value={form.usageLimit} onChange={handleField} min="0" />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Status</label>
            <select className="form-select" name="status" value={form.status} onChange={handleField}>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="expired">expired</option>
            </select>
          </div>
          <div className="col-12">
            <button type="button" className="btn btn-outline-de btn-sm" onClick={() => setForm((f) => ({ ...f, status: autoStatus() }))}>
              <i className="bi bi-magic me-1" />Auto-detect status from dates
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? Customers will no longer be able to use it."
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </DashboardLayout>
  );
}