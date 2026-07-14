import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import api from '../../api/axios';
import { toastSuccess, toastError } from '../../components/Toast';
import Modal from '../../components/Modal';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function Organizations({ user, onLogout }) {
  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', status: 'active' });

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/organizations', { params: { search } });
      setOrgs(res.data);
    } catch (err) {
      console.error(err);
      toastError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location) {
      toastError('Please fill in all fields');
      return;
    }

    try {
      if (modalMode === 'create') {
        await api.post('/super-admin/organizations', form);
        toastSuccess('Organization created successfully');
      } else {
        await api.put(`/super-admin/organizations/${selectedOrg.id}`, form);
        toastSuccess('Organization updated successfully');
      }
      setIsModalOpen(false);
      fetchOrganizations();
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to save organization');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) return;
    try {
      await api.delete(`/super-admin/organizations/${id}`);
      toastSuccess('Organization deleted successfully');
      fetchOrganizations();
    } catch (err) {
      console.error(err);
      toastError('Failed to delete organization');
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setForm({ name: '', location: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEditModal = (org) => {
    setModalMode('edit');
    setSelectedOrg(org);
    setForm({ name: org.name, location: org.location, status: org.status });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SuperAdminSidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Organizations</h1>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Organization</span>
          </button>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          {/* Search Controls */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search organizations by name or location..."
                className="pl-10 block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition duration-150 text-slate-800 text-sm font-medium"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">
                    <th className="p-4 pl-6">Organization Name</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {orgs.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6 font-semibold text-slate-800">{org.name}</td>
                      <td className="p-4 text-slate-500">{org.location}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          org.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(org)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(org.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && orgs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">No organizations found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Add Organization' : 'Edit Organization'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Organization Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 font-medium text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 font-medium text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-800 font-medium text-sm"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg transition duration-150 text-sm mt-2 cursor-pointer"
          >
            {modalMode === 'create' ? 'Create Organization' : 'Update Organization'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
