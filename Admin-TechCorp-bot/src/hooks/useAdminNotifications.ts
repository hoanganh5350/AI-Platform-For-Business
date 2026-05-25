import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface AdminNotification {
  id: string; // requestId
  requestId: string;
  action: string;
  targetType: string;
  createdBy: string;
  targetName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const SOCKET_URL = 'http://localhost:5000';
const STORAGE_KEY = 'admin_notifications';

const getUsernameFromToken = (token: string): string | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload).userName || null;
  } catch {
    return null;
  }
};

const loadFromStorage = (): AdminNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (notifications: AdminNotification[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch { /* ignore */ }
};

export const useAdminNotifications = (
  role: string | null,
  onNewNotification?: (requestId: string, message: string) => void
) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => loadFromStorage());
  const socketRef = useRef<Socket | null>(null);

  const isAdmin = role === 'ADMIN' || role === 'ADMIN_SYSTEM';

  // Persist to storage whenever notifications change
  useEffect(() => {
    saveToStorage(notifications);
  }, [notifications]);

  // Connect Socket.IO only for admin roles
  useEffect(() => {
    if (!isAdmin) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to notification server');
    });

    socket.on('new_notification', (data: Omit<AdminNotification, 'id' | 'read'>) => {
      const newItem: AdminNotification = {
        ...data,
        id: data.requestId,
        read: false,
      };
      setNotifications((prev) => {
        // Avoid duplicates
        if (prev.some((n) => n.requestId === newItem.requestId)) return prev;

        // Only trigger toast alert if this notification was NOT created by the current admin
        const currentUserName = getUsernameFromToken(token);
        if (data.createdBy !== currentUserName) {
          onNewNotification?.(newItem.requestId, data.message);
        }

        return [newItem, ...prev].slice(0, 50); // keep last 50
      });
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAdmin, onNewNotification]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markSingleRead = useCallback((requestId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.requestId === requestId ? { ...n, read: true } : n))
    );
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  return { notifications, unreadCount, hasUnread, markAllRead, markSingleRead };
};
