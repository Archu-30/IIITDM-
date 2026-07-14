import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import api from '../../api/axios';
import { toastSuccess, toastError } from '../../components/Toast';

export default function TenantManagement({ user, onLogout }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/tenants');
      setTenants(res.data);
    } catch (err) {
      console.error(err);
      toastError('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const toggleStatus = async (tenant) => {
    const newStatus = tenant.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/super-admin/tenants/${tenant.id}/status`, { status: newStatus });
      toastSuccess(`Tenant status updated to ${newStatus}`);
      fetchTenants();
    } catch (err) {
      console.error(err);
      toastError('Failed to update tenant status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SuperAdminSidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Tenant Management</h1>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">
                    <th className="p-4 pl-6">Tenant Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Registered On</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6 font-semibold text-slate-800">{tenant.name}</td>
                      <td className="p-4 text-slate-500">{tenant.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          tenant.status === 'inactive' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {tenant.status || 'active'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(tenant.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => toggleStatus(tenant)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            tenant.status === 'inactive'
                              ? 'text-green-600 border-green-500/20 hover:bg-green-50'
                              : 'text-rose-500 border-rose-500/20 hover:bg-rose-50'
                          }`}
                        >
                          {tenant.status === 'inactive' ? 'Activate / Unsuspend' : 'Suspend / Inactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && tenants.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">No tenants registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
