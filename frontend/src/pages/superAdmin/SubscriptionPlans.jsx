import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import api from '../../api/axios';
import { toastSuccess, toastError } from '../../components/Toast';
import Modal from '../../components/Modal';
import { Plus, Edit2, Trash2, Award } from 'lucide-react';

export default function SubscriptionPlans({ user, onLogout }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [form, setForm] = useState({
    name: '',
    price: '',
    billing_cycle: 'monthly',
    max_warehouses: '',
    max_admins: '',
    max_tenants: '',
    features: ''
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/subscriptions');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
      toastError('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toastError('Name and price are required');
      return;
    }

    try {
      if (modalMode === 'create') {
        await api.post('/super-admin/subscriptions', form);
        toastSuccess('Subscription plan created successfully');
      } else {
        await api.put(`/super-admin/subscriptions/${selectedPlan.id}`, form);
        toastSuccess('Subscription plan updated successfully');
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error(err);
      toastError('Failed to save subscription plan');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await api.delete(`/super-admin/subscriptions/${id}`);
      toastSuccess('Plan deleted successfully');
      fetchPlans();
    } catch (err) {
      console.error(err);
      toastError('Failed to delete plan');
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setForm({
      name: '',
      price: '',
      billing_cycle: 'monthly',
      max_warehouses: '5',
      max_admins: '2',
      max_tenants: '20',
      features: 'Full Inventory Tracking, API Access, Email Support'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setModalMode('edit');
    setSelectedPlan(plan);
    setForm({
      name: plan.name,
      price: plan.price.toString(),
      billing_cycle: plan.billing_cycle,
      max_warehouses: plan.max_warehouses.toString(),
      max_admins: plan.max_admins.toString(),
      max_tenants: plan.max_tenants.toString(),
      features: plan.features
    });
    setIsModalOpen(true);
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
      <SuperAdminSidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Subscription Plans</h1>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Plan</span>
          </button>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-slate-100 hover:text-slate-500">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><Award size={20} /></div>
                    <h3 className="font-bold text-slate-800 text-lg">{plan.name}</h3>
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold text-slate-850">{formatPrice(plan.price)}</span>
                    <span className="text-slate-400 text-xs font-semibold uppercase ml-1">/ {plan.billing_cycle}</span>
                  </div>
                  
                  <div className="space-y-2 pt-2 text-sm text-slate-650">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-400">Max Warehouses:</span>
                      <span className="font-bold text-slate-700">{plan.max_warehouses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-400">Max Admins:</span>
                      <span className="font-bold text-slate-700">{plan.max_admins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-400">Max Tenants:</span>
                      <span className="font-bold text-slate-700">{plan.max_tenants}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Features</p>
                    <ul className="text-xs space-y-1.5 text-slate-600">
                      {plan.features.split(',').map((f, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                          <span>{f.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Create Subscription Plan' : 'Edit Subscription Plan'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Plan Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Price (INR)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Warehouses</label>
              <input
                type="number"
                value={form.max_warehouses}
                onChange={(e) => setForm({ ...form, max_warehouses: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Admins</label>
              <input
                type="number"
                value={form.max_admins}
                onChange={(e) => setForm({ ...form, max_admins: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Tenants</label>
              <input
                type="number"
                value={form.max_tenants}
                onChange={(e) => setForm({ ...form, max_tenants: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Billing Cycle</label>
            <select
              value={form.billing_cycle}
              onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Features (comma separated)</label>
            <input
              type="text"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg transition duration-150 text-sm mt-2 cursor-pointer"
          >
            {modalMode === 'create' ? 'Create Plan' : 'Update Plan'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
