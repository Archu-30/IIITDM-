// context/NotificationContext.jsx
// Global, real-time notification context using Socket.IO.
// Falls back to API polling if socket is disconnected.

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { toastSuccess } from '../components/Toast';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { auth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  // Fetch initial notifications list and count
  const fetchNotifications = async () => {
    if (!auth?.token) return;
    try {
      const [countRes, myRes] = await Promise.all([
        api.get('/notifications/unread-count'),
        api.get('/notifications/my')
      ]);
      setUnreadCount(countRes.data.count || 0);
      setNotifications(myRes.data || []);
    } catch (err) {
      console.error('Failed to fetch initial notifications:', err);
    }
  };

  // Mark a single notification as read
  const markRead = async (id) => {
    try {
      await api.post(`/notifications/mark-read/${id}`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Initialize socket connection and sync
  useEffect(() => {
    if (!auth?.token) {
      // Clear notification state on logout
      setNotifications([]);
      setUnreadCount(0);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Fetch initial list
    fetchNotifications();

    // Connect to Socket.IO — use current origin so Vite proxy forwards it correctly
    const serverUrl = window.location.origin;

    const socket = io(serverUrl, {
      auth: { token: auth.token },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[NotificationContext] Connected to real-time notification socket');
    });

    // Real-time event handler
    socket.on('new_notification', (notification) => {
      console.log('[NotificationContext] Received real-time notification:', notification);
      
      // Prepend the new notification
      setNotifications(prev => [notification, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);

      // Trigger beautiful UI toast announcement
      toastSuccess(`${notification.title}\n${notification.message}`);
    });

    socket.on('disconnect', () => {
      console.log('[NotificationContext] Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.warn('[NotificationContext] Socket connection error:', err.message);
    });

    // Fallback: poll unread count and latest list every 20 seconds
    const intervalId = setInterval(fetchNotifications, 20000);

    return () => {
      clearInterval(intervalId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [auth]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
