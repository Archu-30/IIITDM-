import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import api from '../api/axios';
import { toastSuccess, toastError } from '../components/Toast';
import { Plus, Users, UserPlus, ShieldAlert, Key } from 'lucide-react';

export default function AdminUsers({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
      toastError('Failed to fetch user list');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddUser = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('customer');
    setModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      toastError('Please fill in all fields');
      return;
    }

    try {
      await api.post('/users', { name, email, password, role });
      toastSuccess('User account registered successfully');
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to create user account');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar user={user} onLogout={onLogout} />

      {/* Main Content Area */}
      <div className="flex-1 pl-60">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-slate-800">User Management</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-850 border border-slate-205 font-mono">
              {users.length} users
            </span>
          </div>
          <button
            onClick={handleOpenAddUser}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-md shadow-primary/10 transition cursor-pointer"
          >
            <UserPlus size={16} />
            <span>Add User</span>
          </button>
        </header>

        {/* Users Table List */}
        <div className="p-8 max-w-7xl mx-auto">
          
          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50/70">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User Profile</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Access Role</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map((u) => {
                  const isAdmin = u.role === 'admin';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      
                      {/* Name / Avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isAdmin 
                              ? 'bg-blue-50 text-primary border border-blue-100' 
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-slate-800">{u.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-650">
                        {u.email}
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          isAdmin 
                            ? 'bg-blue-50 text-primary border-blue-150' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {isAdmin ? 'Admin' : 'Customer'}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* MODAL: ADD USER */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New User Account"
      >
        <form onSubmit={handleCreateUser} className="space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Test Customer"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@inventory.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Key size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Access Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-700 bg-white cursor-pointer"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-md cursor-pointer"
            >
              Create Account
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
}
