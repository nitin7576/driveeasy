import { KEYS, getLS, setLS } from '../utils/storage';
import { uid, txnId } from '../utils/helpers';

export function getPayments() {
  const stored = getLS(KEYS.PAYMENTS);
  const bookings = getLS(KEYS.BOOKINGS);
  const derived = (bookings || [])
    .filter((b) => b.transactionId && b.paymentStatus && b.paymentStatus !== 'pending')
    .map((b) => ({
      id: `DP-${b.id}`,
      transactionId: b.transactionId,
      bookingId: b.id,
      customerId: b.userId,
      amount: Number(b.pricing?.finalAmount || b.pricing?.total || 0),
      method: 'card',
      date: b.createdAt ? `${b.createdAt}T10:00:00` : `${b.pickupDate}T10:00:00`,
      status: b.paymentStatus,
      derived: true,
    }));
  const seen = new Set(stored.map((p) => p.bookingId));
  return [...stored, ...derived.filter((d) => !seen.has(d.bookingId))];
}

export function createPayment({ bookingId, customerId, amount, method }) {
  const payments = getLS(KEYS.PAYMENTS);
  const payment = {
    id: uid('PAY'),
    transactionId: txnId(),
    bookingId,
    customerId,
    amount,
    method,
    date: new Date().toISOString(),
    status: 'paid',
  };
  payments.push(payment);
  setLS(KEYS.PAYMENTS, payments);
  return payment;
}

export function getPaymentsByUser(userId) {
  return getPayments().filter((p) => p.customerId === userId);
}

export function updatePaymentStatus(id, status) {
  const payments = getLS(KEYS.PAYMENTS);
  const idx = payments.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  payments[idx].status = status;
  setLS(KEYS.PAYMENTS, payments);
  return payments[idx];
}

export function deletePayment(id) {
  setLS(KEYS.PAYMENTS, getLS(KEYS.PAYMENTS).filter((p) => p.id !== id));
}

export function getPaymentByBooking(bookingId) {
  return getPayments().find((p) => p.bookingId === bookingId) || null;
}