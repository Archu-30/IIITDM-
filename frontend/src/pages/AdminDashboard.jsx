import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { toastError } from '../components/Toast';
import { IllustrationWrapper } from '../components/illustrations/IllustrationWrapper';
import { InventoryCrates, CrystalCoin, EmptyCrate, LowStockGauge } from '../components/illustrations/KpiIllustrations';
import { 
  Package, 
  TrendingUp, 
  AlertCircle, 
  AlertTriangle, 
  Clock 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';

export default function AdminDashboard({ user, onLogout }) {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    outOfStockItems: 0,
    lowStockItems: 0,
  });

  const [topItemsData, setTopItemsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all stock items for metrics and charts
      const stockRes = await api.get('/stock', { params: { limit: 1000 } });
      const items = stockRes.data.items || [];

      // Compute Stats
      const totalItems = items.length;
      const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const outOfStockItems = items.filter(item => item.quantity === 0).length;
      const lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= 10).length;

      setStats({
        totalItems,
        totalValue,
        outOfStockItems,
        lowStockItems,
      });

      // Charts 1: Top 8 items by quantity
      const sortedByQty = [...items]
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 8)
        .map(item => ({
          name: item.name.length > 12 ? `${item.name.substring(0, 10)}...` : item.name,
          quantity: item.quantity
        }));
      setTopItemsData(sortedByQty);

      // Charts 2: Items by category
      const categoryCounts = items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      const pieData = Object.keys(categoryCounts).map(cat => ({
        name: cat,
        value: categoryCounts[cat]
      }));
      setCategoryData(pieData);

      // Fetch recent 10 transactions
      const transRes = await api.get('/transactions', { params: { limit: 10 } });
      setRecentTransactions(transRes.data.transactions || []);

    } catch (err) {
      console.error(err);
      toastError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format currency (INR)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Pie chart colors
  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

  // Helper to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Framer Motion variants for stagger layout
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-slate-50 flex"
    >
      {/* Navigation Sidebar */}
      <Sidebar user={user} onLogout={onLogout} />

      {/* Main Content Area */}
      <div className="flex-1 pl-60">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Good morning, {user?.name || 'Admin'}
            </h1>
          </div>
          <div className="text-sm font-semibold text-slate-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </header>

        {/* Dash Container */}
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          
          {/* Metrics Stats Row with Staggered entrance */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            
            {/* Stat Card 1 */}
            <motion.div variants={itemVariants} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100/80 flex items-center space-x-5 hover:shadow-md transition duration-300">
              <IllustrationWrapper gradient={['#6366f1', '#a855f7']}>
                <InventoryCrates />
              </IllustrationWrapper>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Stock Items</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tight">{stats.totalItems}</h3>
              </div>
            </motion.div>

            {/* Stat Card 2 */}
            <motion.div variants={itemVariants} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100/80 flex items-center space-x-5 hover:shadow-md transition duration-300">
              <IllustrationWrapper gradient={['#10b981', '#06b6d4']}>
                <CrystalCoin />
              </IllustrationWrapper>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Inventory Value</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1 tracking-tight">{formatPrice(stats.totalValue)}</h3>
              </div>
            </motion.div>

            {/* Stat Card 3 */}
            <motion.div variants={itemVariants} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100/80 flex items-center space-x-5 hover:shadow-md transition duration-300">
              <IllustrationWrapper gradient={['#ef4444', '#f43f5e']}>
                <EmptyCrate />
              </IllustrationWrapper>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Out of Stock Items</p>
                <h3 className="text-3xl font-black text-rose-600 mt-1 tracking-tight">{stats.outOfStockItems}</h3>
              </div>
            </motion.div>

            {/* Stat Card 4 */}
            <motion.div variants={itemVariants} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100/80 flex items-center space-x-5 hover:shadow-md transition duration-300">
              <IllustrationWrapper gradient={['#f59e0b', '#f97316']}>
                <LowStockGauge />
              </IllustrationWrapper>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Items</p>
                <h3 className="text-3xl font-black text-amber-600 mt-1 tracking-tight">{stats.lowStockItems}</h3>
              </div>
            </motion.div>
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Bar Chart: Stock Levels */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
            >
              <h4 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Top 8 Items by Quantity</h4>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topItemsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#F8FAFC'}} />
                    <Bar dataKey="quantity" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Pie Chart: Categories Distribution */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
            >
              <h4 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Products by Category</h4>
              <div className="h-80 w-full flex flex-col md:flex-row items-center justify-center">
                {categoryData.length > 0 ? (
                  <>
                    <div className="h-60 w-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Custom Legend */}
                    <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 mt-4 md:mt-0 px-4">
                      {categoryData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center space-x-2">
                          <span 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                          />
                          <span className="text-xs font-semibold text-slate-600 truncate max-w-[100px]">
                            {entry.name} ({entry.value})
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">No categories data.</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity Logs */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Clock size={16} className="text-slate-400" />
                <span>Recent Stock Activity Logs</span>
              </h4>
            </div>

            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => {
                let badgeClass = '';
                let badgeLabel = '';

                switch (tx.action) {
                  case 'created':
                    badgeClass = 'bg-green-100 text-green-800 border-green-200';
                    badgeLabel = 'Created';
                    break;
                  case 'updated':
                    badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
                    badgeLabel = 'Updated';
                    break;
                  case 'restocked':
                    badgeClass = 'bg-cyan-100 text-cyan-800 border-cyan-200';
                    badgeLabel = 'Restocked';
                    break;
                  case 'deleted':
                    badgeClass = 'bg-red-100 text-red-800 border-red-200';
                    badgeLabel = 'Deleted';
                    break;
                  default:
                    badgeClass = 'bg-slate-100 text-slate-800 border-slate-200';
                    badgeLabel = tx.action;
                }

                return (
                  <div key={tx.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between text-sm hover:bg-slate-50/50 transition">
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border uppercase ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                      <div>
                        <span className="font-bold text-slate-800">{tx.item_name}</span>
                        <span className="text-xs text-slate-400 font-medium ml-2">
                          (Qty Change: {tx.old_quantity} &rarr; {tx.new_quantity})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 md:mt-0 text-xs text-slate-500 font-medium justify-between md:justify-end">
                      <span>Changed by: <strong className="text-slate-600">{tx.changed_by_name}</strong></span>
                      <span className="font-mono text-slate-400">{formatTimeAgo(tx.created_at || tx.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
              {recentTransactions.length === 0 && (
                <div className="px-6 py-8 text-center text-xs text-slate-400 italic">
                  No transaction log activities reported yet.
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
