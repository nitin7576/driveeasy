import { KEYS, getLS, setLS } from '../utils/storage';
import { COUPON_DATA } from '../data/mockData';
import { uid } from '../utils/helpers';
import { isCouponValid } from '../utils/pricing';

export function seedCoupons() {
  if (!getLS(KEYS.COUPONS).length) setLS(KEYS.COUPONS, COUPON_DATA);
  return getLS(KEYS.COUPONS);
}

export function getCoupons() {
  const c = getLS(KEYS.COUPONS);
  if (!c.length) return seedCoupons();
  return c;
}

export function getCouponByCode(code) {
  return getCoupons().find((c) => c.code.toLowerCase() === String(code || '').toLowerCase()) || null;
}

export function validateCoupon(code, baseRental) {
  const coupon = getCouponByCode(code);
  if (!coupon) return { valid: false, message: 'Coupon not found' };
  const now = Date.now();
  if (coupon.status !== 'active') return { valid: false, message: 'Coupon is not active' };
  if (coupon.expiryDate && new Date(coupon.expiryDate).getTime() < now) {
    return { valid: false, message: 'Coupon has expired' };
  }
  if (coupon.startDate && new Date(coupon.startDate).getTime() > now) {
    return { valid: false, message: 'Coupon is not yet active' };
  }
  if (Number(coupon.minBookingAmount) > 0 && baseRental < Number(coupon.minBookingAmount)) {
    return { valid: false, message: `Minimum booking amount of ₹${coupon.minBookingAmount} required` };
  }
  if (Number(coupon.usageLimit) > 0 && Number(coupon.usedCount) >= Number(coupon.usageLimit)) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  if (!isCouponValid(coupon, baseRental)) return { valid: false, message: 'Coupon is not applicable' };
  return { valid: true, coupon };
}

export function consumeCoupon(code) {
  const coupons = getCoupons();
  const idx = coupons.findIndex((c) => c.code.toLowerCase() === String(code || '').toLowerCase());
  if (idx < 0) return;
  coupons[idx] = { ...coupons[idx], usedCount: (Number(coupons[idx].usedCount) || 0) + 1 };
  setLS(KEYS.COUPONS, coupons);
}

export function addCoupon(data) {
  const coupons = getCoupons();
  const coupon = { id: uid('CP'), ...data, usedCount: Number(data.usedCount) || 0 };
  coupons.unshift(coupon);
  setLS(KEYS.COUPONS, coupons);
  return coupon;
}

export function updateCoupon(id, data) {
  const coupons = getCoupons();
  const idx = coupons.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  coupons[idx] = { ...coupons[idx], ...data };
  setLS(KEYS.COUPONS, coupons);
  return coupons[idx];
}

export function deleteCoupon(id) {
  setLS(KEYS.COUPONS, getCoupons().filter((c) => c.id !== id));
}