import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  MOCK_USERS,
  MOCK_WAREHOUSES,
  MOCK_TENANTS,
  MOCK_PAYMENTS,
  MOCK_LEASES,
  MOCK_TICKETS,
  MOCK_NOTIFICATIONS,
  MOCK_SETTINGS
} from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wh_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('wh_auth') === 'true';
  });
  const [tempUser, setTempUser] = useState(null); // Used to bridge login and OTP steps

  // System Entities State (initialized from Mock Data or LocalStorage)
  const [warehouses, setWarehouses] = useState(() => {
    const saved = localStorage.getItem('wh_warehouses');
    return saved ? JSON.parse(saved) : MOCK_WAREHOUSES;
  });

  const [tenants, setTenants] = useState(() => {
    const saved = localStorage.getItem('wh_tenants');
    return saved ? JSON.parse(saved) : MOCK_TENANTS;
  });

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('wh_payments');
    return saved ? JSON.parse(saved) : MOCK_PAYMENTS;
  });

  const [leases, setLeases] = useState(() => {
    const saved = localStorage.getItem('wh_leases');
    return saved ? JSON.parse(saved) : MOCK_LEASES;
  });

  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('wh_tickets');
    return saved ? JSON.parse(saved) : MOCK_TICKETS;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('wh_notifications');
    return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('wh_settings');
    return saved ? JSON.parse(saved) : MOCK_SETTINGS;
  });

  // Sync state to local storage when it changes
  useEffect(() => {
    localStorage.setItem('wh_warehouses', JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem('wh_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('wh_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('wh_leases', JSON.stringify(leases));
  }, [leases]);

  useEffect(() => {
    localStorage.setItem('wh_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('wh_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('wh_settings', JSON.stringify(settings));
  }, [settings]);

  // Auth Operations
  const login = (username, password) => {
    const foundUser = MOCK_USERS.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (foundUser) {
      setTempUser(foundUser);
      return { success: true, user: foundUser };
    }
    return { success: false, message: "Invalid username or password" };
  };

  const verifyOtp = (otpCode) => {
    if (otpCode === '123456' && tempUser) {
      setUser(tempUser);
      setIsAuthenticated(true);
      localStorage.setItem('wh_user', JSON.stringify(tempUser));
      localStorage.setItem('wh_auth', 'true');
      setTempUser(null);
      return { success: true, role: tempUser.role };
    }
    return { success: false, message: "Invalid OTP code. Try '123456'." };
  };

  const sendForgotPassword = (email) => {
    const foundUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      return { success: true, message: `A reset OTP and instructions have been emailed to ${email}.` };
    }
    return { success: false, message: "Email address not found." };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('wh_user');
    localStorage.removeItem('wh_auth');
  };

  // Profile Update
  const updateProfile = (updatedData) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('wh_user', JSON.stringify(newUser));
      // Update in users array if we track it dynamically
    }
  };

  // Add Document
  const uploadDocument = (docName, size) => {
    if (user) {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: docName,
        date: new Date().toISOString().split('T')[0],
        size: size || '1.5 MB'
      };
      const updatedDocs = [...(user.documents || []), newDoc];
      updateProfile({ documents: updatedDocs });
    }
  };

  // Data Operations: Warehouse
  const addWarehouse = (wh) => {
    const newWh = {
      id: `wh-${Date.now()}`,
      ...wh,
      status: wh.status || 'Available'
    };
    setWarehouses((prev) => [newWh, ...prev]);
  };

  const updateWarehouse = (id, updatedFields) => {
    setWarehouses((prev) =>
      prev.map((wh) => (wh.id === id ? { ...wh, ...updatedFields } : wh))
    );
  };

  // Data Operations: Tenant
  const addTenant = (tenant) => {
    const newTenant = {
      id: `tenant-${Date.now()}`,
      ...tenant,
      status: 'Active'
    };
    setTenants((prev) => [newTenant, ...prev]);
  };

  const updateTenant = (id, updatedFields) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
  };

  // Data Operations: Payments
  const addPayment = (paymentData) => {
    const newPay = {
      id: `pay-${Date.now()}`,
      tenantId: user?.id || 'user-1',
      tenantName: user?.name || 'John Doe',
      businessName: user?.businessName || 'Acme Logistics Corp',
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0], // 15 days out
      payDate: new Date().toISOString().split('T')[0],
      status: 'Paid',
      ...paymentData
    };
    setPayments((prev) => [newPay, ...prev]);

    // Send Admin notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      role: 'admin',
      type: 'Payment Notification',
      title: 'Rent Paid Online',
      message: `${newPay.businessName} made a payment of $${newPay.amount} for ${newPay.month}.`,
      time: 'Just now',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const approvePayment = (payId) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === payId ? { ...p, status: 'Paid', payDate: new Date().toISOString().split('T')[0] } : p))
    );
  };

  // Data Operations: Tickets
  const addTicket = (ticketData) => {
    const newTkt = {
      id: `tkt-${Date.now()}`,
      tenantId: user?.id || 'user-1',
      tenantName: user?.name || 'John Doe',
      businessName: user?.businessName || 'Acme Logistics Corp',
      status: 'Open',
      assignedStaff: 'Unassigned',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      internalNotes: [],
      resolutionFiles: [],
      ...ticketData
    };
    setTickets((prev) => [newTkt, ...prev]);

    // Notify Admin
    const adminNotif = {
      id: `notif-adm-${Date.now()}`,
      role: 'admin',
      type: 'Ticket Alert',
      title: 'New Support Ticket Created',
      message: `${newTkt.businessName} submitted: "${newTkt.title}"`,
      time: 'Just now',
      read: false
    };
    setNotifications((prev) => [adminNotif, ...prev]);
  };

  const updateTicket = (id, updatedFields) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const merged = { ...t, ...updatedFields, updatedAt: new Date().toISOString().split('T')[0] };

          // Notify Tenant of ticket updates
          if (updatedFields.status && updatedFields.status !== t.status) {
            const tktNotif = {
              id: `notif-tkt-${Date.now()}`,
              role: 'tenant',
              userId: t.tenantId,
              type: 'Ticket Update',
              title: `Ticket ${t.id} Update`,
              message: `Your ticket status has been changed to "${updatedFields.status}".`,
              time: 'Just now',
              read: false
            };
            setNotifications((prevNotif) => [tktNotif, ...prevNotif]);
          }

          return merged;
        }
        return t;
      })
    );
  };

  // System Settings Update
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Mark all notifications for the current role as read
  const markNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.role === user?.role && (n.role !== 'tenant' || n.userId === user?.id)) {
          return { ...n, read: true };
        }
        return n;
      })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        tempUser,
        warehouses,
        tenants,
        payments,
        leases,
        tickets,
        notifications,
        settings,
        login,
        verifyOtp,
        sendForgotPassword,
        logout,
        updateProfile,
        uploadDocument,
        addWarehouse,
        updateWarehouse,
        addTenant,
        updateTenant,
        addPayment,
        approvePayment,
        addTicket,
        updateTicket,
        updateSettings,
        markNotificationsRead
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
