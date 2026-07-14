import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerContactLeasing from './pages/CustomerContactLeasing';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';
import AdminStock from './pages/AdminStock';
import AdminTransactions from './pages/AdminTransactions';
import AdminUsers from './pages/AdminUsers';
import AdminLeaseInformation from './pages/AdminLeaseInformation';
import AdminNotifications from './pages/AdminNotifications';
import AdminOrders from './pages/AdminOrders';

// Super Admin Pages
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard';
import Organizations from './pages/superAdmin/Organizations';
import AdminManagement from './pages/superAdmin/AdminManagement';
import StaffManagement from './pages/superAdmin/StaffManagement';
import TenantManagement from './pages/superAdmin/TenantManagement';
import WarehouseManagement from './pages/superAdmin/WarehouseManagement';
import PaymentManagement from './pages/superAdmin/PaymentManagement';
import LeaseManagement from './pages/superAdmin/LeaseManagement';
import TicketManagement from './pages/superAdmin/TicketManagement';
import AuditLogs from './pages/superAdmin/AuditLogs';
import SystemConfiguration from './pages/superAdmin/SystemConfiguration';
import SubscriptionPlans from './pages/superAdmin/SubscriptionPlans';
import Notifications from './pages/superAdmin/Notifications';
import SuperAdminProfile from './pages/superAdmin/SuperAdminProfile';

export default function App() {
  const { auth } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user session on load / refresh
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Keep local user state in sync with auth context changes
  useEffect(() => {
    if (auth) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  }, [auth]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Derive effective role from context (auth) or legacy state
  const effectiveRole = auth?.role || user?.role || null;
  const isAuthenticated = !!(auth?.token || localStorage.getItem('token'));

  // Route Guard: Needs Authentication
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
  };

  // Route Guard: SuperAdmin-Only Route
  const SuperAdminRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (effectiveRole && effectiveRole !== 'super_admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return children;
  };

  // Route Guard: Admin + Seller Route (both can access admin views)
  const AdminRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (effectiveRole && effectiveRole !== 'admin' && effectiveRole !== 'super_admin' && effectiveRole !== 'seller') {
      return <Navigate to="/customer/inventory" replace />;
    }
    return children;
  };

  // Route Guard: Customer-Only Route
  const CustomerRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (effectiveRole && effectiveRole !== 'customer') {
      if (effectiveRole === 'super_admin') return <Navigate to="/super-admin/dashboard" replace />;
      if (effectiveRole === 'seller') return <Navigate to="/seller/dashboard" replace />;
      return <Navigate to="/admin/dashboard" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      {/* react-hot-toast notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Auth Route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              effectiveRole === 'super_admin'
                ? <Navigate to="/super-admin/dashboard" replace />
                : effectiveRole === 'admin'
                ? <Navigate to="/admin/dashboard" replace />
                : effectiveRole === 'seller'
                ? <Navigate to="/seller/dashboard" replace />
                : <Navigate to="/customer/inventory" replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />

        {/* Role-shortcut redirects */}
        <Route path="/customer" element={<Navigate to="/customer/inventory" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
        {/* Seller → reuse admin dashboard, filtered by role */}
        <Route 
          path="/seller/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard user={user} onLogout={handleLogout} />
            </AdminRoute>
          } 
        />

        {/* Customer Portal */}
        <Route 
          path="/customer/inventory" 
          element={
            <CustomerRoute>
              <CustomerDashboard user={user} onLogout={handleLogout} />
            </CustomerRoute>
          } 
        />
        <Route 
          path="/customer/contact-leasing" 
          element={
            <CustomerRoute>
              <CustomerContactLeasing user={user} onLogout={handleLogout} />
            </CustomerRoute>
          } 
        />
        <Route 
          path="/customer/my-orders" 
          element={
            <CustomerRoute>
              <MyOrders user={user} onLogout={handleLogout} />
            </CustomerRoute>
          } 
        />

        {/* Admin Portal */}
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard user={user} onLogout={handleLogout} />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/inventory" 
          element={
            <AdminRoute>
              <AdminStock user={user} onLogout={handleLogout} />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/transactions" 
          element={
            <AdminRoute>
              <AdminTransactions user={user} onLogout={handleLogout} />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <AdminUsers user={user} onLogout={handleLogout} />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/lease-information" 
          element={
            <AdminRoute>
              <AdminLeaseInformation user={user} onLogout={handleLogout} />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/notifications" 
          element={
            <AdminRoute>
              <AdminNotifications user={user} onLogout={handleLogout} />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/orders" 
          element={
            <AdminRoute>
              <AdminOrders user={user} onLogout={handleLogout} />
            </AdminRoute>
          } 
        />

        {/* Super Admin Portal */}
        <Route 
          path="/super-admin/dashboard" 
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />
        <Route 
          path="/super-admin/organizations" 
          element={
            <SuperAdminRoute>
              <Organizations user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />
        <Route 
          path="/super-admin/admins" 
          element={
            <SuperAdminRoute>
              <AdminManagement user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />
        <Route 
          path="/super-admin/staff" 
          element={
            <SuperAdminRoute>
              <StaffManagement user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />
        <Route 
          path="/super-admin/tenants" 
          element={
            <SuperAdminRoute>
              <TenantManagement user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />
        <Route 
          path="/super-admin/warehouses" 
          element={
            <SuperAdminRoute>
              <WarehouseManagement user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />
        <Route 
          path="/super-admin/payments" 
          element={
            <SuperAdminRoute>
              <PaymentManagement user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />
        <Route 
          path="/super-admin/leases" 
          element={
            <SuperAdminRoute>
              <LeaseManagement user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />
        <Route 
          path="/super-admin/tickets" 
          element={
            <SuperAdminRoute>
              <TicketManagement user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />
        <Route 
          path="/super-admin/audit-logs" 
          element={
            <SuperAdminRoute>
              <AuditLogs user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />
        <Route 
          path="/super-admin/config" 
          element={
            <SuperAdminRoute>
              <SystemConfiguration user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />
        <Route 
          path="/super-admin/subscriptions" 
          element={
            <SuperAdminRoute>
              <SubscriptionPlans user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />
        <Route 
          path="/super-admin/notifications" 
          element={
            <SuperAdminRoute>
              <Notifications user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />
        <Route 
          path="/super-admin/profile" 
          element={
            <SuperAdminRoute>
              <SuperAdminProfile user={user} onLogout={handleLogout} />
            </SuperAdminRoute>
          } 
        />

        {/* Fallbacks */}
        <Route 
          path="*" 
          element={
            isAuthenticated
              ? (effectiveRole === 'super_admin' 
                  ? <Navigate to="/super-admin/dashboard" replace />
                  : effectiveRole === 'admin'
                  ? <Navigate to="/admin/dashboard" replace />
                  : effectiveRole === 'seller'
                  ? <Navigate to="/seller/dashboard" replace />
                  : <Navigate to="/customer/inventory" replace />)
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
