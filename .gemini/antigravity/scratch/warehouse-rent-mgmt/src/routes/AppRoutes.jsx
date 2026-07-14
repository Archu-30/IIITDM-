import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Auth Pages
import Login from '../pages/auth/Login';
import OTPVerification from '../pages/auth/OTPVerification';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Layouts
import TenantLayout from '../layouts/TenantLayout';
import AdminLayout from '../layouts/AdminLayout';
import StaffLayout from '../layouts/StaffLayout';

// Tenant Pages
import TenantDashboard from '../pages/tenant/TenantDashboard';
import RentOverview from '../pages/tenant/RentOverview';
import Payments from '../pages/tenant/Payments';
import LeaseDetails from '../pages/tenant/LeaseDetails';
import SupportTickets from '../pages/tenant/SupportTickets';
import Notifications from '../pages/tenant/Notifications';
import TenantProfile from '../pages/tenant/TenantProfile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import WarehouseManagement from '../pages/admin/WarehouseManagement';
import TenantManagement from '../pages/admin/TenantManagement';
import PaymentManagement from '../pages/admin/PaymentManagement';
import LeaseManagement from '../pages/admin/LeaseManagement';
import TicketMonitoring from '../pages/admin/TicketMonitoring';
import Reports from '../pages/admin/Reports';
import SystemSettings from '../pages/admin/SystemSettings';

// Staff Pages
import StaffDashboard from '../pages/staff/StaffDashboard';
import AssignedTickets from '../pages/staff/AssignedTickets';
import CustomerRecords from '../pages/staff/CustomerRecords';
import StaffNotifications from '../pages/staff/StaffNotifications';

// Simple Route Guard to protect paths based on roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If authenticated but wrong role, redirect to corresponding role home
    return <Navigate to={`/${user?.role}/dashboard`} replace />;
  }

  return children;
};

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/${user?.role}/dashboard`} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root Path redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/otp-verification" element={<OTPVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Tenant Routes */}
      <Route
        path="/tenant"
        element={
          <ProtectedRoute allowedRoles={['tenant']}>
            <TenantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TenantDashboard />} />
        <Route path="rent-overview" element={<RentOverview />} />
        <Route path="payments" element={<Payments />} />
        <Route path="lease" element={<LeaseDetails />} />
        <Route path="tickets" element={<SupportTickets />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<TenantProfile />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="warehouses" element={<WarehouseManagement />} />
        <Route path="tenants" element={<TenantManagement />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="leases" element={<LeaseManagement />} />
        <Route path="tickets" element={<TicketMonitoring />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<SystemSettings />} />
      </Route>

      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="assigned-tickets" element={<AssignedTickets />} />
        <Route path="customer-records" element={<CustomerRecords />} />
        <Route path="notifications" element={<StaffNotifications />} />
      </Route>

      {/* Fallback to Root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
