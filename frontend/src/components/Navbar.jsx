import React, { useEffect, useState, useRef } from 'react';
import { LogOut, Warehouse, Bell, Package, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../api/axios';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  // Fetch notification inbox when bell opens
  const handleBellClick = () => {
    if (!bellOpen) {
      markAllRead();
    }
    setBellOpen(o => !o);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    navigate('/login');
  };

  const isCustomer = user?.role === 'customer';

  return (
    <nav className="sticky top-0 z-40 bg-slate-900 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">

          {/* Left Side */}
          <div className="flex items-center h-full">
            {/* Branding Section */}
            <div className="flex items-center group cursor-pointer" style={{ minWidth: '220px', paddingLeft: '24px' }}>
              <img 
                src="/rentalyze-logo.jpg" 
                alt="Rentalyze Logo" 
                className="h-[42px] sm:h-[48px] w-auto object-contain mix-blend-screen group-hover:scale-[1.03] transition-transform duration-300"
              />
              <span className="text-[20px] sm:text-[24px] font-[800] tracking-[0.8px] text-white whitespace-nowrap ml-[14px] group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all duration-300">
                RENTALYZE
              </span>
            </div>

            {/* Vertical Divider (only visible if there are nav items, e.g. for customers) */}
            {isCustomer && (
              <div className="h-[70%] w-[1px] ml-[24px] mr-[24px]" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}></div>
            )}

            {/* Navigation tabs — only shown for customers */}
            {isCustomer && (
              <div className="flex items-center space-x-2">
                <NavLink
                  to="/customer/inventory"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`
                  }
                >
                  Inventory
                </NavLink>
                <NavLink
                  to="/customer/my-orders"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${isActive ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`
                  }
                >
                  <Package size={14} />
                  <span>My Orders</span>
                </NavLink>
                <NavLink
                  to="/customer/contact-leasing"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`
                  }
                >
                  Contact & Leasing
                </NavLink>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={handleBellClick}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {bellOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
                    <button onClick={() => setBellOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <Bell size={24} className="text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={`px-4 py-3 border-b border-slate-50 last:border-b-0 cursor-pointer transition-colors hover:bg-slate-50 ${n.is_read ? '' : 'bg-blue-50/40'}`}
                        >
                          <p className="text-xs font-bold text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Badge */}
            <div className="flex items-center space-x-2 text-slate-300">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-primary font-semibold border border-slate-700">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{user?.name || 'User'}</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
