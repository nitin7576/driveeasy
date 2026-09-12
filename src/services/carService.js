import { KEYS, getLS, setLS } from '../utils/storage';
import { CAR_DATA } from '../data/mockData';
import { carPlaceholder } from '../utils/images';

function decorate(car) {
  return {
    ...car,
    images: [
      carPlaceholder(car.brand || car.name, car.model || car.type, car.imageBodyColor, car.imageBgTop, car.imageBgBottom),
    ],
  };
}

export function seedCars() {
  const existing = getLS(KEYS.CARS);
  if (!existing.length) {
    const seeded = CAR_DATA.map((c) => decorate(c));
    setLS(KEYS.CARS, seeded);
    return seeded;
  }
  return existing.map((c) => (c.images ? c : decorate(c)));
}

export function getCars() {
  // const cars = getLS(KEYS.CARS);
  // if (!cars.length) return seedCars();
  return seedCars();
}

export function getCarById(id) {
  return getCars().find((c) => c.id === id) || null;
}

export function addCar(data) {
  const cars = getCars();
  const car = decorate({
    id: `CAR-${Date.now().toString(36).toUpperCase()}`,
    ...data,
    name: data.name || `${data.brand || ''} ${data.model || ''}`.trim() || `Car ${cars.length + 1}`,
    rating: 0,
    reviewCount: 0,
  });
  cars.unshift(car);
  setLS(KEYS.CARS, cars);
  return car;
}

export function updateCar(id, data) {
  const cars = getCars();
  const idx = cars.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  const updated = { ...cars[idx], ...data };
  if (!updated.images) Object.assign(updated, { images: decorate(updated).images });
  cars[idx] = updated;
  setLS(KEYS.CARS, cars);
  return cars[idx];
}

export function deleteCar(id) {
  setLS(KEYS.CARS, getCars().filter((c) => c.id !== id));
}

export function setCarStatus(id, status) {
  return updateCar(id, { status });
}

export function getAvailableCars() {
  return getCars().filter((c) => ['available', 'available_now'].includes(c.status));
}