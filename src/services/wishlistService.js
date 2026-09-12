import { KEYS, getLS, setLS } from '../utils/storage';

export function getWishlist(userId) {
  const all = getLS(KEYS.WISHLIST);
  return all.filter((w) => w.userId === userId);
}

export function isInWishlist(userId, carId) {
  return getLS(KEYS.WISHLIST).some((w) => w.userId === userId && w.carId === carId);
}

export function toggleWishlist(userId, carId) {
  const all = getLS(KEYS.WISHLIST);
  const idx = all.findIndex((w) => w.userId === userId && w.carId === carId);
  if (idx >= 0) {
    all.splice(idx, 1);
    setLS(KEYS.WISHLIST, all);
    return false;
  }
  all.push({ userId, carId, addedAt: new Date().toISOString() });
  setLS(KEYS.WISHLIST, all);
  return true;
}

export function removeFromWishlist(userId, carId) {
  setLS(KEYS.WISHLIST, getLS(KEYS.WISHLIST).filter((w) => !(w.userId === userId && w.carId === carId)));
}