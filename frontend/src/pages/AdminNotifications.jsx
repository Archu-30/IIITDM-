import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import { Bell } from 'lucide-react';

export default function AdminNotifications({ user, onLogout }) {
  const [logs, setLogs] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/my');
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Notifications</h1>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <Bell size={18} className="text-slate-500" />
              <span>System Feed</span>
            </h2>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
              {logs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/40 relative">
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.type === 'maintenance' || log.type === 'lease_rejection'
                        ? 'bg-rose-50 text-rose-600' 
                        : log.type === 'promotion' || log.type === 'lease_approval'
                        ? 'bg-indigo-50 text-indigo-600'
                        : log.type === 'low_stock'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {log.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.created_at || log.sent_at).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 mt-2">{log.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{log.message}</p>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center text-sm text-slate-400 py-8">No notifications found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
