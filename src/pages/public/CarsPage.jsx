import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CarCard from '../../components/cars/CarCard';
import FilterSidebar from '../../components/cars/FilterSidebar';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { getCars } from '../../services/carService';
import { isCarBooked } from '../../services/bookingService';
import { isCarInMaintenance } from '../../services/maintenanceService';

const PAGE_SIZE = 8;

export default function CarsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const allCars = getCars();

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    type: searchParams.get('type') || '',
    maxPrice: searchParams.get('maxPrice') || 3000,
    fuelTypes: [],
    transmission: '',
    seats: '',
    location: searchParams.get('location') || '',
    availableOnly: false,
    pickupDate: searchParams.get('pickupDate') || '',
    returnDate: searchParams.get('returnDate') || '',
  });
  const [sort, setSort] = useState('featured');
  const [page, setPage] = useState(1);

  const locations = useMemo(() => [...new Set(allCars.flatMap((c) => c.locations))], [allCars]);

  const filtered = useMemo(() => {
    let list = allCars.slice();

    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(
        (c) =>
          (c.brand || '').toLowerCase().includes(q) ||
          (c.model || c.name || '').toLowerCase().includes(q) ||
          (c.type || '').toLowerCase().includes(q)
      );
    }
    if (filters.type) list = list.filter((c) => c.type === filters.type);
    if (filters.maxPrice) list = list.filter((c) => c.pricePerDay <= Number(filters.maxPrice));
    if (filters.fuelTypes.length) list = list.filter((c) => filters.fuelTypes.includes(c.fuelType));
    if (filters.transmission) list = list.filter((c) => c.transmission === filters.transmission);
    if (filters.seats) list = list.filter((c) => c.seats >= Number(filters.seats));
    if (filters.location) list = list.filter((c) => (c.locations || []).includes(filters.location));

    if (filters.availableOnly) {
      list = list.filter((c) => c.status === 'available' && !isCarInMaintenance(c.id));
    }
    if (filters.pickupDate && filters.returnDate) {
      list = list.filter(
        (c) =>
          c.status === 'available' &&
          !isCarInMaintenance(c.id) &&
          !isCarBooked(c.id, filters.pickupDate, filters.returnDate)
      );
    }

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price-desc':
        list.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort((a, b) => (b.year || 0) - (a.year || 0));
        break;
      default:
        list.sort((a, b) => (b.rating - a.rating) * 100 + (a.pricePerDay - b.pricePerDay));
    }

    return list;
  }, [allCars, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const updateSearch = (f) => {
    setFilters(f);
    setPage(1);
    const p = new URLSearchParams();
    if (f.q) p.set('q', f.q);
    if (f.type) p.set('type', f.type);
    if (f.location) p.set('location', f.location);
    navigate(`/cars?${p.toString()}`, { replace: true });
  };

  const clearFilters = () =>
    updateSearch({ q: '', type: '', maxPrice: 3000, fuelTypes: [], transmission: '', seats: '', location: '', availableOnly: false, pickupDate: '', returnDate: '' });

  return (
    <div>
      <section className="bg-white border-bottom py-4">
        <div className="container">
          <h1 className="page-title fs-2 mb-0">Browse Our Fleet</h1>
          <p className="text-muted mb-0">Find the perfect car for your journey.</p>
        </div>
      </section>
      <section className="py-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3">
              <div className="position-sticky" style={{ top: 90 }}>
                <FilterSidebar filters={filters} onChange={updateSearch} onClear={clearFilters} locations={locations} carTypes="" fuelTypes="" />
              </div>
            </div>
            <div className="col-lg-9">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <span className="text-muted small">
                  Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'car' : 'cars'}
                </span>
                <div className="d-flex align-items-center gap-2">
                  <label className="small text-muted">Sort by:</label>
                  <select className="form-select form-select-sm" style={{ width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Rating</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="card de-card p-4">
                  <EmptyState
                    title="No cars match your filters"
                    message="Try adjusting the search or clearing the filters."
                    action={
                      <button className="btn btn-de" onClick={clearFilters}>Clear Filters</button>
                    }
                  />
                </div>
              ) : (
                <div className="row g-4">
                  {paged.map((car) => (
                    <div className="col-12 col-md-6 col-xl-4" key={car.id}>
                      <CarCard car={car} />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}