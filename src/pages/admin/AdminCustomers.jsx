import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { getCustomerAggregate } from '../../services/customerService';
import { updateUser, deleteUser, blockUser, unblockUser } from '../../services/authService';
import { getBookings } from '../../services/bookingService';
import { getCarById } from '../../services/carService';
import { formatDate, formatMoney, initials } from '../../utils/helpers';

const PAGE_SIZE = 8;
const emptyForm = { name: '', email: '', phone: '', city: '', state: '', pincode: '' };

export default function AdminCustomers() {
  const [customers, setCustomers] = useState(getCustomerAggregate());
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const refresh = () => setCustomers(getCustomerAggregate());
  const allBookings = getBookings();

  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.id || '').toLowerCase().includes(q)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openEdit(c) {
    setEditCustomer(c);
    setForm({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      city: c.city || '',
      state: c.state || '',
      pincode: c.pincode || '',
    });
  }

  function handleField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSaveEdit() {
    updateUser(editCustomer.id, form);
    setEditCustomer(null);
    refresh();
  }

  function handleToggleBlock(c) {
    if (c.status === 'blocked') {
      unblockUser(c.id);
    } else {
      blockUser(c.id);
    }
    refresh();
  }

  function handleDelete() {
    deleteUser(deleteId);
    setDeleteId(null);
    refresh();
  }

  function customerBookings(id) {
    return allBookings
      .filter((b) => b.userId === id)
      .sort((a, b) => new Date(b.createdAt || b.pickupDate) - new Date(a.createdAt || a.pickupDate));
  }

  const viewCustomerBookings = viewCustomer ? customerBookings(viewCustomer.id) : [];

  return (
    <DashboardLayout
      role="admin"
      title="Customers"
      subtitle="Manage all registered customers"
    >
      <div className="card de-card mb-4">
        <div className="card-body py-3">
          <div className="input-group" style={{ maxWidth: 420 }}>
            <span className="input-group-text bg-transparent"><i className="bi bi-search" /></span>
            <input
              className="form-control"
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="card de-card">
        {paged.length === 0 ? (
          <div className="p-4">
            <EmptyState icon="bi-people" title="No customers found" message="Try a different search term or wait for new registrations." />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-de mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered</th>
                    <th>Total Bookings</th>
                    <th>Total Spending</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="avatar rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold" style={{ width: 34, height: 34, fontSize: 13, background: '#1f4ed8' }}>
                            {initials(c.name)}
                          </span>
                          <div>
                            <span className="fw-semibold">{c.name}</span>
                            <div className="text-muted small">{c.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{c.email}</td>
                      <td>{c.phone || '—'}</td>
                      <td>{formatDate(c.regDate)}</td>
                      <td>{c.bookings}</td>
                      <td>{formatMoney(c.totalSpend)}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-de" title="View" onClick={() => setViewCustomer(c)}><i className="bi bi-eye" /></button>
                          <button className="btn btn-outline-de" title="Edit" onClick={() => openEdit(c)}><i className="bi bi-pencil" /></button>
                          <button
                            className={`btn ${c.status === 'blocked' ? 'btn-outline-success' : 'btn-outline-warning'}`}
                            title={c.status === 'blocked' ? 'Unblock' : 'Block'}
                            onClick={() => handleToggleBlock(c)}
                          >
                            <i className={`bi ${c.status === 'blocked' ? 'bi-unlock' : 'bi-lock'}`} />
                          </button>
                          <button className="btn btn-outline-danger" title="Delete" onClick={() => setDeleteId(c.id)}><i className="bi bi-trash" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer bg-transparent d-flex justify-content-center">
              <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      <Modal open={Boolean(viewCustomer)} title="Customer Details" onClose={() => setViewCustomer(null)} size="modal-lg">
        {viewCustomer && (
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card de-card h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Profile</h6>
                  <p className="mb-1"><span className="text-muted small">ID:</span> <strong>{viewCustomer.id}</strong></p>
                  <p className="mb-1"><span className="text-muted small">Name:</span> {viewCustomer.name}</p>
                  <p className="mb-1"><span className="text-muted small">Email:</span> {viewCustomer.email}</p>
                  <p className="mb-1"><span className="text-muted small">Phone:</span> {viewCustomer.phone || '—'}</p>
                  <p className="mb-1"><span className="text-muted small">DOB:</span> {formatDate(viewCustomer.dob)}</p>
                  <p className="mb-1"><span className="text-muted small">Registered:</span> {formatDate(viewCustomer.regDate)}</p>
                  <p className="mb-0"><span className="text-muted small">Status:</span> <StatusBadge status={viewCustomer.status} /></p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card de-card h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">Address</h6>
                  <p className="mb-1"><span className="text-muted small">Address:</span> {viewCustomer.address || '—'}</p>
                  <p className="mb-1"><span className="text-muted small">City:</span> {viewCustomer.city || '—'}</p>
                  <p className="mb-1"><span className="text-muted small">State:</span> {viewCustomer.state || '—'}</p>
                  <p className="mb-1"><span className="text-muted small">Pincode:</span> {viewCustomer.pincode || '—'}</p>
                  <h6 className="fw-bold mt-4 mb-2">Statistics</h6>
                  <p className="mb-1"><span className="text-muted small">Total Bookings:</span> {viewCustomer.bookings}</p>
                  <p className="mb-1"><span className="text-muted small">Total Spending:</span> {formatMoney(viewCustomer.totalSpend)}</p>
                  <p className="mb-1"><span className="text-muted small">Reviews:</span> {viewCustomer.reviews}</p>
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="card de-card">
                <div className="card-header bg-transparent"><h6 className="fw-bold mb-0">Booking History</h6></div>
                <div className="table-responsive">
                  <table className="table table-de mb-0 align-middle">
                    <thead>
                      <tr>
                        <th>Booking</th>
                        <th>Car</th>
                        <th>Pickup</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewCustomerBookings.length === 0 && (
                        <tr><td colSpan={5}><span className="text-muted small">No bookings yet</span></td></tr>
                      )}
                      {viewCustomerBookings.map((b) => {
                        const car = getCarById(b.carId);
                        return (
                          <tr key={b.id}>
                            <td><span className="small fw-semibold">{b.id}</span></td>
                            <td>{car?.name || '—'}</td>
                            <td>{formatDate(b.pickupDate)}</td>
                            <td>{formatMoney(b.pricing?.finalAmount || b.pricing?.total)}</td>
                            <td><StatusBadge status={b.status} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(editCustomer)} title="Edit Customer" onClose={() => setEditCustomer(null)} onConfirm={handleSaveEdit} confirmText="Save Changes">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small text-muted">Name</label>
            <input className="form-control" name="name" value={form.name} onChange={handleField} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Email</label>
            <input className="form-control" name="email" value={form.email} onChange={handleField} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Phone</label>
            <input className="form-control" name="phone" value={form.phone} onChange={handleField} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">City</label>
            <input className="form-control" name="city" value={form.city} onChange={handleField} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">State</label>
            <input className="form-control" name="state" value={form.state} onChange={handleField} />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Pincode</label>
            <input className="form-control" name="pincode" value={form.pincode} onChange={handleField} />
          </div>
          <div className="col-12">
            <p className="small text-muted mb-0">
              Email is also the user referenced by <strong>{editCustomer?.id}</strong>. Updating it affects this customer record only.
            </p>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This cannot be undone and may affect their booking history."
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </DashboardLayout>
  );
}