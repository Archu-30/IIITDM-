import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  LogOut, 
  Warehouse, 
  FileText, 
  Bell,
  ShoppingBag
} from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();      // clears AuthContext, localStorage, sessionStorage, axios header
    if (onLogout) onLogout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/admin/inventory', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Transactions', path: '/admin/transactions', icon: ArrowLeftRight },
    { name: 'Lease Information', path: '/admin/lease-information', icon: FileText },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  ];

  return (
    <motion.aside 
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-60 bg-sidebar-bg backdrop-blur-2xl flex flex-col border-r border-white/10 h-screen fixed left-0 top-0 z-30 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 gap-[12px]">
        <img src="/rentalyze-logo.jpg" alt="Rentalyze Logo" className="h-[44px] w-auto max-w-[44px] object-contain mix-blend-screen" />
        <span className="text-[28px] font-[700] tracking-[0.5px] text-white whitespace-nowrap">RENTALYZE</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${
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

      {/* User Footer info */}
      <div className="p-4 border-t border-white/10 space-y-3 bg-black/10">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-sidebar-text truncate capitalize font-medium">{user?.role || 'administrator'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}
