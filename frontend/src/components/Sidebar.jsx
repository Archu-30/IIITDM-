import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { PremiumIcon } from './PremiumIcon';
import { KPI_ICONS } from './IconMapping';
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
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, gradient: ['#3b82f6', '#06b6d4'] }, // Default Azure
    { name: 'Inventory', path: '/admin/inventory', icon: Package, gradient: KPI_ICONS.inventory.gradient },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag, gradient: KPI_ICONS.orders.gradient },
    { name: 'Transactions', path: '/admin/transactions', icon: ArrowLeftRight, gradient: KPI_ICONS.transactions.gradient },
    { name: 'Lease Information', path: '/admin/lease-information', icon: FileText, gradient: KPI_ICONS.lease.gradient },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell, gradient: KPI_ICONS.notifications.gradient },
  ];

  return (
    <motion.aside 
      initial={{ x: -240, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-60 bg-sidebar-bg backdrop-blur-2xl flex flex-col border-r border-white/10 h-screen fixed left-0 top-0 z-30 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
    >
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
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
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
