import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import api from '../../api/axios';
import { toastSuccess, toastError } from '../../components/Toast';
import { Send, Bell } from 'lucide-react';

export default function Notifications({ user, onLogout }) {
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', type: 'general', recipient_count: '25' });
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/super-admin/notifications');
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      toastError('Title and message are required');
      return;
    }

    try {
      setLoading(true);
      await api.post('/super-admin/notifications', {
        ...form,
        recipient_count: parseInt(form.recipient_count) || 25
      });
      toastSuccess('Notification broadcasted successfully');
      setForm({ title: '', message: '', type: 'general', recipient_count: '25' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
      toastError('Failed to broadcast notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SuperAdminSidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">System Notifications Center</h1>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Area */}
          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm self-start">
            <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <Send size={18} className="text-primary" />
              <span>Broadcast Announcement</span>
            </h2>

            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Scheduled Platform Maintenance"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Enter details for the broadcast announcement..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 h-28 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Alert Category</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2"
                  >
                    <option value="general">General Broadcast</option>
                    <option value="maintenance">Maintenance Alert</option>
                    <option value="promotion">System Update</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Estimated Recipients</label>
                  <input
                    type="number"
                    value={form.recipient_count}
                    onChange={(e) => setForm({ ...form, recipient_count: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg transition duration-150 text-sm mt-4 cursor-pointer"
              >
                <span>Broadcast Alert</span>
              </button>
            </form>
          </div>

          {/* History Logs */}
          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm self-start">
            <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <Bell size={18} className="text-slate-500" />
              <span>Notification Logs</span>
            </h2>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {logs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/40 relative">
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.type === 'maintenance' 
                        ? 'bg-rose-50 text-rose-600' 
                        : log.type === 'promotion'
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.created_at || log.sent_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 mt-2">{log.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{log.message}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-3 text-right">
                    Sent to {log.recipient_count} recipients
                  </p>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center text-sm text-slate-400 py-8">No previous broadcasts.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
