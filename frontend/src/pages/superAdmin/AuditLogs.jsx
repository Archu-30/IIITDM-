import React, { useState, useEffect } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import api from '../../api/axios';
import { toastError } from '../../components/Toast';

export default function AuditLogs({ user, onLogout }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/audit-logs');
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      toastError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SuperAdminSidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">System Audit Logs</h1>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">
                    <th className="p-4 pl-6">Time</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Module</th>
                    <th className="p-4">Details</th>
                    <th className="p-4 pr-6">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6 text-slate-400 font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{log.user_name}</td>
                      <td className="p-4">
                        <span className="inline-flex px-2 py-0.5 rounded font-mono text-xs font-bold bg-slate-100 text-slate-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-semibold">{log.module}</td>
                      <td className="p-4 text-slate-600 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="p-4 pr-6 text-slate-400 font-mono text-xs">{log.ip_address}</td>
                    </tr>
                  ))}
                  {!loading && logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">No audit logs found.</td>
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
