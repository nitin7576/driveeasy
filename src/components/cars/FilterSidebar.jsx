export default function FilterSidebar({ filters, onChange, carTypes, fuelTypes, locations, onClear }) {
  const update = (name, value) => onChange({ ...filters, [name]: value });

  const locationList = locations.length ? locations : ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'];

  return (
    <div className="card de-card filter-card p-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="fw-bold mb-0"><i className="bi bi-funnel me-2" />Filters</h6>
        <button className="btn btn-sm btn-link text-danger p-0" onClick={onClear}>Clear all</button>
      </div>

      <div className="filter-group">
        <label className="form-label fw-semibold">Price per day (₹)</label>
        <input
          type="range"
          className="form-range"
          min="500"
          max="3000"
          step="100"
          value={filters.maxPrice || 3000}
          onChange={(e) => update('maxPrice', Number(e.target.value))}
        />
        <div className="d-flex justify-content-between price-labels">
          <span>₹500</span>
          <span className="fw-semibold text-primary">₹{filters.maxPrice || 3000}+</span>
        </div>
      </div>

      <div className="filter-group">
        <h6>Car Type</h6>
        <div className="d-flex flex-wrap gap-2">
          {['Hatchback', 'Sedan', 'SUV', 'Compact SUV', 'MUV'].map((t) => (
            <button
              key={t}
              type="button"
              className={`btn btn-sm ${filters.type === t ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => update('type', filters.type === t ? '' : t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <h6>Fuel Type</h6>
        {['Petrol', 'Diesel', 'Electric', 'CNG'].map((f) => (
          <div className="form-check" key={f}>
            <input
              className="form-check-input"
              type="checkbox"
              checked={(filters.fuelTypes || []).includes(f)}
              onChange={(e) => {
                const cur = filters.fuelTypes || [];
                const next = e.target.checked ? [...cur, f] : cur.filter((x) => x !== f);
                update('fuelTypes', next);
              }}
            />
            <label className="form-check-label">{f}</label>
          </div>
        ))}
      </div>

      <div className="filter-group">
        <h6>Transmission</h6>
        {['Automatic', 'Manual'].map((t) => (
          <div className="form-check" key={t}>
            <input
              className="form-check-input"
              type="radio"
              name="transmission"
              checked={filters.transmission === t}
              onChange={() => update('transmission', filters.transmission === t ? '' : t)}
            />
            <label className="form-check-label">{t}</label>
          </div>
        ))}
      </div>

      <div className="filter-group">
        <h6>Seats</h6>
        <select className="form-select" value={filters.seats || ''} onChange={(e) => update('seats', e.target.value)}>
          <option value="">Any</option>
          <option value="4">4 seats</option>
          <option value="5">5 seats</option>
          <option value="7">7 seats</option>
        </select>
      </div>

      <div className="filter-group">
        <h6>Location</h6>
        {locationList.map((loc) => (
          <div className="form-check" key={loc}>
            <input
              className="form-check-input"
              type="radio"
              name="location"
              checked={filters.location === loc}
              onChange={() => update('location', filters.location === loc ? '' : loc)}
            />
            <label className="form-check-label">{loc}</label>
          </div>
        ))}
      </div>

      <div className="filter-group">
        <h6>Availability</h6>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            checked={filters.availableOnly}
            onChange={(e) => update('availableOnly', e.target.checked)}
          />
          <label className="form-check-label">Available only</label>
        </div>
      </div>
    </div>
  );
}