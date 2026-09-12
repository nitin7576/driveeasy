import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getNotificationsByUser, getUnreadCount, markAllRead, markNotificationRead, deleteNotification } from '../services/notificationService';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setUserId(localStorage.getItem('de_current_user') ? JSON.parse(localStorage.getItem('de_current_user')).id : null);
  }, []);

  const load = useCallback((id) => {
    if (!id) {
      setNotifications([]);
      setUnread(0);
      return;
    }
    setNotifications(getNotificationsByUser(id));
    setUnread(getUnreadCount(id));
  }, []);

  const refresh = useCallback(() => {
    load(userId || (localStorage.getItem('de_current_user') ? JSON.parse(localStorage.getItem('de_current_user')).id : null));
  }, [load, userId]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unread, load, refresh, markRead: markNotificationRead, markAll: markAllRead, remove: deleteNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);