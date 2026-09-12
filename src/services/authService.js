import { KEYS, getLS, setLS } from '../utils/storage';
import { DEMO_USERS } from '../data/mockData';

export function seedUsers() {
  if (!getLS(KEYS.USERS).length) setLS(KEYS.USERS, DEMO_USERS);
  return getLS(KEYS.USERS);
}

export function loginUser(email, password) {
  const users = getLS(KEYS.USERS);
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) return { error: 'Invalid email or password' };
  if (user.status === 'blocked') return { error: 'Account is blocked' };
  setLS(KEYS.CURRENT_USER, { id: user.id, role: user.role, name: user.name, email: user.email });
  return { user };
}

export function registerUser(data) {
  const users = getLS(KEYS.USERS);
  if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    return { error: 'Email already registered' };
  }
  const newUser = {
    id: `USR-${Date.now().toString(36).toUpperCase()}`,
    ...data,
    role: 'customer',
    regDate: new Date().toISOString().split('T')[0],
    status: 'active',
    license: { number: '', issueDate: '', expiryDate: '', verified: false },
  };
  users.push(newUser);
  setLS(KEYS.USERS, users);
  setLS(KEYS.CURRENT_USER, { id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email });
  return { user: newUser };
}

export function logoutUser() {
  window.localStorage.removeItem(KEYS.CURRENT_USER);
}

export function getCurrentUser() {
  return getLS(KEYS.CURRENT_USER, null);
}

export function updateUser(id, data) {
  const users = getLS(KEYS.USERS);
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  users[idx] = { ...users[idx], ...data };
  setLS(KEYS.USERS, users);
  return users[idx];
}

export function getAllUsers() {
  return getLS(KEYS.USERS);
}

export function getUserById(id) {
  return getLS(KEYS.USERS).find((u) => u.id === id) || null;
}

export function deleteUser(id) {
  const users = getLS(KEYS.USERS).filter((u) => u.id !== id);
  setLS(KEYS.USERS, users);
}

export function blockUser(id) {
  return updateUser(id, { status: 'blocked' });
}

export function unblockUser(id) {
  return updateUser(id, { status: 'active' });
}