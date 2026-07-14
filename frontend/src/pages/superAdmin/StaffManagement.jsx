import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import api from '../../api/axios';
import { toastError } from '../../components/Toast';

export default function StaffManagement({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/users');
      // Filter out admins and superadmins to show staff/general users
      const staffList = res.data.filter(u => u.role !== 'super_admin');
      setUsers(staffList);
    } catch (err) {
      console.error(err);
      toastError('Failed to load users/staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SuperAdminSidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Staff Management</h1>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">
                    <th className="p-4 pl-6">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {users.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6 font-semibold text-slate-800">{item.name}</td>
                      <td className="p-4 text-slate-500">{item.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          item.role === 'admin' 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {item.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(item.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                  {!loading && users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">No staff users found.</td>
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
