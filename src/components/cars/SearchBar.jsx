import { useState } from 'react';

export default function SearchBar({ onSearch, initial = '' }) {
  const [q, setQ] = useState(initial);
  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'];

  const [filters, setFilters] = useState({ pickup: '', drop: '', pickupDate: '', returnDate: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ ...filters, q });
  };

  const update = (e) => setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <form className="search-box" onSubmit={handleSubmit}>
      <div className="row g-2 align-items-end">
        <div className="col-12 col-md-3">
          <label className="form-label small fw-semibold text-muted">Search</label>
          <input
            type="text"
            className="form-control"
            placeholder="Car brand or model…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="col-6 col-md-2">
          <label className="form-label small fw-semibold text-muted">Pickup</label>
          <select className="form-select" name="pickup" value={filters.pickup} onChange={update}>
            <option value="">Any location</option>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <label className="form-label small fw-semibold text-muted">Return</label>
          <select className="form-select" name="drop" value={filters.drop} onChange={update}>
            <option value="">Any location</option>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <label className="form-label small fw-semibold text-muted">From</label>
          <input type="date" className="form-control" name="pickupDate" value={filters.pickupDate} onChange={update} />
        </div>
        <div className="col-6 col-md-2">
          <label className="form-label small fw-semibold text-muted">To</label>
          <input type="date" className="form-control" name="returnDate" value={filters.returnDate} onChange={update} />
        </div>
        <div className="col-12 col-md-1">
          <button type="submit" className="btn btn-de w-100"><i className="bi bi-search" /></button>
        </div>
      </div>
    </form>
  );
}