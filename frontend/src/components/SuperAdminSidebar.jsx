import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PremiumIcon } from './PremiumIcon';
import { KPI_ICONS } from './IconMapping';
import { 
  LayoutDashboard, 
  Building2, 
  ShieldAlert, 
  UserCheck, 
  Users, 
  Warehouse, 
  CreditCard, 
  FileText, 
  Ticket, 
  History, 
  Settings, 
  Sparkles, 
  Bell, 
  User,
  LogOut 
} from 'lucide-react';

export default function SuperAdminSidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard, gradient: ['#3b82f6', '#06b6d4'] },
    { name: 'Organizations', path: '/super-admin/organizations', icon: Building2, gradient: KPI_ICONS.organizations.gradient },
    { name: 'Admins', path: '/super-admin/admins', icon: ShieldAlert, gradient: KPI_ICONS.admins.gradient },
    { name: 'Staff Management', path: '/super-admin/staff', icon: UserCheck, gradient: KPI_ICONS.customers.gradient },

    { name: 'Warehouses', path: '/super-admin/warehouses', icon: Warehouse, gradient: KPI_ICONS.warehouse.gradient },
    { name: 'Payments', path: '/super-admin/payments', icon: CreditCard, gradient: KPI_ICONS.payments.gradient },
    { name: 'Lease Management', path: '/super-admin/leases', icon: FileText, gradient: KPI_ICONS.lease.gradient },
    { name: 'Ticket Management', path: '/super-admin/tickets', icon: Ticket, gradient: ['#ef4444', '#f43f5e'] },
    { name: 'Audit Logs', path: '/super-admin/audit-logs', icon: History, gradient: KPI_ICONS.audit.gradient },
    { name: 'Configuration', path: '/super-admin/config', icon: Settings, gradient: KPI_ICONS.configuration.gradient },
    { name: 'Subscriptions', path: '/super-admin/subscriptions', icon: Sparkles, gradient: ['#f59e0b', '#f97316'] },
    { name: 'Notifications', path: '/super-admin/notifications', icon: Bell, gradient: KPI_ICONS.notifications.gradient },
    { name: 'Profile', path: '/super-admin/profile', icon: User, gradient: ['#10b981', '#3b82f6'] },
  ];

  return (
    <aside className="w-60 bg-sidebar-bg backdrop-blur-2xl flex flex-col border-r border-white/10 h-screen fixed left-0 top-0 z-30 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      {/* Brand Header */}
      <div className="h-[72px] flex items-center border-b border-white/10 w-full shrink-0">
        <div className="flex items-center group cursor-pointer w-full" style={{ minWidth: '220px', paddingLeft: '24px' }}>
          <img 
            src="/rentalyze-logo.jpg" 
            alt="Rentalyze Logo" 
            className="h-[42px] sm:h-[48px] w-auto object-contain mix-blend-screen group-hover:scale-[1.03] transition-transform duration-300"
          />
          <span className="text-[20px] sm:text-[24px] font-[800] tracking-[0.8px] text-white whitespace-nowrap ml-[14px] group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all duration-300">
            RENTALYZE
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-4 px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] ring-1 ring-white/20'
                    : 'text-sidebar-text hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <PremiumIcon 
                    icon={item.icon} 
                    size="sidebar" 
                    isActive={isActive} 
                    gradient={item.gradient} 
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile Area */}
      <div className="p-4 border-t border-white/10 flex flex-col space-y-3 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-amber-500">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Super Admin'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'superadmin@inventory.com'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-white hover:bg-rose-600/10 border border-rose-500/20 hover:border-rose-500/40 transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
