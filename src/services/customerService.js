import { getAllUsers } from './authService';
import { getBookings } from './bookingService';
import { getReviews } from './reviewService';

export function getCustomers() {
  return getAllUsers().filter((u) => u.role === 'customer');
}

export function getCustomerById(id) {
  return getCustomers().find((c) => c.id === id) || null;
}

export function getCustomerStats(id) {
  const bookings = getBookings().filter((b) => b.userId === id);
  const totalSpent = bookings.reduce(
    (sum, b) => sum + (b.pricing?.finalAmount || b.pricing?.total || 0),
    0
  );
  return {
    totalBookings: bookings.length,
    activeBookings: bookings.filter((b) => b.status === 'active').length,
    upcomingBookings: bookings.filter((b) => b.status === 'confirmed' && b.pickupDate > new Date().toISOString().split('T')[0]).length,
    completedBookings: bookings.filter((b) => b.status === 'completed').length,
    cancelledBookings: bookings.filter((b) => b.status === 'cancelled').length,
    totalSpent,
  };
}

export function getCustomerAggregate() {
  const customers = getCustomers();
  return customers.map((c) => {
    const bookings = getBookings().filter((b) => b.userId === c.id);
    const totalSpend = bookings.reduce(
      (sum, b) => sum + (b.pricing?.finalAmount || b.pricing?.total || 0),
      0
    );
    return {
      ...c,
      bookings: bookings.length,
      totalSpend,
      reviews: getReviews().filter((r) => r.userId === c.id).length,
    };
  });
}