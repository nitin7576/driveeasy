import { KEYS, getLS, setLS } from '../utils/storage';
import { BOOKING_DATA } from '../data/mockData';
import { uid } from '../utils/helpers';
import { computeBookingPricing } from '../utils/pricing';

function normalize(p) {
  const b = { ...p };
  if (b.status === 'upcoming') b.status = 'confirmed';
  if (b.status === 'rejected') b.status = 'cancelled';
  if (b.pricing && b.pricing.baseRental === undefined && b.pricing.subtotal !== undefined) {
    const days = Math.max(1, Number(b.pricing.days) || 1);
    const perDay = Number(b.pricing.perDay) || 0;
    b.pricing = {
      ...b.pricing,
      pricePerDay: perDay,
      rentalDays: days,
      baseRental: Number(b.pricing.subtotal) || perDay * days,
      insurance: 0,
      taxes: 0,
      additionalCharges: 0,
      fuelCharges: 0,
      damageCharges: 0,
      lateCharges: 0,
      otherCharges: 0,
      discount: 0,
      finalAmount: Number(b.pricing.total) || perDay * days,
      couponCode: b.couponCode || null,
    };
  }
  return b;
}

export function seedBookings() {
  if (!getLS(KEYS.BOOKINGS).length) setLS(KEYS.BOOKINGS, BOOKING_DATA.map(normalize));
  return getLS(KEYS.BOOKINGS);
}

export function getBookings() {
  const b = getLS(KEYS.BOOKINGS);
  if (!b.length) return seedBookings();
  return b.map(normalize);
}

export function getBookingById(id) {
  return getBookings().find((b) => b.id === id) || null;
}

export function getBookingsByUser(userId) {
  return getBookings().filter((b) => b.userId === userId);
}

export function getBookingsByCar(carId) {
  return getBookings().filter((b) => b.carId === carId);
}

export function isCarBooked(carId, pickupDate, returnDate, excludeBookingId) {
  const pd = new Date(pickupDate).getTime();
  const rd = new Date(returnDate).getTime();
  return getBookings().some((b) => {
    if (excludeBookingId && b.id === excludeBookingId) return false;
    if (b.carId !== carId) return false;
    if (['cancelled', 'rejected'].includes(b.status)) return false;
    const bp = new Date(b.pickupDate).getTime();
    const br = new Date(b.returnDate).getTime();
    return pd <= br && rd >= bp;
  });
}

export function createBooking({ carId, userId, carPricePerDay, pickupLocation, dropLocation, pickupDate, pickupTime, returnDate, returnTime, couponCode, coupon }) {
  const days = Math.max(1, Math.round((new Date(returnDate) - new Date(pickupDate)) / 86400000));
  const pricing = computeBookingPricing({ pricePerDay: carPricePerDay }, days, coupon);

  const booking = {
    id: uid('BK'),
    carId,
    userId,
    pickupLocation,
    dropLocation,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    status: 'confirmed',
    paymentStatus: 'paid',
    pricing,
    transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`,
    couponCode: couponCode || null,
    createdAt: new Date().toISOString().split('T')[0],
  };
  const bookings = getBookings();
  bookings.push(booking);
  setLS(KEYS.BOOKINGS, bookings);
  return booking;
}

export function updateBookingStatus(id, status) {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx < 0) return null;
  bookings[idx].status = status;
  setLS(KEYS.BOOKINGS, bookings);
  return bookings[idx];
}

export function cancelBooking(id) {
  return updateBookingStatus(id, 'cancelled');
}

export function deleteBooking(id) {
  setLS(KEYS.BOOKINGS, getBookings().filter((b) => b.id !== id));
}