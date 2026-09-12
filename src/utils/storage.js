export const KEYS = {
  USERS: 'de_users',
  CURRENT_USER: 'de_current_user',
  CARS: 'de_cars',
  BOOKINGS: 'de_bookings',
  PAYMENTS: 'de_payments',
  REVIEWS: 'de_reviews',
  COUPONS: 'de_coupons',
  WISHLIST: 'de_wishlist',
  NOTIFICATIONS: 'de_notifications',
  MAINTENANCE: 'de_maintenance',
  INSPECTIONS: 'de_inspections',
  PROFILE: 'de_profile',
  LAST_BOOKING_DETAILS: 'de_last_booking_details',
};

const hasStorage = (() => {
  try {
    const k = '__de_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
})();

const memory = new Map();

const NO_FALLBACK = Symbol('no-fallback');

export function getLS(key, fallback = NO_FALLBACK) {
  if (!hasStorage) {
    const v = memory.get(key);
    if (v !== undefined) return v;
    return fallback === NO_FALLBACK ? [] : fallback;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback === NO_FALLBACK ? [] : fallback;
    return JSON.parse(raw);
  } catch {
    return fallback === NO_FALLBACK ? [] : fallback;
  }
}

export function setLS(key, value) {
  memory.set(key, value);
  if (hasStorage) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota / serialization errors
    }
  }
  return value;
}

export function removeLS(key) {
  memory.delete(key);
  if (hasStorage) window.localStorage.removeItem(key);
}

export function clearAll() {
  memory.clear();
  if (hasStorage) window.localStorage.clear();
}