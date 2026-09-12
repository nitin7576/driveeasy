import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, seedUsers } from '../services/authService';
import { seedCars } from '../services/carService';
import { seedBookings } from '../services/bookingService';
import { seedReviews } from '../services/reviewService';
import { seedCoupons } from '../services/couponService';
import { seedMaintenance } from '../services/maintenanceService';
import { seedNotifications } from '../services/notificationService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());

  useEffect(() => {
    seedUsers();
    seedCars();
    seedBookings();
    seedReviews();
    seedCoupons();
    seedMaintenance();
    seedNotifications();
  }, []);

  const refresh = () => setUser(getCurrentUser());

  const login = (u) => {
    setUser({ id: u.id, role: u.role, name: u.name, email: u.email });
  };

  const logout = () => {
    window.localStorage.removeItem('de_current_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, refresh }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);