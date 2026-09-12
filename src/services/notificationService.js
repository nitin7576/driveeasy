import { KEYS, getLS, setLS } from '../utils/storage';
import { NOTIFICATION_DATA } from '../data/mockData';
import { uid } from '../utils/helpers';

export function seedNotifications() {
  if (!getLS(KEYS.NOTIFICATIONS).length) setLS(KEYS.NOTIFICATIONS, NOTIFICATION_DATA);
  return getLS(KEYS.NOTIFICATIONS);
}

export function getNotifications() {
  const n = getLS(KEYS.NOTIFICATIONS);
  if (!n.length) return seedNotifications();
  return n;
}

export function getNotificationsByUser(userId) {
  return getNotifications()
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getUnreadCount(userId) {
  return getNotificationsByUser(userId).filter((n) => !n.read).length;
}

export function addNotification({ userId, message, type = 'info' }) {
  const items = getNotifications();
  const notification = {
    id: uid('NF'),
    userId,
    message,
    type,
    read: false,
    date: new Date().toISOString().split('T')[0],
  };
  items.unshift(notification);
  setLS(KEYS.NOTIFICATIONS, items);
  return notification;
}

export function markNotificationRead(id) {
  const items = getNotifications();
  const idx = items.findIndex((n) => n.id === id);
  if (idx < 0) return null;
  items[idx].read = true;
  setLS(KEYS.NOTIFICATIONS, items);
  return items[idx];
}

export function markAllRead(userId) {
  const items = getNotifications().map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  );
  setLS(KEYS.NOTIFICATIONS, items);
}

export function deleteNotification(id) {
  setLS(KEYS.NOTIFICATIONS, getNotifications().filter((n) => n.id !== id));
}