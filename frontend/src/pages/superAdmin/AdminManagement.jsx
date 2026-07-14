import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import api from '../../api/axios';
import { toastSuccess, toastError } from '../../components/Toast';
import Modal from '../../components/Modal';
import { Plus, UserCheck, ShieldAlert, Key } from 'lucide-react';

export default function AdminManagement({ user, onLogout }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/admins');
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
      toastError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toastError('All fields are required');
      return;
    }

    try {
      await api.post('/super-admin/admins', form);
      toastSuccess('Admin created successfully');
      setIsModalOpen(false);
      fetchAdmins();
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const toggleStatus = async (admin) => {
    const newStatus = admin.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/super-admin/admins/${admin.id}/status`, { status: newStatus });
      toastSuccess(`Admin status updated to ${newStatus}`);
      fetchAdmins();
    } catch (err) {
      console.error(err);
      toastError('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SuperAdminSidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Admin Management</h1>
          </div>
          <button
            onClick={() => {
              setForm({ name: '', email: '', password: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Admin</span>
          </button>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">
                    <th className="p-4 pl-6">Admin Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6 font-semibold text-slate-800">{admin.name}</td>
                      <td className="p-4 text-slate-500">{admin.email}</td>
                      <td className="p-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {admin.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          admin.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {admin.status || 'active'}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          onClick={() => toggleStatus(admin)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            admin.status === 'active'
                              ? 'text-rose-500 border-rose-500/20 hover:bg-rose-50'
                              : 'text-green-600 border-green-500/20 hover:bg-green-50'
                          }`}
                        >
                          {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && admins.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">No admin accounts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Admin Account">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 font-medium text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 font-medium text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Temporary Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 font-medium text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg transition duration-150 text-sm mt-2 cursor-pointer"
          >
            Create Admin
          </button>
        </form>
      </Modal>
    </div>
  );
}
