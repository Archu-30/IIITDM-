import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Sliders, 
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
    { name: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
    { name: 'Organizations', path: '/super-admin/organizations', icon: Building2 },
    { name: 'Admins', path: '/super-admin/admins', icon: ShieldAlert },
    { name: 'Staff Management', path: '/super-admin/staff', icon: UserCheck },

    { name: 'Warehouses', path: '/super-admin/warehouses', icon: Warehouse },
    { name: 'Payments', path: '/super-admin/payments', icon: CreditCard },
    { name: 'Lease Management', path: '/super-admin/leases', icon: FileText },
    { name: 'Ticket Management', path: '/super-admin/tickets', icon: Ticket },
    { name: 'Audit Logs', path: '/super-admin/audit-logs', icon: History },
    { name: 'Configuration', path: '/super-admin/config', icon: Sliders },
    { name: 'Subscriptions', path: '/super-admin/subscriptions', icon: Sparkles },
    { name: 'Notifications', path: '/super-admin/notifications', icon: Bell },
    { name: 'Profile', path: '/super-admin/profile', icon: User },
  ];

  return (
    <aside className="w-60 bg-sidebar-bg backdrop-blur-2xl flex flex-col border-r border-white/10 h-screen fixed left-0 top-0 z-30 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 gap-[12px] flex-shrink-0">
        <img src="/rentalyze-logo.jpg" alt="Rentalyze Logo" className="h-[44px] w-auto max-w-[44px] object-contain mix-blend-screen" />
        <span className="text-[28px] font-[700] tracking-[0.5px] text-white whitespace-nowrap">RENTALYZE</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-1 ring-white/10'
                    : 'text-sidebar-text hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.name}</span>
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
