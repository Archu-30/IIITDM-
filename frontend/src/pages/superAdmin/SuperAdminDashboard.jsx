import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import api from '../../api/axios';
import { toastError } from '../../components/Toast';
import { IllustrationWrapper } from '../../components/illustrations/IllustrationWrapper';
import { 
  FuturisticTowers, 
  PremiumShield, 
  ConnectedBuildings, 
  LogisticsWarehouse, 
  CrystalFolders, 
  CrystalVault, 
  ConnectedTeam, 
  CrystalWallet, 
  FloatingTicket 
} from '../../components/illustrations/KpiIllustrations';
import { KPI_ICONS } from '../../components/IconMapping';
import { 
  Building2, 
  ShieldAlert, 
  Users, 
  Warehouse, 
  FileText, 
  CreditCard, 
  UserCheck, 
  AlertTriangle, 
  Ticket,
  TrendingUp,
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function SuperAdminDashboard({ user, onLogout }) {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalAdmins: 0,
    totalTenants: 0,
    totalWarehouses: 0,
    activeLeases: 0,
    totalRevenue: 0,
    totalStaff: 12,
    pendingPayments: 8,
    openTickets: 5
  });

  const [revenueData, setRevenueData] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, revRes, orgsRes, adminsRes] = await Promise.all([
        api.get('/super-admin/stats'),
        api.get('/super-admin/revenue'),
        api.get('/super-admin/organizations'),
        api.get('/super-admin/admins')
      ]);

      setStats(statsRes.data);
      setRevenueData(revRes.data.monthlyRevenue || []);
      setOrgs((orgsRes.data || []).slice(0, 5));
      setAdmins((adminsRes.data || []).slice(0, 5));
    } catch (err) {
      console.error(err);
      toastError('Failed to load system-wide dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const warehouseOccupancyData = [
    { name: 'Occupied', value: 65 },
    { name: 'Vacant', value: 35 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SuperAdminSidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Platform Overview, {user?.name || 'Super Admin'}
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

        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* 9 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100/80 flex items-center space-x-4 hover:shadow-md transition duration-300">
              <IllustrationWrapper gradient={KPI_ICONS.organizations.gradient}>
                <FuturisticTowers />
              </IllustrationWrapper>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Organizations</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5 tracking-tight">{stats.totalOrganizations}</h3>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100/80 flex items-center space-x-4 hover:shadow-md transition duration-300">
              <IllustrationWrapper gradient={KPI_ICONS.admins.gradient}>
                <PremiumShield />
              </IllustrationWrapper>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Admins</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5 tracking-tight">{stats.totalAdmins}</h3>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100/80 flex items-center space-x-4 hover:shadow-md transition duration-300">
              <IllustrationWrapper gradient={KPI_ICONS.customers.gradient}>
                <ConnectedBuildings />
              </IllustrationWrapper>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tenants</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5 tracking-tight">{stats.totalTenants}</h3>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100/80 flex items-center space-x-4 hover:shadow-md transition duration-300">
              <IllustrationWrapper gradient={KPI_ICONS.warehouse.gradient}>
                <LogisticsWarehouse />
              </IllustrationWrapper>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Warehouses</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5 tracking-tight">{stats.totalWarehouses}</h3>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100/80 flex items-center space-x-4 hover:shadow-md transition duration-300">
              <IllustrationWrapper gradient={KPI_ICONS.lease.gradient}>
                <CrystalFolders />
              </IllustrationWrapper>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Leases</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5 tracking-tight">{stats.activeLeases}</h3>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100/80 flex items-center space-x-4 hover:shadow-md transition duration-300">
              <IllustrationWrapper gradient={KPI_ICONS.payments.gradient}>
                <CrystalVault />
              </IllustrationWrapper>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-xl font-black text-slate-800 mt-0.5 tracking-tight">{formatPrice(stats.totalRevenue)}</h3>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100/80 flex items-center space-x-4 hover:shadow-md transition duration-300">
              <IllustrationWrapper gradient={KPI_ICONS.customers.gradient}>
                <ConnectedTeam />
              </IllustrationWrapper>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Staff</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5 tracking-tight">{stats.totalStaff}</h3>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100/80 flex items-center space-x-4 hover:shadow-md transition duration-300">
              <IllustrationWrapper gradient={['#f59e0b', '#f97316']}>
                <CrystalWallet />
              </IllustrationWrapper>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Dues Pending</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5 tracking-tight">{stats.pendingPayments}</h3>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100/80 flex items-center space-x-4 hover:shadow-md transition duration-300">
              <IllustrationWrapper gradient={['#ef4444', '#f43f5e']}>
                <FloatingTicket />
              </IllustrationWrapper>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Open Tickets</p>
                <h3 className="text-2xl font-black text-rose-600 mt-0.5 tracking-tight">{stats.openTickets}</h3>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800">Monthly Revenue Trend</h2>
                <div className="flex items-center space-x-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
                  <TrendingUp size={14} />
                  <span>+12.4% MoM</span>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Actual Revenue" />
                    <Bar dataKey="target" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-base font-bold text-slate-800 mb-4">Warehouse Occupancy</h2>
              <div className="h-60 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={warehouseOccupancyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {warehouseOccupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-xs font-medium text-slate-400 mt-2">
                Occupancy rate: <span className="font-bold text-slate-800">65%</span> (across all systems)
              </div>
            </div>
          </div>

          {/* Bottom Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organizations */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-base font-bold text-slate-800 mb-4">Recent Organizations</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Location</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {orgs.map(org => (
                      <tr key={org.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-slate-700">{org.name}</td>
                        <td className="py-3 text-slate-500">{org.location}</td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                            org.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {org.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orgs.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-slate-400">No organizations registered yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Admins */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-base font-bold text-slate-800 mb-4">System Admins</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {admins.map(admin => (
                      <tr key={admin.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-slate-700">{admin.name}</td>
                        <td className="py-3 text-slate-500">{admin.email}</td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                            admin.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {admin.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {admins.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-slate-400">No admins created yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
