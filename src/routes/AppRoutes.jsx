import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/public/HomePage';
import CarsPage from '../pages/public/CarsPage';
import CarDetailsPage from '../pages/public/CarDetailsPage';
import AboutPage from '../pages/public/AboutPage';
import ContactPage from '../pages/public/ContactPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import NotFoundPage from '../pages/public/NotFoundPage';

import BookingPage from '../pages/booking/BookingPage';
import BookingConfirmation from '../pages/booking/BookingConfirmation';
import InvoicePage from '../pages/booking/InvoicePage';

import ProtectedRoute from '../components/common/ProtectedRoute';

import CustomerDashboard from '../pages/customer/CustomerDashboard';
import CustomerProfile from '../pages/customer/CustomerProfile';
import CustomerBookings from '../pages/customer/CustomerBookings';
import CustomerPayments from '../pages/customer/CustomerPayments';
import CustomerInvoices from '../pages/customer/CustomerInvoices';
import CustomerWishlist from '../pages/customer/CustomerWishlist';
import CustomerReviews from '../pages/customer/CustomerReviews';
import CustomerNotifications from '../pages/customer/CustomerNotifications';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminCars from '../pages/admin/AdminCars';
import AdminCustomers from '../pages/admin/AdminCustomers';
import AdminBookings from '../pages/admin/AdminBookings';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminMaintenance from '../pages/admin/AdminMaintenance';
import AdminReviews from '../pages/admin/AdminReviews';
import AdminCoupons from '../pages/admin/AdminCoupons';
import AdminReports from '../pages/admin/AdminReports';
import AdminSettings from '../pages/admin/AdminSettings';

import StaffDashboard from '../pages/staff/StaffDashboard';
import StaffPickups from '../pages/staff/StaffPickups';
import StaffReturns from '../pages/staff/StaffReturns';
import StaffInspection from '../pages/staff/StaffInspection';
import StaffMaintenance from '../pages/staff/StaffMaintenance';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cars" element={<CarsPage />} />
      <Route path="/cars/:carId" element={<CarDetailsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/booking/:carId" element={<BookingPage />} />
      <Route path="/booking/confirmation/:bookingId" element={<BookingConfirmation />} />
      <Route path="/invoice/:bookingId" element={<InvoicePage />} />

      <Route path="/customer/dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/profile" element={<ProtectedRoute roles={['customer']}><CustomerProfile /></ProtectedRoute>} />
      <Route path="/customer/bookings" element={<ProtectedRoute roles={['customer']}><CustomerBookings /></ProtectedRoute>} />
      <Route path="/customer/payments" element={<ProtectedRoute roles={['customer']}><CustomerPayments /></ProtectedRoute>} />
      <Route path="/customer/invoices" element={<ProtectedRoute roles={['customer']}><CustomerInvoices /></ProtectedRoute>} />
      <Route path="/customer/wishlist" element={<ProtectedRoute roles={['customer']}><CustomerWishlist /></ProtectedRoute>} />
      <Route path="/customer/reviews" element={<ProtectedRoute roles={['customer']}><CustomerReviews /></ProtectedRoute>} />
      <Route path="/customer/notifications" element={<ProtectedRoute roles={['customer']}><CustomerNotifications /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/cars" element={<ProtectedRoute roles={['admin']}><AdminCars /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute roles={['admin']}><AdminCustomers /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute roles={['admin']}><AdminBookings /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />
      <Route path="/admin/maintenance" element={<ProtectedRoute roles={['admin']}><AdminMaintenance /></ProtectedRoute>} />
      <Route path="/admin/reviews" element={<ProtectedRoute roles={['admin']}><AdminReviews /></ProtectedRoute>} />
      <Route path="/admin/coupons" element={<ProtectedRoute roles={['admin']}><AdminCoupons /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>} />

      <Route path="/staff/dashboard" element={<ProtectedRoute roles={['staff']}><StaffDashboard /></ProtectedRoute>} />
      <Route path="/staff/pickups" element={<ProtectedRoute roles={['staff']}><StaffPickups /></ProtectedRoute>} />
      <Route path="/staff/returns" element={<ProtectedRoute roles={['staff']}><StaffReturns /></ProtectedRoute>} />
      <Route path="/staff/inspection" element={<ProtectedRoute roles={['staff']}><StaffInspection /></ProtectedRoute>} />
      <Route path="/staff/maintenance" element={<ProtectedRoute roles={['staff']}><StaffMaintenance /></ProtectedRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}