import { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  getCars,
  addCar,
  updateCar,
  deleteCar,
  setCarStatus,
} from '../../services/carService';
import { formatMoney } from '../../utils/helpers';

const CAR_TYPES = ['Sedan', 'Hatchback', 'SUV', 'Compact SUV', 'MUV'];
const LOCATIONS = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'];
const PAGE_SIZE = 8;

const emptyForm = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  type: 'Hatchback',
  pricePerDay: 1000,
  fuelType: 'Petrol',
  transmission: 'Manual',
  seats: 5,
  mileage: 18,
  locations: [],
  description: '',
  features: '',
  status: 'available',
  imageBodyColor: '#2844a4',
};

export default function AdminCars() {
  const [cars, setCars] = useState(getCars());
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = () => setCars(getCars());
  const pageCount = Math.max(1, Math.ceil(cars.length / PAGE_SIZE));
  const paged = cars.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(car) {
    setEditingId(car.id);
    setForm({
      brand: car.brand || car.name?.split(' ')[0] || '',
      model: car.model || car.name?.split(' ').slice(1).join(' ') || '',
      year: Number(car.year) || new Date().getFullYear(),
      type: car.type || 'Hatchback',
      pricePerDay: Number(car.pricePerDay) || 0,
      fuelType: car.fuelType || 'Petrol',
      transmission: car.transmission || 'Manual',
      seats: Number(car.seats) || 5,
      mileage: Number(car.mileage) || 0,
      locations: Array.isArray(car.locations) ? car.locations : [],
      description: car.description || '',
      features: Array.isArray(car.features) ? car.features.join(', ') : '',
      status: car.status === 'available' ? 'available' : car.status,
      imageBodyColor: car.imageBodyColor || '#2844a4',
    });
    setShowModal(true);
  }

  function toggleLocation(loc) {
    setForm((f) => ({
      ...f,
      locations: f.locations.includes(loc)
        ? f.locations.filter((x) => x !== loc)
        : [...f.locations, loc],
    }));
  }

  function handleField(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave() {
    setLoading(true);
    const payload = {
      name: `${form.brand} ${form.model}`.trim(),
      brand: form.brand,
      model: form.model,
      year: Number(form.year) || new Date().getFullYear(),
      type: form.type,
      pricePerDay: Number(form.pricePerDay) || 0,
      fuelType: form.fuelType,
      transmission: form.transmission,
      seats: Number(form.seats) || 5,
      mileage: Number(form.mileage) || 0,
      locations: form.locations,
      description: form.description,
      features: form.features.split(',').map((s) => s.trim()).filter(Boolean),
      status: form.status,
      imageBodyColor: form.imageBodyColor || '#2844a4',
    };
    if (editingId) {
      updateCar(editingId, payload);
    } else {
      addCar(payload);
    }
    await new Promise((r) => setTimeout(r, 350));
    setLoading(false);
    setShowModal(false);
    refresh();
  }

  async function handleStatusChange(id, status) {
    setCarStatus(id, status);
    refresh();
  }

  async function handleDelete() {
    deleteCar(deleteId);
    setDeleteId(null);
    refresh();
  }

  return (
    <DashboardLayout
      role="admin"
      title="Cars Management"
      subtitle="Add, edit, and manage your fleet"
      action={
        <button className="btn btn-de" onClick={openAdd}>
          <i className="bi bi-plus-lg me-2" />Add Car
        </button>
      }
    >
      {loading && <LoadingSpinner text="Saving car..." />}

      <div className="card de-card">
        {paged.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="bi-car-front"
              title="No cars found"
              message="Add your first car to start building your fleet."
              action={
                <button className="btn btn-de btn-sm mt-2" onClick={openAdd}>
                  <i className="bi bi-plus-lg me-1" />Add Car
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
                    <th>Image</th>
                    <th>Car</th>
                    <th>Model</th>
                    <th>Year</th>
                    <th>Type</th>
                    <th>Price/Day</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((car) => (
                    <tr key={car.id}>
                      <td>
                        {car.images?.[0] ? (
                          <img
                            src={car.images[0]}
                            alt={car.name}
                            style={{ width: 60, height: 40, objectFit: 'cover' }}
                            className="rounded"
                          />
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        <span className="fw-semibold">{car.brand || car.name}</span>
                        <div className="text-muted small">{car.id}</div>
                      </td>
                      <td>{car.model || '—'}</td>
                      <td>{car.year || '—'}</td>
                      <td>{car.type}</td>
                      <td>{formatMoney(car.pricePerDay)}</td>
                      <td>{car.locations?.[0] || '—'}</td>
                      <td>
                        <div className="d-flex flex-column gap-1 align-items-start">
                          <StatusBadge status={car.status} />
                          <select
                            className="form-select form-select-sm"
                            style={{ minWidth: 130 }}
                            value={car.status}
                            onChange={(e) => handleStatusChange(car.id, e.target.value)}
                          >
                            <option value="available">available</option>
                            <option value="maintenance">maintenance</option>
                            <option value="unavailable">unavailable</option>
                          </select>
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-de" title="View" onClick={() => {}}>
                            <i className="bi bi-eye" />
                          </button>
                          <button className="btn btn-outline-de" title="Edit" onClick={() => openEdit(car)}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button className="btn btn-outline-danger" title="Delete" onClick={() => setDeleteId(car.id)}>
                            <i className="bi bi-trash" />
                          </button>
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

      <Modal
        open={showModal}
        title={editingId ? 'Edit Car' : 'Add Car'}
        onClose={() => setShowModal(false)}
        onConfirm={handleSave}
        confirmText={editingId ? 'Save Changes' : 'Add Car'}
        size="modal-lg"
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small text-muted">Brand</label>
            <input className="form-control" name="brand" value={form.brand} onChange={handleField} placeholder="e.g. Maruti" />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Model</label>
            <input className="form-control" name="model" value={form.model} onChange={handleField} placeholder="e.g. Swift" />
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Year</label>
            <input className="form-control" type="number" name="year" value={form.year} onChange={handleField} min="1990" max="2026" />
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Type</label>
            <select className="form-select" name="type" value={form.type} onChange={handleField}>
              {CAR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Price per day (₹)</label>
            <input className="form-control" type="number" name="pricePerDay" value={form.pricePerDay} onChange={handleField} min="0" />
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Fuel Type</label>
            <select className="form-select" name="fuelType" value={form.fuelType} onChange={handleField}>
              {['Petrol', 'Diesel', 'Electric', 'CNG'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Transmission</label>
            <select className="form-select" name="transmission" value={form.transmission} onChange={handleField}>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Seats</label>
            <input className="form-control" type="number" name="seats" value={form.seats} onChange={handleField} min="2" max="9" />
          </div>
          <div className="col-md-4">
            <label className="form-label small text-muted">Mileage (km/l)</label>
            <input className="form-control" type="number" name="mileage" value={form.mileage} onChange={handleField} min="0" />
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Locations</label>
            <div className="d-flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <div className="form-check" key={loc}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`loc-${loc}`}
                    checked={form.locations.includes(loc)}
                    onChange={() => toggleLocation(loc)}
                  />
                  <label className="form-check-label" htmlFor={`loc-${loc}`}>{loc}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Description</label>
            <textarea className="form-control" name="description" rows={3} value={form.description} onChange={handleField} />
          </div>
          <div className="col-12">
            <label className="form-label small text-muted">Features (comma separated)</label>
            <input className="form-control" name="features" value={form.features} onChange={handleField} placeholder="Air Conditioning, Bluetooth, Power Windows" />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Image Body Color (hex)</label>
            <input className="form-control" name="imageBodyColor" value={form.imageBodyColor} onChange={handleField} placeholder="#2844a4" />
          </div>
          <div className="col-md-6">
            <label className="form-label small text-muted">Status</label>
            <select className="form-select" name="status" value={form.status} onChange={handleField}>
              <option value="available">available</option>
              <option value="maintenance">maintenance</option>
              <option value="unavailable">unavailable</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Car"
        message="Are you sure you want to delete this car? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </DashboardLayout>
  );
}