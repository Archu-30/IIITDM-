import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { toastSuccess, toastError } from '../components/Toast';

export default function AdminLeaseInformation({ user, onLogout }) {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leases');
      setLeases(res.data);
    } catch (err) {
      console.error(err);
      toastError('Failed to load leases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    let payload = { status: newStatus };
    if (newStatus === 'approved') {
      const warehouseId = window.prompt('Enter the Warehouse ID to assign to this lease:');
      if (!warehouseId) return; // Cancelled
      payload.assigned_warehouse = warehouseId;
    } else if (newStatus === 'rejected') {
      const reason = window.prompt('Enter the reason for rejection:');
      if (!reason) return; // Cancelled
      payload.rejection_reason = reason;
    }

    try {
      await api.patch(`/leases/${id}/status`, payload);
      toastSuccess(`Lease status updated to ${newStatus}`);
      fetchLeases();
    } catch (err) {
      console.error(err);
      toastError('Failed to update lease status');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Lease Information</h1>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">
                    <th className="p-4 pl-6">Tenant ID</th>
                    <th className="p-4">Lease Plan</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Period</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {leases.map((lease) => (
                    <tr key={lease.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6 font-mono text-xs text-slate-500">{lease.tenant_id}</td>
                      <td className="p-4 font-semibold text-slate-800">{lease.plan || 'Custom'}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          lease.status === 'approved' 
                            ? 'bg-green-50 text-green-600' 
                            : lease.status === 'rejected'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          {lease.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {lease.start_date} to {lease.end_date || 'Ongoing'}
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        {lease.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(lease.id, 'approved')}
                              className="px-2.5 py-1 text-xs font-bold text-green-600 border border-green-500/20 hover:bg-green-50 rounded-lg cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(lease.id, 'rejected')}
                              className="px-2.5 py-1 text-xs font-bold text-rose-500 border border-rose-500/20 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && leases.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No leases registered in the system.</td>
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
