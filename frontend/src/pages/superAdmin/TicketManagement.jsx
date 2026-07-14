import React, { useState } from 'react';
import SuperAdminSidebar from '../../components/SuperAdminSidebar';
import { toastSuccess } from '../../components/Toast';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

export default function TicketManagement({ user, onLogout }) {
  const [tickets, setTickets] = useState([
    { id: 'TCK-401', user: 'Admin (FastCargo)', subject: 'Billing Issue - Double Charge', priority: 'high', status: 'open', date: '2026-06-22' },
    { id: 'TCK-402', user: 'Tenant (John Doe)', subject: 'Warehouse Gate Access Code Failed', priority: 'medium', status: 'in-progress', date: '2026-06-21' },
    { id: 'TCK-403', user: 'Staff (Jane Smith)', subject: 'Barcode Scanner App Sync Issue', priority: 'low', status: 'resolved', date: '2026-06-19' },
  ]);

  const updateStatus = (id, status) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    toastSuccess(`Ticket status set to ${status}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SuperAdminSidebar user={user} onLogout={onLogout} />

      <div className="flex-1 pl-60">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Support Ticket Management</h1>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">
                    <th className="p-4 pl-6">Ticket ID</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6 font-mono font-semibold text-slate-700">{t.id}</td>
                      <td className="p-4 text-slate-800 font-semibold">{t.user}</td>
                      <td className="p-4 text-slate-500">{t.subject}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                          t.priority === 'high' 
                            ? 'bg-rose-50 text-rose-600' 
                            : t.priority === 'medium'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          t.status === 'open' 
                            ? 'bg-red-50 text-red-600' 
                            : t.status === 'in-progress'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-green-50 text-green-600'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right space-x-1.5">
                        {t.status !== 'resolved' && (
                          <>
                            <button
                              onClick={() => updateStatus(t.id, 'in-progress')}
                              className="px-2.5 py-1 text-xs font-bold text-amber-600 border border-amber-500/20 hover:bg-amber-50 rounded-lg cursor-pointer"
                            >
                              In Progress
                            </button>
                            <button
                              onClick={() => updateStatus(t.id, 'resolved')}
                              className="px-2.5 py-1 text-xs font-bold text-green-600 border border-green-500/20 hover:bg-green-50 rounded-lg cursor-pointer"
                            >
                              Resolve
                            </button>
                          </>
                        )}
                        {t.status === 'resolved' && (
                          <span className="text-slate-400 text-xs font-semibold">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
